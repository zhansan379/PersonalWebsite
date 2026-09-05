// 临时验证脚本：用 Vite SSR 加载真实数据层，断言 wiki 链接解析。
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  logLevel: 'error',
})

try {
  const { useVault } = await server.ssrLoadModule('/src/composables/useVault.ts')
  const wiki = await server.ssrLoadModule('/src/lib/wikiLinks.ts')
  const api = useVault()

  console.log('notes:', api.notes.length, '/ canvases:', api.canvasMap.size, '/ assets:', api.assetMap.size)
  console.log('root dirs:', api.root.map((n) => n.name).join(', '))

  let fail = 0
  const ok = (cond, msg) => {
    if (cond) console.log('  ok  ', msg)
    else { console.log('  FAIL', msg); fail++ }
  }

  // 1. 短名链接 -> 解析成 href
  const md = '见 [[MyBatis 的占位符区别]]，以及 [[编程/spring/mybatis/MyBatis 的优势与特性]]'
  const out1 = wiki.resolveWikiMarkdown(md, '编程/spring/mybatis/MyBatis 与 JDBC 对比及优点', api)
  const href1 = out1.match(/href="([^"]+)"/)
  ok(out1.includes('class="wiki-link"'), '短名链接变成 wiki-link')
  ok(href1 && href1[1] === '/vault/编程/spring/mybatis/MyBatis 的占位符区别', 'href=/vault/...短名路径  got=' + (href1 && href1[1]))
  ok(out1.includes('/vault/编程/spring/mybatis/MyBatis 的优势与特性'), '全路径链接解析')

  // 2. #锚点 + 显示文字 alias
  const md2 = '[[02 多轮对话记忆设计#4.2 敏感信息处理|跳过去]]'
  const out2 = wiki.resolveWikiMarkdown(md2, '编程/agent/上下文与记忆/01 Agent 记忆机制', api)
  ok(out2.includes('href="/vault/编程/agent/上下文与记忆/02 多轮对话记忆设计#4-2-敏感信息处理"'), '别名+锚点链接  got=' + (out2.match(/href="([^"]+)"/) || [])[1])
  ok(out2.includes('>跳过去</a>'), '显示文字用别名')

  // 3. 图片嵌入
  const md3 = '![[MQ事务代码.png]]'
  const out3 = wiki.resolveWikiMarkdown(md3, '编程/mq/2.为什么需要MQ？或者说MQ的作用？有什么缺点？', api)
  const imgUrl = (out3.match(/\]\(([^)]+)\)/) || [])[1]
  ok(!out3.includes('![[MQ'), '图片嵌入不再残留 ![[ 语法')
  ok(out3.startsWith('![alt](') || out3.includes('img/MQ'), '图片嵌入被解析成 markdown 图像 url=' + imgUrl)

  // 4. 不存在的目标 -> 占位
  const md4 = '[[根本不存在的笔记xyz]]'
  const out4 = wiki.resolveWikiMarkdown(md4, '编程/mq/1.什么是消息队列', api)
  ok(out4.includes('wiki-missing'), '不存在目标渲染为占位')

  // 5. 递归目录树完整
  const depth = (n) => n.children && n.children.length ? 1 + Math.max(...n.children.map(depth)) : 1
  ok(1 + Math.max(...api.root.map(depth)) >= 3, '目录树深度>=3: ' + (1 + Math.max(...api.root.map(depth))))

  console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILURES`)
  process.exit(fail === 0 ? 0 : 1)
} finally {
  await server.close()
}
console.log('\nTREE:')
show(api.root, 0)
