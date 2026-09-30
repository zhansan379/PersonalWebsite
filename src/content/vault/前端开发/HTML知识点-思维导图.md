---
title: HTML 思维导图
tags:
  - HTML
  - 前端开发
  - 思维导图
created: 2026-09-30
updated: 2026-09-30
mindmap-plugin: basic
---

# HTML

## 基础语法

- 文档基本结构
	- `<!DOCTYPE html>` + html/head/body；head 放元数据，body 放内容
	- 📖 [HTML 基础语法](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax)
- 元素与标签
	- 开始标签 + 内容 + 结束标签；空元素无闭合；属性写在开始标签
	- 📖 [HTML 元素参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements)
- 属性
	- 布尔属性无需值；单双引号皆可但需统一；属性名大小写不敏感
	- 📖 [HTML 属性参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Attributes)
- 全局属性
	- id/class/style/title/hidden；data-* 自定义数据；lang/dir 语言方向
	- 📖 [全局属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes)
- 注释
	- `<!-- 注释 -->`；不能嵌套
	- 📖 [HTML 注释](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Comments)
- 怪异模式与标准模式
	- 正确的 DOCTYPE 触发标准模式；缺失或错误 DOCTYPE 进入怪异模式
	- 📖 [怪异模式与标准模式](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Quirks_mode_and_standards_mode)
- 内容分类
	- 流内容/章节内容/标题内容/短语内容/嵌入内容/交互内容/元数据
	- 📖 [内容分类](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Content_categories)
- 调试 HTML
	- HTML 容错性强故错误静默；用 W3C 校验器与 DevTools 排查
	- 📖 [调试 HTML](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML)
- 速查表
	- 常用元素与用法的一页式速查
	- 📖 [HTML 速查表](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Cheatsheet)

## 文档元数据（head）

- title 与字符编码
	- `<title>` 页面标题；`<meta charset="utf-8">` 必须尽早声明
	- 📖 [title](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/title) / [meta](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/meta)
- meta 视口与 SEO
	- viewport 移动适配；description/keywords；Open Graph 社交分享卡片
	- 📖 [视口 meta 标签](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Viewport_meta_element)
- 引入外部资源
	- link 引 CSS/图标/预加载；script 引 JS（defer/async 控制执行时机）
	- 📖 [link](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/link) / [script](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/script)
- base 与 style
	- base 设定相对 URL 基准；style 内嵌样式表
	- 📖 [base](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/base)

## 文本内容

- 标题层级
	- h1–h6 六级；一个页面合理组织大纲；勿跳级仅为了字号
	- 📖 [标题元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/Heading_Elements)
- 段落与换行
	- p 段落；br 换行（地址、诗歌）；hr 主题分隔线
	- 📖 [p](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/p) / [hr](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/hr)
- 语义化强调
	- em 语气强调 vs i 斜体表意；strong 重要性 vs b 加粗表意
	- 📖 [em](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/em) / [strong](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/strong)
- 引用与缩写
	- blockquote 块级引用 + cite 属性；q 行内引用；abbr 缩写 + title；cite 作品名
	- 📖 [blockquote](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/blockquote) / [abbr](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/abbr)
- 代码与预格式化
	- code 行内代码；pre 保留空白；kbd 按键；samp 输出；var 变量
	- 📖 [code](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/code) / [pre](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/pre)
- 标记与修订
	- mark 高亮；del/ins 增删修订；sup/sub 上下标；small 细则
	- 📖 [mark](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/mark) / [del](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/del) / [ins](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/ins)
- 时间与数据
	- time + datetime 机器可读时间；data + value 关联机器可读值
	- 📖 [time](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/time) / [日期时间格式](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Date_and_time_formats)

## 链接与导航

- 超链接 a
	- href 目标；绝对/相对/锚点（#id）/协议链接（mailto:、tel:）
	- 📖 [a](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/a)
