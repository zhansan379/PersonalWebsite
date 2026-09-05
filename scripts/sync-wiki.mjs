// 把 Obsidian 知识库的 wiki/ 同步进博客仓库 src/content/vault/。
//
// 用法：
//   node scripts/sync-wiki.mjs
//   VAULT_WIKI=D:/Obsidian/data/obsidian_journal/wiki node scripts/sync-wiki.mjs
//
// 行为：
//   - 完整复制目录结构 + 图片（构建期由 import.meta.glob 导入）
//   - 处理不适宜作为静态导入键的文件名（#、$ 等），见 RENAME_MAP
//   - 改写被重命名笔记的 wiki 链接，保证库内互链不断
//   - 删除目标里已不在源中的文件，使删除也能同步（幂等）
//   - 源目录不存在（如 Git 空目录 / 全删空）时清空目标——"删除全部"也同步
// 仅供 Vercel 之外的本仓库独立运行；GitHub 侧由 vault 仓库的 Action 调用同一脚本。

import { promises as fs } from 'node:fs'
import { resolve, dirname, relative, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = resolve(process.env.VAULT_WIKI || 'D:/Obsidian/data/obsidian_journal/wiki')
const DEST = resolve(
  process.env.VAULT_DEST ||
    join(fileURLToPath(new URL('..', import.meta.url)), 'src/content/vault'),
)
const RENAME_MAP = {
  'MyBatis 的 #{} 与 ${} 区别.md': 'MyBatis 的占位符区别.md', // #/ $ 会破坏 Vite ?raw 解析
}

// 重命名 basename -> 新的 basename（去掉 .md 的笔记 id 形式）
const renameIds = Object.fromEntries(
  Object.entries(RENAME_MAP).map(([oldName, newName]) => [
    oldName.replace(/\.md$/, ''),
    newName.replace(/\.md$/, ''),
  ]),
)

function destName(name, isMarkdown) {
  const mapped = RENAME_MAP[name] || name
  if (!isMarkdown || !mapped.includes('/')) return mapped
  return mapped
}

async function copyTree(srcDir, destDir, rel = '') {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await fs.readdir(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name)
    const isMarkdown = entry.name.endsWith('.md') && entry.isFile()
    const outName = destName(entry.name, isMarkdown)
    const outPath = join(destDir, outName)
    const outRel = rel ? `${rel}/${outName}` : outName

    if (entry.isDirectory()) {
      await copyTree(srcPath, outPath, outRel)
    } else if (entry.isFile()) {
      if (outName.startsWith('.')) continue // 跳过隐藏文件（如 .obsidian 之外的缓存）
      let buf = await fs.readFile(srcPath)
      if (isMarkdown) {
        let text = buf.toString('utf8')
        // 改写指向重命名笔记的 wiki 链接（同一 token 覆盖短名与全路径两种写法）
        for (const [oldId, newId] of Object.entries(renameIds)) {
          if (text.includes(oldId)) text = text.split(oldId).join(newId)
        }
        buf = Buffer.from(text, 'utf8')
      }
      await fs.writeFile(outPath, buf)
      if (outRel !== rel + (rel ? '/' : '') + entry.name) {
        console.log('  renamed ->', outRel)
      }
    }
  }
}

async function prune(destDir, srcDir, rel = '') {
  if (!(await exists(srcDir))) return
  const seen = new Set()
  const walk = async (d) => {
    for (const e of await fs.readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      const isEntryMd = e.name.endsWith('.md')
      seen.add(destName(e.name, isEntryMd))
      if (e.isDirectory()) await walk(p)
    }
  }
  await walk(destDir)
  const srcNames = new Set((await fs.readdir(srcDir, { withFileTypes: true })).map((e) => destName(e.name, e.name.endsWith('.md'))))
  for (const name of await fs.readdir(destDir)) {
    const dName = destName(name, name.endsWith('.md'))
    if (!srcNames.has(dName)) {
      await fs.rm(join(destDir, name), { recursive: true, force: true })
      console.log('  removed ->', rel ? `${rel}/${dName}` : dName)
    }
  }
}

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

console.log(`Syncing\n  from ${SOURCE}\n  to   ${DEST}`)
if (!(await exists(SOURCE))) {
  // 源目录不存在，通常是知识库把 wiki/ 下的文件全删空了（Git 不跟踪空目录，checkout 后目录不存在）。
  // 这是"删除同步"：博客仓库里对应的目标也应清空，而不是报错退出。
  console.warn(`source not found: ${SOURCE}`)
  console.log('Treating as full deletion: clearing destination.')
  if (await exists(DEST)) {
    await fs.rm(DEST, { recursive: true, force: true })
  }
  console.log('\nDone. Destination cleared.')
  process.exit(0)
}
await copyTree(SOURCE, DEST)
await prune(DEST, SOURCE)
const mdCount = (await countMd(DEST)).length
console.log(`\nDone. ${mdCount} markdown files in src/content/vault/`)

async function countMd(dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await countMd(p)))
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}