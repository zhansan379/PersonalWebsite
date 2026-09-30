import type { ChatRequest, ChatTransport, LLMStreamEvent } from './types'

/**
 * 服务端模式 transport：POST /api/chat（Vercel serverless function 代理）。
 * 响应是 NDJSON（每行一个 LLMStreamEvent JSON），上游 provider 差异已由
 * function 归一化，前端与直连模式消费同一事件协议。
 *
 * 探测要点：vercel.json 的 SPA rewrite 会让不存在的 /api/chat 返回
 * 200 + text/html 的 index.html，因此必须校验 content-type 与 body.ok，
 * 只看 res.ok 会误判。
 */

export interface ServerInfo {
  available: boolean
  provider?: string
  model?: string
}

export async function detectServer(timeoutMs = 3000): Promise<ServerInfo> {
  try {
    const res = await fetch('/api/chat', {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs),
    })
    const ct = res.headers.get('content-type') ?? ''
    if (!res.ok || !ct.includes('application/json')) return { available: false }
    const body = (await res.json()) as { ok?: boolean; provider?: string; model?: string }
    if (body.ok !== true) return { available: false }
    return { available: true, provider: body.provider, model: body.model }
  } catch {
    return { available: false }
  }
}

export function createServerTransport(): ChatTransport {
  async function* stream(req: ChatRequest): AsyncGenerator<LLMStreamEvent> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: req.messages,
        tools: req.tools,
        temperature: req.temperature,
        maxTokens: req.maxTokens,
      }),
      signal: req.signal,
    })
    if (!res.ok) {
      let detail = ''
      try {
        detail = await res.text()
      } catch {
        // 忽略
      }
      yield {
        type: 'error',
        message: `服务端代理请求失败 (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
      }
      return
    }
    if (!res.body) {
      yield { type: 'error', message: '服务端代理响应没有 body' }
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let nl: number
        while ((nl = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nl).trim()
          buffer = buffer.slice(nl + 1)
          if (!line) continue
          try {
            yield JSON.parse(line) as LLMStreamEvent
          } catch {
            // 跳过无法解析的行
          }
        }
      }
      buffer += decoder.decode()
      const tail = buffer.trim()
      if (tail) {
        try {
          yield JSON.parse(tail) as LLMStreamEvent
        } catch {
          // 忽略
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  return { stream }
}
