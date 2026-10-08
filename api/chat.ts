/**
 * Vercel Edge function：知识库助手的可选服务端代理。
 *
 * - GET  → 探测端点 { ok, provider, model }（未配置 key 时 503）
 * - POST → 接收前端内部协议（messages/tools/temperature/maxTokens），按
 *          LLM_PROVIDER 翻译为 OpenAI 兼容或 Anthropic 上游请求，把上游 SSE
 *          归一化为 NDJSON（每行一个 LLMStreamEvent）回传。agent loop 由
 *          客户端编排，本函数只是逐请求代理。
 *
 * 环境变量（Vercel dashboard 配置，绝不加 VITE_ 前缀）：
 *   LLM_PROVIDER  'openai' | 'anthropic'（默认 'openai'）
 *   LLM_API_KEY   必填，缺失时探测返回 503
 *   LLM_BASE_URL  可空（默认官方端点）
 *   LLM_MODEL     模型名（默认按 provider 给）
 *   CHAT_MAX_TOKENS  可空（默认 2048，服务端钳制上限）
 *
 * 注意：本文件自包含，不 import src/（不在 tsconfig.app 的构建范围内）。
 */

export const config = { runtime: 'edge' }

// ---------------------------------------------------------------------------
// 内部协议类型（与 src/lib/llm/types.ts 保持一致，自包含副本）
// ---------------------------------------------------------------------------
interface ToolCall {
  id: string
  name: string
  arguments: string
}
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  toolCalls?: ToolCall[]
  toolCallId?: string
}
interface ToolDef {
  name: string
  description: string
  parameters: Record<string, unknown>
}
type LLMStreamEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-call'; call: ToolCall }
  | { type: 'done'; stopReason?: string }
  | { type: 'error'; message: string }

interface ChatRequestBody {
  messages: ChatMessage[]
  tools?: ToolDef[]
  temperature?: number
  maxTokens?: number
}

// ---------------------------------------------------------------------------
// 配置与常量
// ---------------------------------------------------------------------------
const MAX_MESSAGES = 40
// read_note 分段返回单段最长 6000 字符，加上标题/进度行仍在 16000 内；
// 前端另有工具结果压缩，正常会话远低于此上限（纯滥用防护）。
const MAX_CONTENT_CHARS = 16000
const MAX_BODY_BYTES = 512 * 1024

/** 工具白名单：schema 由服务端固定，不信客户端（与 src/lib/vaultTools.ts 一致）。 */
const ALLOWED_TOOLS: Record<string, ToolDef> = {
  search_notes: {
    name: 'search_notes',
    description:
      'Search knowledge-base notes by keywords. Returns matching note ids, ' +
      'titles and snippets. Use before read_note to locate relevant notes.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords, e.g. "vue 响应式"' },
        limit: { type: 'number', description: 'Max results, default 8, max 20' },
      },
      required: ['query'],
    },
  },
  list_notes: {
    name: 'list_notes',
    description:
      'Browse the knowledge-base catalog. Without dir, returns a top-level ' +
      'folder overview; with dir, lists notes (id/title/tags/summary) under it.',
    parameters: {
      type: 'object',
      properties: {
        dir: { type: 'string', description: 'Folder path, e.g. "前端开发". Omit for overview.' },
      },
    },
  },
  read_note: {
    name: 'read_note',
    description:
      'Read a knowledge-base note by id. Long notes are returned in segments: ' +
      'use offset/length to continue, or heading to read one section only.',
    parameters: {
      type: 'object',
      properties: {
        note_id: { type: 'string', description: 'Note id, e.g. "前端开发/vue/xxx"' },
        offset: { type: 'number', description: 'Start char offset, default 0' },
        length: { type: 'number', description: 'Chars to read, default 4000, max 6000' },
        heading: { type: 'string', description: 'Read only the section with this heading' },
      },
      required: ['note_id'],
    },
  },
}

const DEFAULT_BASE: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
}
const DEFAULT_MODEL: Record<string, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5-20251001',
}

