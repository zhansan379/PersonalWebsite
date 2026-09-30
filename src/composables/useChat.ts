import { computed, reactive, ref } from 'vue'
import { createAnthropicTransport } from '../lib/llm/anthropic'
import { createOpenAITransport } from '../lib/llm/openai'
import { getProvider } from '../lib/llm/providers'
import { createServerTransport, detectServer, type ServerInfo } from '../lib/llm/server'
import { toErrorEvent, type ChatMessage, type ChatTransport, type ToolCall } from '../lib/llm/types'
import { READ_NOTE_TOOL, buildSystemPrompt, executeTool } from '../lib/vaultTools'
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

const MAX_TOOL_ROUNDS = 5
const MAX_HISTORY_TURNS = 6

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
let cachedSystemPrompt: string | null = null

function nextId(): number {
  return ++msgSeq
}

function systemPrompt(): string {
  if (!cachedSystemPrompt) cachedSystemPrompt = buildSystemPrompt()
  return cachedSystemPrompt
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
    let failed = false

    try {
      for (let round = 1; round <= MAX_TOOL_ROUNDS; round++) {
        const roundCalls: ToolCall[] = []
        let roundText = ''

        const events = picked.transport.stream({
          messages: [
            { role: 'system', content: systemPrompt() },
            ...trimmedHistory(MAX_HISTORY_TURNS),
          ],
          tools: [READ_NOTE_TOOL],
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
          let noteId = ''
          try {
            noteId = (JSON.parse(call.arguments || '{}') as { note_id?: string }).note_id ?? ''
          } catch {
            // 解析失败时 noteId 为空，走下面的提示分支
          }

          let result: string
          if (noteId && readIds.has(noteId)) {
            result = `NOTE ALREADY READ: "${noteId}". 请基于已读内容作答，或读取其他笔记。`
          } else {
            result = executeTool(call.name, call.arguments)
            if (noteId && !result.startsWith('ERROR')) {
              readIds.add(noteId)
            }
          }

          if (noteId) {
            const title = useVaultTitle(noteId)
            if (title && !readingTitles.value.includes(title)) {
              readingTitles.value.push(title)
            }
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

/** 工具执行时取笔记标题用于状态行展示。 */
function useVaultTitle(id: string): string | undefined {
  return useVault().noteMap.get(id)?.title
}
