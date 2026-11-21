// 临时验证脚本：用 Vite SSR 加载真实数据层，断言知识库助手的目录注入与工具执行。
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  logLevel: 'error',
})

try {
  const tools = await server.ssrLoadModule('/src/lib/vaultTools.ts')
  const { useVault } = await server.ssrLoadModule('/src/composables/useVault.ts')
  const api = useVault()

  let fail = 0
  const ok = (cond, msg) => {
    if (cond) console.log('  ok  ', msg)
    else { console.log('  FAIL', msg); fail++ }
  }

  // 1. 目录覆盖全部笔记
  const catalog = tools.buildCatalog()
  ok(catalog.length === api.notes.length, `目录条目数 == 笔记数 (${catalog.length})`)
  ok(catalog.every((e) => e.id && e.title), '每条目录都有 id 与 title')
  ok(catalog.every((e) => e.summary.length <= 141), '摘要均在 140 字符内')

  // 2. system prompt 含目录与防护指令
  const sp = tools.buildSystemPrompt()
  ok(sp.includes(catalog[0].id), 'system prompt 含笔记 id')
  ok(sp.includes('read_note'), 'system prompt 提到 read_note 工具')
  ok(sp.length < 20000, `system prompt 长度合理 (${sp.length})`)

  // 3. read_note 正常读取
  const first = catalog[0]
  const body = tools.executeTool('read_note', JSON.stringify({ note_id: first.id }))
  ok(!body.startsWith('ERROR'), `read_note 读取成功: ${first.id}`)
  ok(body.includes(first.title), '读取结果含笔记标题')

  // 4. 未知 id → 错误 + 可用 id 列表（让模型自我纠正）
  const bad = tools.executeTool('read_note', JSON.stringify({ note_id: '不存在的笔记' }))
  ok(bad.startsWith('ERROR'), '未知 id 返回 ERROR')
  ok(bad.includes(first.id), 'ERROR 中含可用 id 列表')

  // 4b. read_note 分段：length 截断 + 续读提示 + offset 衔接
  const seg1 = tools.executeTool('read_note', JSON.stringify({ note_id: first.id, length: 500 }))
  ok(seg1.includes('共 ') && seg1.includes('字'), '分段读取含进度信息')
  const noteLen = api.noteMap.get(first.id).body.length
  if (noteLen > 500) {
    ok(seg1.includes('继续阅读'), '截断时给出续读提示')
    const seg2 = tools.executeTool(
      'read_note',
      JSON.stringify({ note_id: first.id, offset: 500, length: 500 }),
    )
    ok(seg2.includes('第 500–'), 'offset 续读起点正确')
  }

  // 4c. read_note 按标题读节：不存在的标题 → 错误中列出可用标题
  const byHeading = tools.executeTool(
    'read_note',
    JSON.stringify({ note_id: first.id, heading: '不存在的标题xyz' }),
  )
  ok(byHeading.startsWith('ERROR'), '未知标题返回 ERROR')

  // 4d. search_notes：标题里的词应命中；乱码应空手而归
  const term = first.title.replace(/[\s/\\:：].*$/, '').slice(0, 4)
  const hits = tools.executeTool('search_notes', JSON.stringify({ query: term }))
  ok(hits.includes(first.id), `search_notes 命中标题关键词 "${term}"`)
  const noHits = tools.executeTool('search_notes', JSON.stringify({ query: 'zzzqqqjxw' }))
  ok(noHits.includes('没有找到'), 'search_notes 无结果时给换词建议')

  // 4e. list_notes：概览含一级目录；dir 展开列出该目录笔记
  const overview = tools.executeTool('list_notes', '{}')
  ok(overview.includes('一级目录概览'), 'list_notes 无参返回概览')
  const topDir = first.id.includes('/') ? first.id.split('/')[0] : ''
  if (topDir) {
    const listing = tools.executeTool('list_notes', JSON.stringify({ dir: topDir }))
    ok(listing.includes(first.id), `list_notes 展开 "${topDir}" 含已知笔记`)
  }
  ok(tools.executeTool('list_notes', JSON.stringify({ dir: '不存在的目录xyz' })).startsWith('ERROR'),
    '未知目录返回 ERROR')

  // 5. 坏 JSON / 未知工具
  ok(tools.executeTool('read_note', '{oops').startsWith('ERROR'), '坏 JSON 返回 ERROR')
  ok(tools.executeTool('delete_everything', '{}').startsWith('ERROR'), '未知工具返回 ERROR')

  // 6. SSE 解析：多字节中文字符跨 chunk 切断 + \r\n 行尾 + 多事件合并在一个 chunk
  const { parseSSE } = await server.ssrLoadModule('/src/lib/llm/sse.ts')
  const text = 'data: {"delta":"你好"}\r\n\r\ndata: [DONE]\n\n'
  const bytes = new TextEncoder().encode(text)
  // 在 "你好" 的 UTF-8 字节中间切断
  const cut = bytes.indexOf(0xbd) // "好" 的末字节附近，任意非边界位置
  const chunks = [bytes.slice(0, cut), bytes.slice(cut)]
  const stream = new ReadableStream({
    start(c) {
      for (const ch of chunks) c.enqueue(ch)
      c.close()
    },
  })
  const events = []
  for await (const ev of parseSSE(stream)) events.push(ev.data)
  ok(events.length === 2, `SSE 切出 2 个事件 (got ${events.length})`)
  ok(events[0] === '{"delta":"你好"}', '跨 chunk 的中文完整无损')
  ok(events[1] === '[DONE]', '[DONE] 事件解析')

  // 7. api/chat.ts 探测端点：未配置 LLM_API_KEY 时 GET 返回 503
  delete process.env.LLM_API_KEY
  const { default: chatHandler } = await server.ssrLoadModule('/api/chat.ts')
  const probe = await chatHandler(new Request('http://localhost/api/chat', { method: 'GET' }))
  ok(probe.status === 503, `无 key 时 GET /api/chat 返回 503 (got ${probe.status})`)
  ok((await probe.json()).ok === false, '503 响应体 ok === false')

  // 8. 配置 key 后探测返回 ok + provider + model（POST 不发真实上游请求，留待 vercel dev 联调）
  process.env.LLM_API_KEY = 'test-key'
  process.env.LLM_MODEL = 'test-model'
  const probe2 = await chatHandler(new Request('http://localhost/api/chat', { method: 'GET' }))
  const probe2Body = await probe2.json()
  ok(probe2.status === 200 && probe2Body.ok === true, '有 key 时探测 ok')
  ok(probe2Body.model === 'test-model', '探测返回 env 配置的 model')
  const badPost = await chatHandler(
    new Request('http://localhost/api/chat', { method: 'POST', body: 'not json' }),
  )
  ok(badPost.status === 400, '坏 JSON 的 POST 返回 400')

  console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILURES`)
  process.exit(fail === 0 ? 0 : 1)
} finally {
  await server.close()
}
