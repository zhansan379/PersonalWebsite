/**
 * 统一内部协议：所有 LLM 传输实现（OpenAI 直连 / Anthropic 直连 / 服务端代理）
 * 都把上游差异收敛为同一组类型与事件流，`useChat` 只消费这一种格式。
 */

export type Role = 'system' | 'user' | 'assistant' | 'tool'

/** 一次工具调用请求（arguments 为 JSON 字符串，与 OpenAI 线格式一致）。 */
export interface ToolCall {
  id: string
  name: string
  arguments: string
}

export interface ChatMessage {
  role: Role
  content: string | null
  /** assistant 请求工具时携带。 */
  toolCalls?: ToolCall[]
  /** role === 'tool' 时对应的调用 id。 */
  toolCallId?: string
}

export interface ToolDef {
  name: string
  description: string
  /** JSON Schema（OpenAI 的 parameters / Anthropic 的 input_schema 共用）。 */
  parameters: Record<string, unknown>
}

export type LLMStreamEvent =
  | { type: 'text-delta'; text: string }
  /** 完整累积好的一次工具调用（流式分片已在 transport 内拼好）。 */
  | { type: 'tool-call'; call: ToolCall }
  | { type: 'done'; stopReason?: string }
  | { type: 'error'; message: string }

export interface ChatRequest {
  messages: ChatMessage[]
  tools?: ToolDef[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export interface ChatTransport {
  stream(req: ChatRequest): AsyncIterable<LLMStreamEvent>
}

/** 把 transport 抛出的异常规范化为一个 error 事件，AbortError 返回 null（静默）。 */
export function toErrorEvent(
  err: unknown,
): Extract<LLMStreamEvent, { type: 'error' }> | null {
  if (err instanceof DOMException && err.name === 'AbortError') return null
  const message = err instanceof Error ? err.message : String(err)
  return { type: 'error', message }
}
