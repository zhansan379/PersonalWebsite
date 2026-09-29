---
title: Vue 思维导图
tags:
  - Vue
  - 前端开发
  - 思维导图
created: 2026-09-29
updated: 2026-09-29
mindmap-plugin: basic
---

# Vue

## 响应式系统

- ref
	- 基本类型的响应式包装；.value 读写；模板中自动解包
	- 📖 [响应式基础](https://vuejs.org/guide/essentials/reactivity-fundamentals.html) / [ref()](https://vuejs.org/api/reactivity-core.html#ref)
- reactive
	- 对象/数组的深层代理；不可替换整个对象（会丢响应性）
	- 📖 [reactive()](https://vuejs.org/api/reactivity-core.html#reactive)
- 响应式原理
	- Proxy 拦截：get 追踪依赖、set 触发更新；ref 靠 .value 拦截
	- 📖 [深入响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- computed 计算属性
	- 缓存派生值，依赖不变不重算；可写计算属性提供 setter
	- 📖 [计算属性](https://vuejs.org/guide/essentials/computed.html) / [computed()](https://vuejs.org/api/reactivity-core.html#computed)
- watch / watchEffect
	- watch 显式指定监听源；watchEffect 自动收集依赖；flush 控制回调时机
	- 📖 [侦听器](https://vuejs.org/guide/essentials/watchers.html)
- 响应式工具
	- toRefs/toRef 解构不丢响应；unref/toValue 统一取值；isRef/isReactive 判断
	- 📖 [响应式工具](https://vuejs.org/api/reactivity-utilities.html)
- 响应式进阶
	- shallowRef/shallowReactive 浅层优化；customRef 自定义；effectScope 批量释放；toRaw/markRaw 逃离代理
	- 📖 [响应式进阶 API](https://vuejs.org/api/reactivity-advanced.html)

## 模板与指令

- 模板语法
	- {{ }} 文本插值；指令 v-xxx；动态参数 :[attr]；修饰符链
	- 📖 [模板语法](https://vuejs.org/guide/essentials/template-syntax.html)
- 条件渲染
	- v-if 真实增删（惰性）vs v-show CSS 切换；v-if 与 v-for 不同元素
	- 📖 [条件渲染](https://vuejs.org/guide/essentials/conditional.html)
- 列表渲染
	- v-for 遍历数组/对象/区间；key 必须稳定唯一；v-memo 条件跳过更新
	- 📖 [列表渲染](https://vuejs.org/guide/essentials/list.html)
- 事件处理
	- @ 监听；内联 vs 方法处理器；.prevent/.stop 与按键修饰符
	- 📖 [事件处理](https://vuejs.org/guide/essentials/event-handling.html)
- 表单双向绑定
	- v-model = :value + @input 语法糖；.lazy/.number/.trim 修饰符
	- 📖 [表单输入绑定](https://vuejs.org/guide/essentials/forms.html)
- 类与样式绑定
	- :class 对象/数组语法；:style 多值与自动前缀
	- 📖 [类与样式绑定](https://vuejs.org/guide/essentials/class-and-style.html)
- 内置指令全集
	- v-text/v-html/v-pre/v-once/v-cloak/v-memo 等 16 个
	- 📖 [内置指令](https://vuejs.org/api/built-in-directives.html)

## 组件系统

- 单文件组件 SFC
	- .vue 三段式；`<script setup>` 编译糖；顶层 await
	- 📖 [单文件组件](https://vuejs.org/guide/scaling-up/sfc.html) / [SFC 规范](https://vuejs.org/api/sfc-spec.html) / [script setup](https://vuejs.org/api/sfc-script-setup.html)
- Props
	- defineProps 声明/校验/默认值；单向数据流；Boolean 转换细节
	- 📖 [Props](https://vuejs.org/guide/components/props.html)
- 组件事件
	- defineEmits 声明与校验；子抛父听
	- 📖 [组件事件](https://vuejs.org/guide/components/events.html)
- 组件 v-model
	- defineModel 宏；多 v-model；自定义修饰符
	- 📖 [组件 v-model](https://vuejs.org/guide/components/v-model.html)
- 插槽
	- 默认/具名/作用域插槽；动态插槽名；无渲染组件模式
	- 📖 [插槽](https://vuejs.org/guide/components/slots.html)
- 透传 Attributes
	- class/style/监听器自动落根元素；inheritAttrs: false + $attrs 手动接管
	- 📖 [透传 Attributes](https://vuejs.org/guide/components/attrs.html)
- 依赖注入
	- provide/inject 跨层级传值；注入响应式数据；Symbol key
	- 📖 [依赖注入](https://vuejs.org/guide/components/provide-inject.html)
- 生命周期
	- onMounted/onUpdated/onUnmounted 等；只能在 setup 同步期注册
	- 📖 [生命周期钩子](https://vuejs.org/guide/essentials/lifecycle.html) / [生命周期 API](https://vuejs.org/api/composition-api-lifecycle.html)
- 模板引用
	- ref 属性拿 DOM/子组件实例；useTemplateRef；v-for 中的引用数组
	- 📖 [模板引用](https://vuejs.org/guide/essentials/template-refs.html)
- 异步组件与注册
	- defineAsyncComponent 按需加载；全局 vs 局部注册
	- 📖 [异步组件](https://vuejs.org/guide/components/async.html) / [组件注册](https://vuejs.org/guide/components/registration.html)

## 逻辑复用

- 组合式函数 Composables
	- use 开头复用响应式逻辑；约定返回 ref；参数可传 ref 自动响应
	- 📖 [组合式函数](https://vuejs.org/guide/reusability/composables.html)
- 自定义指令
	- 钩子对齐生命周期；专注底层 DOM 访问逻辑
	- 📖 [自定义指令](https://vuejs.org/guide/reusability/custom-directives.html)
- 插件
	- app.use 安装；统一注册全局组件/指令/provide
	- 📖 [插件](https://vuejs.org/guide/reusability/plugins.html)

## 内置组件

- Transition
	- 单元素进入/离开；CSS class 六阶段；JS 钩子；mode 过渡模式
	- 📖 [Transition](https://vuejs.org/guide/built-ins/transition.html)
- TransitionGroup
	- 列表过渡；FLIP 移动动画；交错入场
	- 📖 [TransitionGroup](https://vuejs.org/guide/built-ins/transition-group.html)
- KeepAlive
	- 缓存组件实例免重建；include/exclude/max；activated/deactivated
	- 📖 [KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html)
- Teleport
	- 传送到 DOM 任意位置；弹窗/toast 必备；disabled 可开关
	- 📖 [Teleport](https://vuejs.org/guide/built-ins/teleport.html)
- Suspense
	- 协调异步依赖树；default/fallback 两插槽（实验性）
	- 📖 [Suspense](https://vuejs.org/guide/built-ins/suspense.html)
- 特殊元素
	- `<component :is>` 动态组件；`<slot>` 出口；`<template>` 隐形分组
	- 📖 [内置特殊元素](https://vuejs.org/api/built-in-special-elements.html)

## 渲染机制

- 虚拟 DOM 与补丁
	- 模板编译为渲染函数 → vnode → 挂载/ diff 更新
	- 📖 [渲染机制](https://vuejs.org/guide/extras/rendering-mechanism.html)
- 编译时优化
	- 静态提升；补丁标志（patchFlag）靶向更新；树结构打平
	- 📖 [渲染机制](https://vuejs.org/guide/extras/rendering-mechanism.html)
- 渲染函数与 JSX
	- h() 手写 vnode；完全 JS 表达力场景替代模板
	- 📖 [渲染函数与 JSX](https://vuejs.org/guide/extras/render-function.html)
- 自定义渲染器
	- createRenderer 适配非 DOM 平台（终端/Canvas/原生）
	- 📖 [自定义渲染器 API](https://vuejs.org/api/custom-renderer.html)
- nextTick
	- 等待 DOM 更新完成后执行回调
	- 📖 [nextTick](https://vuejs.org/api/general.html#nexttick)

## 应用架构

- 应用实例
	- createApp；全局 config/provide；多应用共存
	- 📖 [创建一个 Vue 应用](https://vuejs.org/guide/essentials/application.html) / [应用 API](https://vuejs.org/api/application.html)
- 路由
	- 官方 Vue Router；客户端路由与组件映射
	- 📖 [路由](https://vuejs.org/guide/scaling-up/routing.html)
- 状态管理
	- 官方 Pinia；简单场景可用 reactive 共享 store
	- 📖 [状态管理](https://vuejs.org/guide/scaling-up/state-management.html)
- 服务端渲染 SSR
	- 同构应用；水合激活；Nuxt 全栈方案；SSG 静态生成
	- 📖 [服务端渲染](https://vuejs.org/guide/scaling-up/ssr.html) / [SSR API](https://vuejs.org/api/ssr.html)
- Web Components
	- 使用原生自定义元素；defineCustomElement 把 Vue 组件导出为原生元素
	- 📖 [Vue 与 Web Components](https://vuejs.org/guide/extras/web-components.html)

## API 风格

- 组合式 vs 选项式
	- 同一响应式内核两种风格；组合式利于逻辑复用与 TS
	- 📖 [简介](https://vuejs.org/guide/introduction.html) / [组合式 API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html)
- 选项式 API 全览
	- data/props/computed/methods/watch/emits；生命周期选项；mixins/extends
	- 📖 [选项：状态](https://vuejs.org/api/options-state.html) / [选项：生命周期](https://vuejs.org/api/options-lifecycle.html)
- 使用 Vue 的多种方式
	- 独立脚本增强静态页 / SPA / SSR 全栈 / SSG / Web Components
	- 📖 [使用 Vue 的多种方式](https://vuejs.org/guide/extras/ways-of-using-vue.html)

## 工程化与质量

- 工具链
	- create-vue 脚手架；Volar 插件；vue-devtools
	- 📖 [工具链](https://vuejs.org/guide/scaling-up/tooling.html)
- TypeScript
	- defineProps 基于类型的声明；ref/reactive 泛型；vue-tsc 检查
	- 📖 [TS 总览](https://vuejs.org/guide/typescript/overview.html) / [TS 与组合式 API](https://vuejs.org/guide/typescript/composition-api.html)
- 测试
	- Vitest + @vue/test-utils 单元/组件测试；Cypress/Playwright E2E
	- 📖 [测试](https://vuejs.org/guide/scaling-up/testing.html)
- 性能
	- 代码分割；v-once/v-memo；虚拟滚动；浅层响应式减少开销
	- 📖 [性能](https://vuejs.org/guide/best-practices/performance.html)
- 安全与无障碍
	- v-html 的 XSS 风险；URL 消毒；语义化与焦点管理
	- 📖 [安全](https://vuejs.org/guide/best-practices/security.html) / [无障碍](https://vuejs.org/guide/best-practices/accessibility.html)
- 生产部署
	- 生产构建去警告；错误监控；产物压缩与 CDN
	- 📖 [生产部署](https://vuejs.org/guide/best-practices/production-deployment.html)

## 参考来源

- 内容整理自 [Vue 官方文档](https://vuejs.org/guide/introduction.html)，本地仓库：`D:\Project\docs`（`src/guide` 与 `src/api`）
