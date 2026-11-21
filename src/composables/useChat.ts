import { computed, reactive, ref } from 'vue'
import { createAnthropicTransport } from '../lib/llm/anthropic'
import { createOpenAITransport } from '../lib/llm/openai'
import { getProvider } from '../lib/llm/providers'
import { createServerTransport, detectServer, type ServerInfo } from '../lib/llm/server'
import { toErrorEvent, type ChatMessage, type ChatTransport, type ToolCall } from '../lib/llm/types'
import { VAULT_TOOLS, buildSystemPrompt, executeTool } from '../lib/vaultTools'
import { useChatSettings } from './useChatSettings'
import { useVault } from './useVault'

/**
 * 聊天会话状态机（模块级单例，useVault 风格）：
 * - agent loop 由这里编排（笔记正文只在浏览器端，/api/chat 只是逐请求代理）
 * - 来源链接不依赖模型生成：按 loop 中实际 read_note 过的 id 确定性渲染
 * - 护栏：≤5 轮、已读 id 去重、AbortController 中止
 */

export interface ChatUIMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  /** 本次回答实际读取过的笔记 id（渲染来源 chips）。 */
  sources?: string[]
  error?: string
  streaming?: boolean
}

const MAX_TOOL_ROUNDS = 8
const MAX_HISTORY_TURNS = 6
/** 单次请求里只保留最近 N 条完整工具结果，更早的大结果替换为占位符（模型可重读）。 */
const TOOL_RESULT_KEEP_RECENT = 3
const TOOL_RESULT_COMPACT_MIN = 600
/** protocol 中 user 回合超过此值时，先把最旧的回合摘要化（失败则退回纯截断）。 */
const HISTORY_SUMMARY_THRESHOLD = 10
const HISTORY_KEEP_TURNS = 4

const messages = ref<ChatUIMessage[]>([])
const sending = ref(false)
const panelOpen = ref(false)
/** 工具状态行：正在阅读的笔记标题。 */
const readingTitles = ref<string[]>([])

const serverInfo = ref<ServerInfo>({ available: false })
let probed = false
let msgSeq = 0
let abort: AbortController | null = null

/** 发给 API 的协议历史（含 tool 消息），与 UI 消息平行维护。 */
let protocol: ChatMessage[] = []
/** 早期对话的滚动摘要（见 maybeSummarizeHistory）。 */
let historySummary = ''

function nextId(): number {
  return ++msgSeq
}

function systemPrompt(): string {
  const base = buildSystemPrompt() // vaultTools 内部已 memo 目录
  return historySummary ? `${base}\n\n【此前对话摘要】\n${historySummary}` : base
}

/**
 * 工具结果压缩：单次请求里，除最近 TOOL_RESULT_KEEP_RECENT 条外，
 * 超过 TOOL_RESULT_COMPACT_MIN 字符的 tool 消息替换为一行占位符。
 * 只作用于发给 API 的副本，protocol 本体保留全文。
 */
function compressToolResults(history: ChatMessage[]): ChatMessage[] {
  const toolIdx: number[] = []
  history.forEach((m, i) => {
    if (m.role === 'tool') toolIdx.push(i)
  })
  if (toolIdx.length <= TOOL_RESULT_KEEP_RECENT) return history
  const out = history.slice()
  const cutoff = toolIdx.length - TOOL_RESULT_KEEP_RECENT
  for (let k = 0; k < cutoff; k++) {
    const i = toolIdx[k]
    const m = out[i]
    if (typeof m.content === 'string' && m.content.length > TOOL_RESULT_COMPACT_MIN) {
      const title = /^#\s+([^\n（]+)/.exec(m.content)?.[1]?.trim()
      out[i] = {
        ...m,
        content:
          `[较早的工具结果已省略（原约 ${m.content.length} 字）。` +
          `${title ? `如需笔记「${title}」的内容，` : '如需原文，'}请重新调用相应工具。]`,
      }
    }
  }
  return out
}

/**
 * 历史摘要：user 回合数超阈值时，把最旧的回合（连同既有摘要）交给当前
 * transport 压成一段摘要，protocol 只保留最近 HISTORY_KEEP_TURNS 个回合。
 * 任何失败都静默退回 trimmedHistory 的纯截断行为。
 */
