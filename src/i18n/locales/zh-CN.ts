import type { MessageSchema } from '../messages'

const messages: MessageSchema = {
  nav: {
    labs: '实验室',
    studio: '工作室',
    openings: '招聘',
    shop: '商店',
    contact: '联系我们',
  },
  intro: {
    line1: '你好，来认识一下 A.R.I.A，',
    line2: 'Goto 的自适应响应交互代理',
  },
  typewriter: '欢迎光临。好品味总会找到我们。那么，我们接下来要造点什么？',
  pills: {
    pitch: '向我们提交创意',
    work: '加入我们',
    hello: '简短打个招呼',
    operate: '看看我们如何运作',
    reach: '联系我们：',
  },
  hero: {
    introLine1: '你好，我是 Goto，',
    introLine2: '一位全栈开发者与设计师。',
    typewriter: '欢迎来到我的博客。在这里，我记录思考、构建与设计。',
    reach: '联系我：',
  },
  blogNav: {
    home: '首页',
    tags: '标签',
    archive: '归档',
    about: '关于',
    vault: '知识库',
  },
  footer: {
    tagline: '记录思考，构建事物。',
  },
  home: {
    badge: '个人博客',
    title: '在思考中记录，在记录中构建',
    subtitle: '这里是我的个人博客，记录全栈开发、设计与工程化的思考与实践。',
    viewBlog: '浏览全部文章',
    featured: '精选文章',
    all: '全部',
  },
  post: {
    readTime: '约 {minutes} 分钟',
    countSuffix: '篇笔记',
    empty: '还没有笔记',
    emptyHint: '内容正在准备中，敬请期待。',
  },
  tags: {
    title: '标签',
    subtitle: '按标签浏览全部笔记，按数量从多到少排序。',
    label: '全部标签',
    search: '搜索标签…',
    none: '没有匹配的标签',
  },
  archive: {
    subtitle: '按时间归档全部文章。',
  },
  vault: {
    title: '知识库',
    subtitle: '由 Obsidian 整理的结构化个人知识库，随笔记同步更新。',
    directory: '目录',
    onThisPage: '本页目录',
    search: '搜索标题、路径或标签…',
    noResults: '没有匹配「{query}」的笔记',
    emptyTitle: '知识库还是空的',
    emptyHint: '用 `npm run sync:vault` 把 Obsidian 的 wiki 同步进来，或直接往 src/content/vault 添加 Markdown 笔记。',
    notes: '笔记',
    canvases: '画布',
    missingHint: '目标尚未创建',
    notFound: '没有找到这篇笔记',
    backToIndex: '返回目录',
    created: '创建',
    updated: '更新',
    openCanvas: '画布',
    copy: '复制正文',
    copied: '已复制',
    back: '返回上一页',
  },
}

export default messages