function env(name: string): string {
  // Edge runtime 下 process.env 由 Vercel 注入
  return (typeof process !== 'undefined' && process.env?.[name]) || ''
}

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------
export default async function handler(req: Request): Promise<Response> {
  const provider = env('LLM_PROVIDER') || 'openai'
  const apiKey = env('LLM_API_KEY')
  const model = env('LLM_MODEL') || DEFAULT_MODEL[provider] || DEFAULT_MODEL.openai

  if (req.method === 'GET') {
    if (!apiKey) {
      return json({ ok: false }, 503)
    }
    return json({ ok: true, provider, model })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405)
  }
  if (!apiKey) {
    return json({ error: 'server not configured' }, 503)
  }

  // ---- 入参校验（滥用防护第 1 档）----
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'request too large' }, 413)
  }
  let body: ChatRequestBody
  try {
    body = JSON.parse(raw) as ChatRequestBody
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: 'messages required' }, 400)
  }
  if (body.messages.length > MAX_MESSAGES) {
    return json({ error: 'too many messages' }, 400)
  }
  for (const m of body.messages) {
    if (typeof m.content === 'string' && m.content.length > MAX_CONTENT_CHARS) {
      return json({ error: 'message content too long' }, 400)
    }
  }
  // 只放行白名单内、客户端确实声明了的工具，schema 以服务端为准
  const requested = new Set((body.tools ?? []).map((t) => t.name))
  const tools: ToolDef[] = Object.values(ALLOWED_TOOLS).filter((t) => requested.has(t.name))

  const maxTokensCap = parseInt(env('CHAT_MAX_TOKENS') || '2048', 10) || 2048
  const maxTokens = Math.min(body.maxTokens ?? maxTokensCap, maxTokensCap)

  // ---- 转发上游并归一化为 NDJSON 事件流 ----
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder()
      const emit = (ev: LLMStreamEvent) =>
        controller.enqueue(enc.encode(JSON.stringify(ev) + '\n'))
      try {
        const upstream =
          provider === 'anthropic'
            ? await fetchAnthropic(body, tools, { apiKey, model, maxTokens })
            : await fetchOpenAI(body, tools, { apiKey, model, maxTokens })
        if (!upstream.ok) {
          const detail = (await upstream.text()).slice(0, 300)
          emit({ type: 'error', message: `upstream ${upstream.status}: ${detail}` })
        } else if (!upstream.body) {
          emit({ type: 'error', message: 'upstream response has no body' })
        } else if (provider === 'anthropic') {
          await pumpAnthropic(upstream.body, emit)
        } else {
          await pumpOpenAI(upstream.body, emit)
        }
      } catch (err) {
        emit({ type: 'error', message: err instanceof Error ? err.message : String(err) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

// ---------------------------------------------------------------------------
// 上游请求构造
// ---------------------------------------------------------------------------
interface UpstreamConfig {
  apiKey: string
  model: string
  maxTokens: number
}

function fetchOpenAI(
  body: ChatRequestBody,
  tools: ToolDef[],
  cfg: UpstreamConfig,
): Promise<Response> {
  const base = (env('LLM_BASE_URL') || DEFAULT_BASE.openai).replace(/\/+$/, '')
  const messages = body.messages.map((m) => {
    if (m.role === 'tool') {
      return { role: 'tool', tool_call_id: m.toolCallId, content: m.content ?? '' }
    }
    if (m.role === 'assistant' && m.toolCalls?.length) {
      return {
        role: 'assistant',
        content: m.content ?? null,
        tool_calls: m.toolCalls.map((c) => ({
          id: c.id,
          type: 'function',
          function: { name: c.name, arguments: c.arguments },
        })),
      }
    }
    return { role: m.role, content: m.content ?? '' }
  })
  return fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      stream: true,
      max_tokens: cfg.maxTokens,
      ...(body.temperature !== undefined ? { temperature: body.temperature } : {}),
      ...(tools.length
        ? {
            tools: tools.map((t) => ({ type: 'function', function: t })),
            tool_choice: 'auto',
          }
        : {}),
    }),
  })
}

function fetchAnthropic(
  body: ChatRequestBody,
  tools: ToolDef[],
  cfg: UpstreamConfig,
): Promise<Response> {
  const base = (env('LLM_BASE_URL') || DEFAULT_BASE.anthropic).replace(/\/+$/, '')
  const system = body.messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content ?? '')
    .join('\n\n')
  const messages = body.messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'user',
          content: [
            { type: 'tool_result', tool_use_id: m.toolCallId, content: m.content ?? '' },
          ],
        }
      }
      if (m.role === 'assistant' && m.toolCalls?.length) {
        const blocks: Array<Record<string, unknown>> = []
        if (m.content) blocks.push({ type: 'text', text: m.content })
        for (const c of m.toolCalls) {
          let input: unknown = {}
          try {
            input = JSON.parse(c.arguments || '{}')
          } catch {
            // 给空对象，避免上游 400
          }
          blocks.push({ type: 'tool_use', id: c.id, name: c.name, input })
        }
        return { role: 'assistant', content: blocks }
      }
      return { role: m.role, content: m.content ?? '' }
    })
  return fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      // system（知识库目录）与工具定义标记 ephemeral，命中上游 prompt cache
      ...(system
        ? {
            system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
          }
        : {}),
      messages,
      stream: true,
      ...(body.temperature !== undefined ? { temperature: body.temperature } : {}),
      ...(tools.length
        ? {
            tools: tools.map((t, i) => ({
              name: t.name,
              description: t.description,
              input_schema: t.parameters,
              ...(i === tools.length - 1 ? { cache_control: { type: 'ephemeral' } } : {}),
            })),
          }
        : {}),
    }),
  })
}