async function maybeSummarizeHistory(
  transport: ChatTransport,
  model: string,
  signal: AbortSignal,
): Promise<void> {
  let turns = 0
  for (const m of protocol) if (m.role === 'user') turns++
  if (turns <= HISTORY_SUMMARY_THRESHOLD) return

  // 切点：保留最近 HISTORY_KEEP_TURNS 个 user 回合（含刚推入的当前问题）
  let seen = 0
  let cut = -1
  for (let i = protocol.length - 1; i >= 0; i--) {
    if (protocol[i].role === 'user') {
      seen++
      if (seen > HISTORY_KEEP_TURNS) {
        cut = i + 1
        break
      }
    }
  }
  if (cut <= 0) return

  const lines: string[] = []
  let total = 0
  for (const m of protocol.slice(0, cut)) {
    let line = ''
    if (m.role === 'user') line = `用户: ${(m.content ?? '').slice(0, 800)}`
    else if (m.role === 'assistant' && m.content) line = `助手: ${m.content.slice(0, 800)}`
    else if (m.role === 'tool') line = '[助手调用了知识库工具]'
    if (!line) continue
    total += line.length
    if (total > 8000) {
      lines.push('……（更早内容省略）')
      break
    }
    lines.push(line)
  }

  const prev = historySummary ? `此前的对话摘要：\n${historySummary}\n\n` : ''
  try {
    let summary = ''
    const events = transport.stream({
      messages: [
        {
          role: 'user',
          content:
            `${prev}请把下面的对话记录压缩成一段简洁的中文摘要` +
            `（保留用户问过的问题、得出的结论、引用过的笔记标题），不超过 300 字：\n\n${lines.join('\n')}`,
        },
      ],
      model,
      maxTokens: 512,
      signal,
    })
    for await (const ev of events) {
      if (ev.type === 'text-delta') summary += ev.text
      else if (ev.type === 'error') return // 静默失败
    }
    summary = summary.trim()
    if (summary) {
      historySummary = summary
      protocol = protocol.slice(cut)
    }
  } catch {
    // 摘要调用失败（含用户中止）：维持纯截断
  }
}

/** 历史截断：保留最近 N 个 user 回合；只在 user 消息边界切，保证 tool_call/result 配对完整。 */
function trimmedHistory(maxTurns: number): ChatMessage[] {
  let seen = 0
  for (let i = protocol.length - 1; i >= 0; i--) {
    if (protocol[i].role === 'user') {
      seen++
      if (seen > maxTurns) {
        return protocol.slice(i + 1)
      }
    }
  }
  return protocol
}

function pickTransport():
  | { ok: true; transport: ChatTransport; model: string; via: 'server' | 'direct' }
  | { ok: false; reason: 'no-key' | 'server-down' } {
  const { settings } = useChatSettings()
  const useServer =
    settings.mode === 'server' ||
    (settings.mode === 'auto' && serverInfo.value.available)

  if (settings.mode === 'server' && !serverInfo.value.available) {
    return { ok: false, reason: 'server-down' }
  }
  if (useServer) {
    return {
      ok: true,
      transport: createServerTransport(),
      model: serverInfo.value.model ?? '',
      via: 'server',
    }
  }
  if (!settings.apiKey) return { ok: false, reason: 'no-key' }
  const preset = getProvider(settings.provider)
  const transport =
    preset.api === 'anthropic'
      ? createAnthropicTransport({ baseURL: settings.baseURL, apiKey: settings.apiKey })
      : createOpenAITransport({ baseURL: settings.baseURL, apiKey: settings.apiKey })
  return { ok: true, transport, model: settings.model, via: 'direct' }
}