- 链接行为
	- target="_blank" 新窗口需配 rel="noopener"；download 强制下载
	- 📖 [a 的 target 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/a#target)
- 导航 nav
	- 包裹主导航链接块；页面可多个 nav（目录、面包屑）
	- 📖 [nav](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/nav)
- 面包屑与跳链
	- ol + aria-label 面包屑；"跳到内容"链接提升键盘可达性
	- 📖 [HTML 无障碍](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility/HTML)

## 列表与描述

- 无序列表 ul
	- 项目无顺序；type 属性已废弃，用 CSS list-style
	- 📖 [ul](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/ul)
- 有序列表 ol
	- start 起始值；reversed 倒序；li 的 value 指定序号
	- 📖 [ol](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/ol)
- 描述列表 dl
	- dt 术语 + dd 描述；一对多、多对一皆合法；适合词汇表/元数据
	- 📖 [dl](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/dl)

## 语义化布局

- 页面结构元素
	- header/footer/nav/main/aside/article/section 划分页面区域
	- 📖 [HTML 文档和网站结构](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax)
- article vs section
	- article 可独立分发的内容（文章、卡片）；section 主题分组，通常带标题
	- 📖 [article](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/article) / [section](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/section)
- main 与 landmark
	- 每页仅一个可见 main；无障碍地标帮助屏幕阅读器导航
	- 📖 [main](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/main)
- div 与 span
	- 无语义的通用容器；仅在无合适语义元素时使用
	- 📖 [div](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/div) / [span](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/span)
- figure 与 figcaption
	- 独立内容单元（图/代码/引用）+ 说明文字
	- 📖 [figure](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/figure)

## 图片与多媒体

- img 基础
	- src/alt 必备；alt 写法决定无障碍质量；装饰图 alt=""
	- 📖 [HTML 中的图片](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/HTML_images) / [img](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/img)
- 响应式图片
	- srcset + sizes 按分辨率/布局选图；picture 按媒体条件/格式切换
	- 📖 [响应式图片](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Responsive_images)
- 懒加载与尺寸
	- loading="lazy" 懒加载；width/height 预留空间防布局偏移（CLS）
	- 📖 [img 的 loading 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/img#loading)
- 视频与音频
	- video/audio + controls；source 多格式回退；track 字幕（WebVTT）
	- 📖 [视频和音频内容](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio) / [video](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/video)
- 嵌入内容
	- iframe 嵌页面（sandbox 安全隔离）；embed/object 嵌入插件内容（少用）
	- 📖 [iframe](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/iframe)
- 矢量图形
	- 内联 SVG 可用 CSS/JS 控制；img 引 SVG 简单但不能交互
	- 📖 [在 HTML 中包含矢量图形](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/Including_vector_graphics_in_HTML)
- 图像映射
	- map + area 图片热区链接
	- 📖 [map](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/map)

## 表格

- 表格基础结构
	- table/tr/td/th；th 表头默认加粗居中；border 已交给 CSS
	- 📖 [HTML 表格基础](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics) / [table](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/table)
- 表格分区
	- thead/tbody/tfoot 语义分区；caption 表格标题
	- 📖 [thead](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/thead) / [caption](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/caption)
- 合并单元格
	- colspan 跨列；rowspan 跨行
	- 📖 [td 的 colspan](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/td)
- 表格无障碍
	- th 的 scope（col/row）关联表头；复杂表格用 headers + id
	- 📖 [HTML 无障碍：表格](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility/HTML)
- 列分组
	- colgroup + col 为整列应用样式
	- 📖 [colgroup](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/colgroup)

## 表单

- form 基础
	- action 提交地址；method GET（查询）vs POST（提交数据）
	- 📖 [HTML 表单](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/HTML_forms) / [form](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/form)
- input 类型
	- text/email/password/number/date/color/file/checkbox/radio/hidden…类型自带校验与键盘
	- 📖 [input](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/input)
- label 关联
	- for + id 或包裹式关联；点击 label 聚焦控件，无障碍必需
	- 📖 [label](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/label)
- 选择控件
	- select + option（optgroup 分组）；datalist 输入建议；textarea 多行文本
	- 📖 [select](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/select) / [datalist](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/datalist) / [textarea](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/textarea)
- 按钮
	- button 的 type：submit/submit 默认/reset/button；form 外按钮用 form 属性关联
	- 📖 [button](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/button)
- 表单分组
	- fieldset + legend 分组控件；fieldset[disabled] 整组禁用
	- 📖 [fieldset](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/fieldset)
- 输入约束
	- required/min/max/minlength/maxlength/pattern/step；readonly vs disabled
	- 📖 [约束验证](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Constraint_validation)
- 表单专用元素
	- output 计算结果；progress 进度；meter 度量
	- 📖 [output](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/output) / [progress](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/progress) / [meter](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/meter)

## 交互元素

- details 折叠
	- details + summary 原生手风琴；open 默认展开
	- 📖 [details](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/details)
- dialog 对话框
	- showModal() 模态/show() 非模态；原生焦点圈定与 ESC 关闭
	- 📖 [dialog](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/dialog)
- menu 菜单
	- 工具栏式列表语义，实际按 ul 渲染
	- 📖 [menu](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/menu)

## 无障碍（A11y）

- 语义化优先
	- 原生语义 > ARIA 补丁；button 而非 div + click
	- 📖 [HTML：无障碍的良好基础](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility/HTML)
- 文本替代
	- img 的 alt；图表提供长文本描述；纯装饰内容对屏幕阅读器隐藏
	- 📖 [HTML 无障碍](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility/HTML)
- 键盘可达
	- 交互元素天然可聚焦；勿用 tabindex 正值破坏顺序；跳链跳过导航
	- 📖 [tabindex](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes/tabindex)
- 语言与标题
	- html[lang] 声明语言；标题层级帮助屏幕阅读器建立大纲
	- 📖 [lang 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes/lang)

## 高级特性

- Microdata 微数据
	- itemscope/itemtype/itemprop 嵌入机器可读结构化数据（Schema.org）
	- 📖 [Microdata](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Microdata)
- Microformats 微格式
	- 用 class 约定标记 h-card/h-entry 等结构化数据
	- 📖 [Microformats](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Microformats)
- canvas 画布
	- 位图画布元素，内容由 JS 绘制
	- 📖 [canvas](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/canvas)
- template 模板
	- 惰性 HTML 片段，克隆后使用；配合 slot 与 Web Components
	- 📖 [template](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/template)
- noscript
	- JS 禁用时显示的降级内容
	- 📖 [noscript](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/noscript)
- 已废弃元素
	- font/center/marquee/frameset 等仅作识别，新代码勿用
	- 📖 [HTML 元素参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements)

## 参考来源

- 内容整理自 [MDN HTML 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML)，本地离线镜像：`D:\Download\browserDownload\HTML\HTML\developer.mozilla.org`（`en-US/docs/Web/HTML` 与 `en-US/docs/Learn_web_development/Core/Structuring_content`）