// ---------------------------------------------------------------------------
// 上游 SSE → NDJSON 归一化
// ---------------------------------------------------------------------------
type Emit = (ev: LLMStreamEvent) => void

/** 通用 SSE 行解析：产出每个事件块的 data 内容（含 event 名）。 */
async function* sseEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<{ event?: string; data: string }> {
  const reader = body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx: number
      while ((idx = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, idx)
        buffer = buffer.slice(buffer[idx] === '\r' ? idx + 4 : idx + 2)
        let event: string | undefined
        const data: string[] = []
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith('event:')) event = line.slice(6).trim()
          else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''))
        }
        if (data.length) yield { event, data: data.join('\n') }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function pumpOpenAI(body: ReadableStream<Uint8Array>, emit: Emit): Promise<void> {
  const slots = new Map<number, { id: string; name: string; args: string }>()
  let finish: string | undefined

  for await (const ev of sseEvents(body)) {
    if (ev.data === '[DONE]') break
    let chunk: {
      choices?: Array<{
        delta?: {
          content?: string | null
          tool_calls?: Array<{
            index?: number
            id?: string
            function?: { name?: string; arguments?: string }
          }>
        }
        finish_reason?: string | null
      }>
      error?: { message?: string }
    }
    try {
      chunk = JSON.parse(ev.data)
    } catch {
      continue
    }
    if (chunk.error?.message) {
      emit({ type: 'error', message: chunk.error.message })
      return
    }
    const choice = chunk.choices?.[0]
    if (!choice) continue
    if (choice.delta?.content) emit({ type: 'text-delta', text: choice.delta.content })
    if (choice.delta?.tool_calls) {
      for (const d of choice.delta.tool_calls) {
        const i = d.index ?? 0
        let slot = slots.get(i)
        if (!slot) {
          slot = { id: '', name: '', args: '' }
          slots.set(i, slot)
        }
        if (d.id) slot.id += d.id
        if (d.function?.name) slot.name += d.function.name
        if (d.function?.arguments) slot.args += d.function.arguments
      }
    }
    if (choice.finish_reason) finish = choice.finish_reason
  }

  if (finish === 'tool_calls') {
    for (const [i, s] of [...slots.entries()].sort(([a], [b]) => a - b)) {
      if (!s.name) continue
      emit({
        type: 'tool-call',
        call: { id: s.id || `call_${i}`, name: s.name, arguments: s.args || '{}' },
      })
    }
  }
  emit({ type: 'done', stopReason: finish })
}

async function pumpAnthropic(body: ReadableStream<Uint8Array>, emit: Emit): Promise<void> {
  const toolBlocks = new Map<number, { id: string; name: string; json: string }>()
  let stopReason: string | undefined

  for await (const ev of sseEvents(body)) {
    let p: {
      type?: string
      index?: number
      content_block?: { type?: string; id?: string; name?: string }
      delta?: { type?: string; text?: string; partial_json?: string; stop_reason?: string }
      error?: { message?: string }
    }
    try {
      p = JSON.parse(ev.data)
    } catch {
      continue
    }
    if (p.type === 'error' || p.error?.message) {
      emit({ type: 'error', message: p.error?.message ?? 'unknown anthropic error' })
      return
    }
    switch (p.type) {
      case 'content_block_start':
        if (p.content_block?.type === 'tool_use' && p.index !== undefined) {
          toolBlocks.set(p.index, {
            id: p.content_block.id ?? `toolu_${p.index}`,
            name: p.content_block.name ?? '',
            json: '',
          })
        }
        break
      case 'content_block_delta':
        if (p.delta?.type === 'text_delta' && p.delta.text) {
          emit({ type: 'text-delta', text: p.delta.text })
        } else if (p.delta?.type === 'input_json_delta' && p.index !== undefined) {
          const b = toolBlocks.get(p.index)
          if (b) b.json += p.delta.partial_json ?? ''
        }
        break
      case 'content_block_stop': {
        if (p.index === undefined) break
        const b = toolBlocks.get(p.index)
        if (b) {
          toolBlocks.delete(p.index)
          if (b.name) {
            emit({ type: 'tool-call', call: { id: b.id, name: b.name, arguments: b.json || '{}' } })
          }
        }
        break
      }
      case 'message_delta':
        stopReason = p.delta?.stop_reason ?? stopReason
        break
      default:
        break
    }
  }
  emit({ type: 'done', stopReason })
}
