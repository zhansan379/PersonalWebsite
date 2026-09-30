---
title: CSS 思维导图
tags:
  - CSS
  - 前端开发
  - 思维导图
created: 2026-09-30
updated: 2026-09-30
mindmap-plugin: basic
---

# CSS

## 基础与语法

- 什么是 CSS
	- 规则集 = 选择器 + 声明块；声明 = 属性: 值；大小写不敏感（属性名）
	- 📖 [什么是 CSS](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/What_is_CSS)
- 三种引入方式
	- 外部样式表（link，推荐）/ 内部样式表（style 标签）/ 内联样式（style 属性，最差）
	- 📖 [CSS 入门](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Getting_started)
- @规则（at-rules）
	- @media / @supports / @import / @font-face / @keyframes / @layer / @container / @property
	- 📖 [@规则](https://developer.mozilla.org/zh-CN/docs/Web/CSS/At-rule)
- 值与单位
	- 绝对单位 px；相对单位 em/rem/vw/vh/%；数字、百分比、角度、时长
	- 📖 [CSS 值和单位](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Values_and_units) / [值与单位指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Values_and_units)
- 数学与取值函数
	- calc() 混合单位计算；min()/max()/clamp() 流式取值；var() 引用自定义属性
	- 📖 [calc()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/calc) / [clamp()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clamp)
- 调试 CSS
	- DevTools 检查计算样式与层叠来源；样式不生效先查选择器优先级与拼写
	- 📖 [调试 CSS](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS)

## 选择器

- 基本选择器
	- 元素、类（.）、ID（#）、通配符（*）；优先级 ID > 类 > 元素
	- 📖 [选择器](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Basic_selectors)
- 组合器
	- 后代（空格）、子代（>）、相邻兄弟（+）、通用兄弟（~）
	- 📖 [组合器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Combinators)
- 伪类
	- :hover/:focus/:active；结构类 :first-child/:nth-child()；:not()/:is()/:where()/:has()
	- 📖 [伪类](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes) / [:has()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:has)
- 伪元素
	- ::before/::after 生成内容；::first-line/::first-letter；::selection；::marker
	- 📖 [伪元素](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements)
- 属性选择器
	- [attr]、[attr=value]、[attr^=开头]/[attr$=结尾]/[attr*=包含]
	- 📖 [属性选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Attribute_selectors)

## 层叠与继承

- 层叠三要素
	- 来源与重要性 > 优先级（specificity）> 源码顺序
	- 📖 [层叠与继承](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) / [层叠指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Cascade)
- 优先级计算
	- 内联 > #ID > .class/伪类/属性 > 元素/伪元素；:where() 权重为 0
	- 📖 [优先级](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity)
- 继承
	- color/font 等文本属性默认继承；盒模型属性不继承
	- 📖 [继承](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Inheritance)
- 继承控制关键字
	- inherit / initial / unset / revert / revert-layer 显式控制取值来源
	- 📖 [inherit](https://developer.mozilla.org/zh-CN/docs/Web/CSS/inherit) / [unset](https://developer.mozilla.org/zh-CN/docs/Web/CSS/unset)
- 层叠层 @layer
	- 显式定义样式层级，层内再比优先级；unlayered 样式优先于 layered
	- 📖 [@layer](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer)
- !important
	- 翻转层叠顺序；慎用，难覆盖
	- 📖 [重要性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/important)

## 盒模型

- 标准盒模型
	- content + padding + border + margin；width 默认只指 content
	- 📖 [盒模型](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Box_model) / [盒模型指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Box_model)
- box-sizing
	- border-box：width 含 padding 和 border，全局重置惯例
	- 📖 [box-sizing](https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-sizing)
- margin 折叠
	- 垂直方向相邻 margin 合并取较大者；BFC 内不折叠
	- 📖 [外边距折叠](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
- display 内外部类型
	- 外部（block/inline）决定盒子参与流的方式；内部（flex/grid/flow-root）决定子元素布局
	- 📖 [display](https://developer.mozilla.org/zh-CN/docs/Web/CSS/display)
- 块级格式化上下文 BFC
	- 独立渲染区域；overflow:hidden、display:flow-root 等触发；清除浮动/防折叠
	- 📖 [块格式化上下文](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context)

## 布局

- 正常流
	- 块级垂直堆叠、行内水平排列；脱离流的方式：float、position、display 改变
	- 📖 [正常流中的布局](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Introduction)
- Flexbox 弹性布局
	- 一维布局；主轴/交叉轴；justify-content 与 align-items 对齐；flex: grow shrink basis
	- 📖 [Flexbox](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Flexbox) / [弹性盒布局指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Flexible_box_layout)
- Grid 网格布局
	- 二维布局；fr 单位；grid-template-areas 命名区域；minmax/auto-fill 自适应网格
	- 📖 [Grids](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Grids) / [网格布局指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Grid_layout)
- 浮动与清除
	- float 图文环绕的本职；clear 清除；display:flow-root 包含浮动
	- 📖 [Floats](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Floats)
- 定位
	- static/relative/absolute/fixed/sticky；absolute 相对最近非 static 祖先
	- 📖 [定位](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Positioning) / [定位布局指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Positioned_layout)
- 层叠上下文与 z-index
	- z-index 只在定位元素生效；新层叠上下文由 transform/opacity/isolation 等触发
	- 📖 [z-index](https://developer.mozilla.org/zh-CN/docs/Web/CSS/z-index) / [层叠上下文](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_positioned_layout/Stacking_context)
- 盒对齐
	- justify-content / align-items / align-self / place-items 在 flex 与 grid 中统一语义
	- 📖 [盒对齐指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Box_alignment)
- 多列布局
	- column-count / column-width / column-gap；适合长文本分栏
	- 📖 [多列布局](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Multiple-column_Layout)

## 响应式设计

- 媒体查询
	- @media (min-width)、(prefers-color-scheme)、(prefers-reduced-motion)
	- 📖 [媒体查询](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Media_queries) / [媒体查询指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Media_queries)
- 移动优先
	- 先写移动端基础样式，再用 min-width 断点逐层增强
	- 📖 [响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- 容器查询
	- @container 按父容器尺寸而非视口适配；container-type 声明查询容器
	- 📖 [@container](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@container)
- 流式排版
	- clamp(最小, 首选, 最大) 实现字号/间距随视口平滑缩放
	- 📖 [clamp()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clamp)
- 视口与移动适配
	- meta viewport；新视口单位 svh/lvh/dvh 应对移动浏览器工具栏
	- 📖 [视口概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Viewport)
- 兼容旧浏览器
	- 特性查询 @supports 渐进增强；忽略不识别的属性是 CSS 的容错机制
	- 📖 [支持旧浏览器](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Supporting_Older_Browsers) / [@supports](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@supports)

## 颜色、背景与边框

- 颜色
	- 命名色、hex、rgb()/hsl()、hwb()/oklch()；alpha 通道；currentColor
	- 📖 [应用颜色](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_colors/Applying_color) / [颜色指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Colors)
- 背景
	- background-image 多重背景逗号分隔；size/position/repeat/attachment
	- 📖 [背景与边框指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Backgrounds_and_borders)
- 渐变
	- linear-gradient / radial-gradient / conic-gradient；色标可多重叠加
	- 📖 [渐变](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_images/Using_CSS_gradients)
- 边框与圆角
	- border 三要素（width style color）；border-radius 椭圆写法 水平/垂直
	- 📖 [border-radius](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-radius)
- 阴影
	- box-shadow（x y 模糊 扩散 颜色 inset）；text-shadow 无扩散参数
	- 📖 [box-shadow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-shadow)
- 装饰效果
	- filter / backdrop-filter 滤镜；mix-blend-mode 混合；clip-path 裁剪；mask 遮罩
	- 📖 [滤镜效果指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Filter_effects) / [clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path)

## 文本与字体

- 字体族与回退
	- font-family 字体栈，末尾放通用族（sans-serif 等）
	- 📖 [文本和字体样式基础](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Text_styling/Fundamentals)
- @font-face 网络字体
	- 自定义字体；font-display: swap 避免 FOIT；woff2 优先
	- 📖 [网络字体](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Text_styling/Web_fonts) / [字体加载指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Font_loading)
- 文本排版
	- line-height 无单位更优；letter-spacing/word-spacing；text-align；text-indent
	- 📖 [文本指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Text)
- 文本装饰
	- text-decoration 三合一（line color style）；underline-offset 微调下划线
	- 📖 [文本装饰指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Text_decoration)
- 溢出处理
	- text-overflow: ellipsis 配合 white-space:nowrap + overflow:hidden 单行省略
	- 📖 [text-overflow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow)
- 列表样式
	- list-style 类型/图片/位置；::marker 伪元素自定义标记
	- 📖 [列表样式](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Text_styling/Styling_lists) / [列表指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Lists)

## 变换、过渡与动画

- transform 变换
	- translate/rotate/scale/skew；transform-origin 变换基点；3D 需 perspective
	- 📖 [变换指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Transforms) / [transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform)
- transition 过渡
	- 属性 时长 缓动 延迟；只用于可插值的属性
	- 📖 [过渡指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Transitions) / [transition](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition)
- 缓动函数
	- ease/ease-in-out/linear；cubic-bezier() 自定义曲线
	- 📖 [缓动函数指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Easing_functions)
- @keyframes 动画
	- animation 简写八要素；alternate 往返；forwards 保持终态
	- 📖 [动画指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Animations) / [@keyframes](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@keyframes)
- 高性能动画
	- 只动 transform 和 opacity（合成层）；避开触发重排的属性
	- 📖 [will-change](https://developer.mozilla.org/zh-CN/docs/Web/CSS/will-change)
- 滚动驱动动画
	- animation-timeline: scroll()/view()，滚动位置驱动动画进度
	- 📖 [滚动驱动动画指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Scroll-driven_animations)
- 视图过渡
	- view-transition-name + document.startViewTransition 跨页面/状态平滑过渡
	- 📖 [视图过渡指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/View_transitions)

## 现代 CSS 特性

- 自定义属性
	- --变量定义、var() 引用；沿 DOM 树继承，可做运行时主题切换
	- 📖 [使用 CSS 自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)
- @property
	- 注册带类型/初始值的自定义属性，使其可参与过渡与动画
	- 📖 [@property](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@property) / [属性与值 API](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Properties_and_values_API)
- 嵌套
	- 原生嵌套语法；& 引用父选择器
	- 📖 [嵌套指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Nesting)
- :has() 父选择器
	- 根据后代状态反向选中祖先，"父选择器"成真
	- 📖 [:has()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:has)
- 逻辑属性
	- margin-inline/padding-block 等按书写模式而非物理方向，国际化友好
	- 📖 [逻辑属性指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Logical_properties_and_values)
- 书写模式
	- writing-mode 竖排文本；direction 文本方向
	- 📖 [书写模式指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Writing_modes)
- 锚点定位
	- anchor-name + position-anchor 弹层跟随锚点元素定位
	- 📖 [锚点定位指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Anchor_positioning)

## 溢出与滚动

- overflow
	- visible/hidden/scroll/auto/clip；overflow-x 与 overflow-y 独立
	- 📖 [溢出指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Overflow) / [overflow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/overflow)
- 滚动捕捉
	- scroll-snap-type + scroll-snap-align 轮播/分页吸附
	- 📖 [滚动捕捉指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Scroll_snap)
- 滚动行为
	- scroll-behavior: smooth 平滑滚动；overscroll-behavior 阻止滚动链
	- 📖 [overscroll-behavior](https://developer.mozilla.org/zh-CN/docs/Web/CSS/overscroll-behavior)
- 滚动条样式
	- scrollbar-width/scrollbar-color 标准化；::-webkit-scrollbar 旧式定制
	- 📖 [滚动条样式指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Scrollbars_styling)

## 内容与生成

- 生成内容
	- content + ::before/::after；attr() 读取属性值；引号 quotes
	- 📖 [生成内容指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Generated_content)
- CSS 计数器
	- counter-reset/counter-increment/counter() 自动编号（章节、有序列表）
	- 📖 [使用 CSS 计数器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_counter_styles/Using_CSS_counters)
- 计数器样式
	- @counter-style 自定义列表序号符号系统
	- 📖 [计数器样式指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Counter_styles)

## 工程化与无障碍

- 组织 CSS
	- 命名规范（BEM）、注释分区、工具类与组件类分层
	- 📖 [组织 CSS](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Organizing)
- 预处理器概念
	- Sass/Less 变量、嵌套、mixin；构建时编译为原生 CSS
	- 📖 [CSS 预处理器](https://developer.mozilla.org/zh-CN/docs/Glossary/CSS_preprocessor)
- 可访问性
	- 勿用 outline:none 无替代方案；:focus-visible 区分键盘焦点；尊重 prefers-reduced-motion
	- 📖 [CSS 和 JavaScript 无障碍最佳实践](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility/CSS_and_JavaScript)
- CSS 与无障碍测试
	- 颜色对比度、字体大小可缩放、焦点可见性
	- 📖 [技能测试：CSS 和 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility/Test_your_skills/CSS_and_JavaScript)

## 参考来源

- 内容整理自 [MDN CSS 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS)，本地离线镜像：`D:\Download\browserDownload\CSS\CSS\developer.mozilla.org`（`en-US/docs/Web/CSS` 与 `en-US/docs/Learn_web_development/Core`）
