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
    blog: '文章',
    tags: '标签',
    archive: '归档',
    about: '关于',
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
    countSuffix: '篇文章',
    empty: '还没有文章',
    emptyHint: '内容正在准备中，敬请期待。',
    prev: '下一篇',
    next: '上一篇',
    notFound: '没有找到这篇文章',
    backToBlog: '返回文章列表',
  },
  tags: {
    title: '标签',
    subtitle: '按标签浏览全部文章。',
    label: '全部标签',
  },
  archive: {
    subtitle: '按时间归档全部文章。',
  },
}

export default messages