export function useChat() {
  const { settings } = useChatSettings()

  /** 面板打开时探测一次服务端；失败可在设置里手动重试。 */
  async function ensureProbed(force = false): Promise<void> {
    if (probed && !force) return
    probed = true
    serverInfo.value = await detectServer()
  }

  const activeMode = computed<'server' | 'direct' | 'none'>(() => {
    if (settings.mode === 'server') return serverInfo.value.available ? 'server' : 'none'
    if (settings.mode === 'direct') return settings.apiKey ? 'direct' : 'none'
    // auto
    if (serverInfo.value.available) return 'server'
    return settings.apiKey ? 'direct' : 'none'
  })

  async function send(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed || sending.value) return

    const picked = pickTransport()
    if (!picked.ok) {
      messages.value.push({
        id: nextId(),
        role: 'assistant',
        content: '',
        error: picked.reason, // UI 按 reason 渲染引导文案
      })
      return
    }

    sending.value = true
    abort = new AbortController()
    messages.value.push({ id: nextId(), role: 'user', content: trimmed })
    protocol.push({ role: 'user', content: trimmed })

    const uiMsg = reactive<ChatUIMessage>({
      id: nextId(),
      role: 'assistant',
      content: '',
      streaming: true,
    })
    messages.value.push(uiMsg)

    const readIds = new Set<string>()
    /** 本次提问内已执行过的调用（name+arguments），完全相同的重复调用直接短路。 */
    const calledKeys = new Set<string>()
    let failed = false

    try {
      // 历史过长时先摘要化（内部自行判断阈值，不满足条件立即返回）
      await maybeSummarizeHistory(picked.transport, picked.model, abort.signal)

      for (let round = 1; round <= MAX_TOOL_ROUNDS; round++) {
        const roundCalls: ToolCall[] = []
        let roundText = ''

        const events = picked.transport.stream({
          messages: [
            { role: 'system', content: systemPrompt() },
            ...compressToolResults(trimmedHistory(MAX_HISTORY_TURNS)),
          ],
          tools: VAULT_TOOLS,
          model: picked.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          signal: abort.signal,
        })

        for await (const ev of events) {
          if (ev.type === 'text-delta') {
            roundText += ev.text
            uiMsg.content += ev.text
          } else if (ev.type === 'tool-call') {
            roundCalls.push(ev.call)
          } else if (ev.type === 'error') {
            throw new Error(ev.message)
          }
        }

        if (roundCalls.length === 0) break // 模型给出最终回答

        // 工具回合：记录 assistant 的 tool_calls，本地执行后追加结果
        protocol.push({
          role: 'assistant',
          content: roundText || null,
          toolCalls: roundCalls,
        })
        if (roundText) uiMsg.content += '\n\n'

        for (const call of roundCalls) {
          const callKey = `${call.name}:${call.arguments}`
          let result: string
          if (calledKeys.has(callKey)) {
            result = `TOOL CALL ALREADY MADE: ${call.name}(${call.arguments}). 请基于已有结果继续，或换一个调用。`
          } else {
            result = executeTool(call.name, call.arguments)
            calledKeys.add(callKey)
          }

          // 来源 chips 只统计真正读到的笔记正文
          if (call.name === 'read_note' && !result.startsWith('ERROR')) {
            const noteId = parseNoteId(call.arguments)
            if (noteId) readIds.add(noteId)
          }

          const label = readingLabel(call)
          if (label && !readingTitles.value.includes(label)) {
            readingTitles.value.push(label)
          }
          protocol.push({ role: 'tool', toolCallId: call.id, content: result })
        }
      }
    } catch (err) {
      const errorEvent = toErrorEvent(err)
      if (errorEvent) {
        uiMsg.error = errorEvent.message
        failed = true
      }
      // AbortError：保留已流出的部分内容，不算失败
    } finally {
      uiMsg.streaming = false
      if (readIds.size > 0) uiMsg.sources = [...readIds]
      readingTitles.value = []
      sending.value = false
      abort = null
      if (!failed && (uiMsg.content || uiMsg.sources?.length)) {
        // 最终回答进入协议历史（工具回合的 assistant 消息已在 loop 内追加）
        protocol.push({ role: 'assistant', content: uiMsg.content })
      }
    }
  }

  function stop(): void {
    abort?.abort()
  }

  /** 重试：回滚到上一个 user 消息之前，重新发送。 */
  async function retry(): Promise<void> {
    if (sending.value) return
    const lastUserIdx = findLastUserIndex()
    if (lastUserIdx === -1) return
    const text = messages.value[lastUserIdx].content
    // UI 与协议历史都回滚到该 user 消息之前
    messages.value.splice(lastUserIdx)
    let userSeen = 0
    for (let i = protocol.length - 1; i >= 0; i--) {
      if (protocol[i].role === 'user') userSeen++
      if (userSeen === 1) {
        protocol = protocol.slice(0, i)
        break
      }
    }
    await send(text)
  }

  function findLastUserIndex(): number {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'user') return i
    }
    return -1
  }

  function clear(): void {
    if (sending.value) stop()
    messages.value = []
    protocol = []
    historySummary = ''
  }

  function togglePanel(): void {
    panelOpen.value = !panelOpen.value
    if (panelOpen.value) void ensureProbed()
  }

  return {
    messages,
    sending,
    panelOpen,
    readingTitles,
    serverInfo,
    activeMode,
    ensureProbed,
    send,
    stop,
    retry,
    clear,
    togglePanel,
  }
}

/** 从 read_note 调用参数里取 note_id（解析失败返回空串）。 */
function parseNoteId(argsJson: string): string {
  try {
    const args = JSON.parse(argsJson || '{}') as { note_id?: unknown }
    return typeof args.note_id === 'string' ? args.note_id.trim() : ''
  } catch {
    return ''
  }
}

/** 状态行标签：按工具类型给出可读描述。 */
function readingLabel(call: ToolCall): string {
  if (call.name === 'read_note') {
    const noteId = parseNoteId(call.arguments)
    return noteId ? (useVault().noteMap.get(noteId)?.title ?? noteId) : ''
  }
  if (call.name === 'search_notes') {
    try {
      const q = (JSON.parse(call.arguments || '{}') as { query?: unknown }).query
      return typeof q === 'string' && q ? `搜索「${q}」` : '搜索笔记'
    } catch {
      return '搜索笔记'
    }
  }
  if (call.name === 'list_notes') {
    try {
      const dir = (JSON.parse(call.arguments || '{}') as { dir?: unknown }).dir
      return typeof dir === 'string' && dir ? `浏览目录 ${dir}` : '浏览知识库目录'
    } catch {
      return '浏览知识库目录'
    }
  }
  return call.name
}
