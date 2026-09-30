/**
 * 共用 SSE 解析器：把 fetch 的 ReadableStream 解析为逐条 `data:` payload。
 *
 * 坑位说明：
 * - chunk 可能切在行中间、中文多字节字符可能切在字符中间 → TextDecoder 必须
 *   用 stream 模式 + 行缓冲。
 * - 行尾兼容 `\r\n`。
 * - 是否以 `data: [DONE]` 结束由调用方判断（OpenAI 发，Anthropic 不发）。
 */

export interface SSEvent {
  /** `event:` 字段（Anthropic 用；OpenAI 通常没有）。 */
  event?: string
  /** 一个事件块内所有 `data:` 行按规范拼接后的内容。 */
  data: string
}

export async function* parseSSE(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SSEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE 事件块以空行分隔（\n\n 或 \r\n\r\n）
      let sepIndex: number
      while ((sepIndex = findEventBoundary(buffer)) !== -1) {
        const rawEvent = buffer.slice(0, sepIndex)
        buffer = buffer.slice(sepIndex + boundaryLength(buffer, sepIndex))
        const parsed = parseEventBlock(rawEvent)
        if (parsed) yield parsed
      }
    }

    // 冲刷解码器与缓冲区里可能残留的最后一个事件
    buffer += decoder.decode()
    const tail = parseEventBlock(buffer)
    if (tail) yield tail
  } finally {
    reader.releaseLock()
  }
}

function findEventBoundary(buf: string): number {
  const nn = buf.indexOf('\n\n')
  const rn = buf.indexOf('\r\n\r\n')
  if (nn === -1) return rn
  if (rn === -1) return nn
  return Math.min(nn, rn)
}

function boundaryLength(buf: string, index: number): number {
  return buf.startsWith('\r\n\r\n', index) ? 4 : 2
}

function parseEventBlock(block: string): SSEvent | null {
  let event: string | undefined
  const dataLines: string[] = []
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue // 注释/心跳行
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''))
    }
  }
  if (dataLines.length === 0) return null
  return { event, data: dataLines.join('\n') }
}

/** 非 2xx 响应：读出错误体（provider 的 JSON 里通常有真实原因）再抛。 */
export async function assertOk(res: Response, label: string): Promise<void> {
  if (res.ok) return
  let detail = ''
  try {
    const text = await res.text()
    // provider 错误体可能是 JSON，尽量抽出 message
    try {
      const json = JSON.parse(text) as { error?: { message?: string }; message?: string }
      detail = json.error?.message ?? json.message ?? text
    } catch {
      detail = text
    }
  } catch {
    // 读不出错误体就算了
  }
  throw new Error(`${label} 请求失败 (${res.status})${detail ? `: ${detail.slice(0, 300)}` : ''}`)
}
