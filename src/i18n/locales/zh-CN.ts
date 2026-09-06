import type { MessageSchema } from '../messages'

const messages: MessageSchema = {
  nav: {
    github: 'GitHub',
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
    projects: '开源项目',
  },
  projects: {
    heading: 'Project',
    live: 'Project Link',
    os: '开源项目',
    desc1: '会和你说活的数字人：能听、能想、能答、能打岔，看得见你在干嘛，还能接外部工具箱。',
    desc2: 'BOSS 直聘求职自动化工具：爬取岗位 → 解析简历 → 智能匹配 → 可视化报告 → 一键生成优化简历 → 自动投递。',
    desc3: '本博客网站，基于 Vue 3、TypeScript、Vite 与 Tailwind 构建，支持中英文与深浅色主题。',
  },
  footer: {
    tagline: '记录思考，构建事物。',
  },
  home: {
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
    undated: '未标注日期',
  },
  vault: {
    title: '知识库',
    subtitle: '由 Obsidian 整理的结构化个人知识库，随笔记同步更新。',
    directory: '目录',
    onThisPage: '本页目录',
    tabs: {
      directory: '目录',
      timeline: '时间线',
      tags: '标签',
    },
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