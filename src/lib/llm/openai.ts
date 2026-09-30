import { assertOk, parseSSE } from './sse'
import type {
  ChatMessage,
  ChatRequest,
  ChatTransport,
  LLMStreamEvent,
  ToolCall,
  ToolDef,
} from './types'

/**
 * OpenAI 兼容直连 transport：覆盖 OpenAI / DeepSeek / 通义（DashScope
 * compatible-mode）/ OpenRouter / 任意自建网关（自定义 baseURL）。
 *
 * 浏览器直连，API Key 只作为 Authorization 头发往用户配置的 baseURL。
 */

interface OpenAIOptions {
  baseURL: string
  apiKey: string
}

/** 内部消息 → OpenAI 线格式。 */
function toWireMessage(m: ChatMessage): Record<string, unknown> {
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
}

function toWireTools(tools: ToolDef[]): Array<Record<string, unknown>> {
  return tools.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }))
}

/** delta.tool_calls 按 index 分片到达：首片带 id/name，后续只带 arguments 片段。 */
class ToolCallAccumulator {
  private slots = new Map<number, { id: string; name: string; args: string }>()

  push(deltas: Array<{
    index?: number
    id?: string
    function?: { name?: string; arguments?: string }
  }>): void {
    for (const d of deltas) {
      const idx = d.index ?? 0
      let slot = this.slots.get(idx)
      if (!slot) {
        slot = { id: '', name: '', args: '' }
        this.slots.set(idx, slot)
      }
      if (d.id) slot.id += d.id
      if (d.function?.name) slot.name += d.function.name
      if (d.function?.arguments) slot.args += d.function.arguments
    }
  }

  collect(): ToolCall[] {
    return [...this.slots.entries()]
      .sort(([a], [b]) => a - b)
      .map(([i, s]) => ({
        id: s.id || `call_${i}`,
        name: s.name,
        arguments: s.args || '{}',
      }))
      .filter((c) => c.name)
  }
}

export function createOpenAITransport(opts: OpenAIOptions): ChatTransport {
  const base = opts.baseURL.replace(/\/+$/, '')

  async function* stream(req: ChatRequest): AsyncGenerator<LLMStreamEvent> {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages.map(toWireMessage),
        stream: true,
        ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
        ...(req.maxTokens !== undefined ? { max_tokens: req.maxTokens } : {}),
        ...(req.tools?.length
          ? { tools: toWireTools(req.tools), tool_choice: 'auto' }
          : {}),
      }),
      signal: req.signal,
    })
    await assertOk(res, 'OpenAI')
    if (!res.body) throw new Error('OpenAI 响应没有 body')

    const acc = new ToolCallAccumulator()
    let finishReason: string | undefined

    for await (const ev of parseSSE(res.body)) {
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
        continue // 跳过无法解析的碎片
      }
      if (chunk.error?.message) {
        yield { type: 'error', message: chunk.error.message }
        return
      }
      const choice = chunk.choices?.[0]
      if (!choice) continue
      if (choice.delta?.content) {
        yield { type: 'text-delta', text: choice.delta.content }
      }
      if (choice.delta?.tool_calls?.length) {
        acc.push(choice.delta.tool_calls)
      }
      if (choice.finish_reason) {
        finishReason = choice.finish_reason
      }
    }

    if (finishReason === 'tool_calls') {
      for (const call of acc.collect()) {
        yield { type: 'tool-call', call }
      }
    }
    yield { type: 'done', stopReason: finishReason }
  }

  return { stream }
}
