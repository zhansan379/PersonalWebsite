import { assertOk, parseSSE } from './sse'
import type {
  ChatMessage,
  ChatRequest,
  ChatTransport,
  LLMStreamEvent,
  ToolDef,
} from './types'

/**
 * Anthropic 直连 transport（messages API）。
 *
 * 浏览器直连必须带 `anthropic-dangerous-direct-browser-access: true`，
 * 否则 CORS 直接拒绝。与 OpenAI 的线格式差异全部在本文件内映射：
 * - system 是顶层字段，不是消息
 * - max_tokens 必填
 * - 工具字段名是 input_schema
 * - tool 结果包在 role:'user' 的 tool_result content block 里
 * - 流式不发 [DONE]，以 message_stop 结束
 */

interface AnthropicOptions {
  baseURL: string
  apiKey: string
}

type ContentBlock = Record<string, unknown>

/** 内部消息 → Anthropic 线格式。system 抽出由调用方处理。 */
function toWireMessage(m: ChatMessage): { role: string; content: string | ContentBlock[] } {
  if (m.role === 'tool') {
    return {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: m.toolCallId,
          content: m.content ?? '',
        },
      ],
    }
  }
  if (m.role === 'assistant' && m.toolCalls?.length) {
    const blocks: ContentBlock[] = []
    if (m.content) blocks.push({ type: 'text', text: m.content })
    for (const c of m.toolCalls) {
      let input: unknown = {}
      try {
        input = JSON.parse(c.arguments || '{}')
      } catch {
        // arguments 不是合法 JSON 时给空对象，避免上游 400
      }
      blocks.push({ type: 'tool_use', id: c.id, name: c.name, input })
    }
    return { role: 'assistant', content: blocks }
  }
  return { role: m.role, content: m.content ?? '' }
}

export function createAnthropicTransport(opts: AnthropicOptions): ChatTransport {
  const base = (opts.baseURL || 'https://api.anthropic.com').replace(/\/+$/, '')

  async function* stream(req: ChatRequest): AsyncGenerator<LLMStreamEvent> {
    const system = req.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content ?? '')
      .join('\n\n')
    const messages = req.messages
      .filter((m) => m.role !== 'system')
      .map(toWireMessage)

    const res = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': opts.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens ?? 2048,
        // system（知识库目录）与工具定义每轮原样重发，标记 ephemeral 让上游命中
        // prompt cache，省钱也降 TTFT；OpenAI 侧自动缓存无需标记。
        ...(system
          ? {
              system: [
                { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
              ],
            }
          : {}),
        messages,
        stream: true,
        ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
        ...(req.tools?.length
          ? {
              tools: req.tools.map((t: ToolDef, i: number, arr: ToolDef[]) => ({
                name: t.name,
                description: t.description,
                input_schema: t.parameters,
                ...(i === arr.length - 1 ? { cache_control: { type: 'ephemeral' } } : {}),
              })),
            }
          : {}),
      }),
      signal: req.signal,
    })
    await assertOk(res, 'Anthropic')
    if (!res.body) throw new Error('Anthropic 响应没有 body')

    // 按 content block 下标累积 tool_use 的 partial_json
    const toolBlocks = new Map<number, { id: string; name: string; json: string }>()
    let stopReason: string | undefined

    for await (const ev of parseSSE(res.body)) {
      let payload: {
        type?: string
        index?: number
        content_block?: { type?: string; id?: string; name?: string }
        delta?: {
          type?: string
          text?: string
          partial_json?: string
          stop_reason?: string
        }
        error?: { message?: string }
        message?: { error?: { message?: string } }
      }
      try {
        payload = JSON.parse(ev.data)
      } catch {
        continue
      }

      const nestedError = payload.error?.message ?? payload.message?.error?.message
      if (payload.type === 'error' || nestedError) {
        yield { type: 'error', message: nestedError ?? 'Anthropic 返回未知错误' }
        return
      }

      switch (payload.type) {
        case 'content_block_start': {
          const block = payload.content_block
          if (block?.type === 'tool_use' && payload.index !== undefined) {
            toolBlocks.set(payload.index, {
              id: block.id ?? `toolu_${payload.index}`,
              name: block.name ?? '',
              json: '',
            })
          }
          break
        }
        case 'content_block_delta': {
          const delta = payload.delta
          if (delta?.type === 'text_delta' && delta.text) {
            yield { type: 'text-delta', text: delta.text }
          } else if (
            delta?.type === 'input_json_delta' &&
            payload.index !== undefined
          ) {
            const block = toolBlocks.get(payload.index)
            if (block) block.json += delta.partial_json ?? ''
          }
          break
        }
        case 'content_block_stop': {
          if (payload.index === undefined) break
          const block = toolBlocks.get(payload.index)
          if (block) {
            toolBlocks.delete(payload.index)
            if (block.name) {
              yield {
                type: 'tool-call',
                call: { id: block.id, name: block.name, arguments: block.json || '{}' },
              }
            }
          }
          break
        }
        case 'message_delta':
          stopReason = payload.delta?.stop_reason ?? stopReason
          break
        case 'message_stop':
          break
        default:
          break // message_start / ping 等忽略
      }
    }

    yield { type: 'done', stopReason }
  }

  return { stream }
}
