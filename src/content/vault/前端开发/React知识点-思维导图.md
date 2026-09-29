---
title: React 思维导图
tags:
  - React
  - 前端开发
  - 思维导图
created: 2026-09-29
updated: 2026-09-29
mindmap-plugin: basic
---

# React

## 组件模型

- 函数组件
	- 返回 JSX 的普通函数；首字母大写；不可嵌套定义组件
	- 📖 [你的第一个组件](https://zh-hans.react.dev/learn/your-first-component)
- JSX 语法
	- JS 的语法扩展；单一根元素；属性 camelCase；标签必须闭合
	- 📖 [使用 JSX 书写标签语言](https://zh-hans.react.dev/learn/writing-markup-with-jsx)
- 大括号表达式
	- `{}` 内嵌任意 JS 表达式；style 需双大括号传对象
	- 📖 [在 JSX 中通过大括号使用 JavaScript](https://zh-hans.react.dev/learn/javascript-in-jsx-with-curly-braces)
- 组合优于继承
	- children 插槽；组件间通过组合复用 UI
	- 📖 [将 Props 传递给组件](https://zh-hans.react.dev/learn/passing-props-to-a-component)
- 导入与导出
	- 默认导出 vs 具名导出；同一文件可混用
	- 📖 [组件的导入与导出](https://zh-hans.react.dev/learn/importing-and-exporting-components)

## 渲染机制

- 渲染三阶段
	- 触发（初次/setState）→ 渲染（调用组件）→ 提交（最小化 DOM 变更）
	- 📖 [渲染和提交](https://zh-hans.react.dev/learn/render-and-commit)
- state 快照
	- 一次渲染内 state 固定；事件处理器读到的是当次快照
	- 📖 [state 如同一张快照](https://zh-hans.react.dev/learn/state-as-a-snapshot)
- 批量更新
	- 事件结束才重渲染；多次 setState(n+1) 无效 → 更新函数 n=>n+1
	- 📖 [把一系列 state 更新加入队列](https://zh-hans.react.dev/learn/queueing-a-series-of-state-updates)
- 渲染纯粹性
	- 相同输入相同输出；不修改渲染前已存在的变量
	- 📖 [保持组件纯粹](https://zh-hans.react.dev/learn/keeping-components-pure)
- UI 树模型
	- 渲染树（嵌套关系）vs 模块依赖树（决定打包体积）
	- 📖 [将 UI 视为树](https://zh-hans.react.dev/learn/understanding-your-ui-as-a-tree)
- 并发渲染
	- Transition 标记可中断的非紧急更新，保持 UI 响应
	- 📖 [useTransition](https://zh-hans.react.dev/reference/react/useTransition)

## State 状态管理

- useState 原理
	- 组件的"记忆"；普通变量重渲染即丢失；set 函数触发渲染
	- 📖 [state：组件的记忆](https://zh-hans.react.dev/learn/state-a-components-memory)
- 不可变更新
	- 对象逐层拷贝；数组用 concat/filter/map 返回新数组；Immer 简化
	- 📖 [更新 state 中的对象](https://zh-hans.react.dev/learn/updating-objects-in-state) / [更新 state 中的数组](https://zh-hans.react.dev/learn/updating-arrays-in-state)
- state 结构设计
	- 合并关联 state；消除矛盾与冗余；嵌套数据扁平化
	- 📖 [选择 State 结构](https://zh-hans.react.dev/learn/choosing-the-state-structure)
- 状态提升
	- state 上移至共同父组件，props 单向下发
	- 📖 [在组件间共享状态](https://zh-hans.react.dev/learn/sharing-state-between-components)
- key 重置 state
	- 同位置同 key 保留 state；改 key 销毁重建
	- 📖 [对 state 进行保留和重置](https://zh-hans.react.dev/learn/preserving-and-resetting-state)
- useReducer
	- (state, action) => newState；dispatch 描述"发生了什么"；逻辑集中可测
	- 📖 [迁移状态逻辑至 Reducer 中](https://zh-hans.react.dev/learn/extracting-state-logic-into-a-reducer)
- 全局状态方案
	- reducer + context = 轻量全局 store，免第三方库
	- 📖 [使用 Reducer 和 Context 拓展你的应用](https://zh-hans.react.dev/learn/scaling-up-with-reducer-and-context)

## 组件通信

- props 单向数据流
	- 父传子只读；展开语法透传；默认值
	- 📖 [将 Props 传递给组件](https://zh-hans.react.dev/learn/passing-props-to-a-component)
- Context 跨层级
	- Provider 供值、useContext 取值；避免 prop drilling
	- 📖 [使用 Context 深层传递参数](https://zh-hans.react.dev/learn/passing-data-deeply-with-context)
- ref 命令式通信
	- 父组件经 ref 调子组件方法；useImperativeHandle 定制暴露
	- 📖 [useImperativeHandle](https://zh-hans.react.dev/reference/react/useImperativeHandle)
- Portal
	- createPortal 渲染到 DOM 任意位置（弹窗/浮层）
	- 📖 [createPortal](https://zh-hans.react.dev/reference/react-dom/createPortal)

## Hooks 体系

- Hook 规则
	- 只在顶层调用（不进循环/条件/嵌套）；只在 React 函数中调用
	- 📖 [Hook 的规则](https://zh-hans.react.dev/reference/rules/rules-of-hooks)
- 状态 Hook
	- useState / useReducer
	- 📖 [useState](https://zh-hans.react.dev/reference/react/useState) / [useReducer](https://zh-hans.react.dev/reference/react/useReducer)
- Effect Hook
	- useEffect（提交后）/ useLayoutEffect（绘制前测量）/ useInsertionEffect（CSS-in-JS）
	- 📖 [useEffect](https://zh-hans.react.dev/reference/react/useEffect) / [useLayoutEffect](https://zh-hans.react.dev/reference/react/useLayoutEffect)
- 性能 Hook
	- useMemo / useCallback / useTransition / useDeferredValue
	- 📖 [useMemo](https://zh-hans.react.dev/reference/react/useMemo) / [useCallback](https://zh-hans.react.dev/reference/react/useCallback) / [useDeferredValue](https://zh-hans.react.dev/reference/react/useDeferredValue)
- Ref 与 Context Hook
	- useRef 可变容器；useImperativeHandle；useContext
	- 📖 [useRef](https://zh-hans.react.dev/reference/react/useRef) / [useContext](https://zh-hans.react.dev/reference/react/useContext)
- 表单与动作 Hook
	- useActionState / useOptimistic / useFormStatus / use（渲染中读 Promise）
	- 📖 [useActionState](https://zh-hans.react.dev/reference/react/useActionState) / [useOptimistic](https://zh-hans.react.dev/reference/react/useOptimistic) / [use](https://zh-hans.react.dev/reference/react/use)
- 订阅与工具 Hook
	- useSyncExternalStore 订阅外部 store；useId；useDebugValue
	- 📖 [useSyncExternalStore](https://zh-hans.react.dev/reference/react/useSyncExternalStore) / [useId](https://zh-hans.react.dev/reference/react/useId)
- 自定义 Hook
	- use 开头；复用状态逻辑而非 state 本身；组件间共享行为
	- 📖 [使用自定义 Hook 复用逻辑](https://zh-hans.react.dev/learn/reusing-logic-with-custom-hooks)

## 副作用与外部系统

- Effect 同步模型
	- 与外部系统同步；依赖变化重新执行；cleanup 做清理
	- 📖 [使用 Effect 进行同步](https://zh-hans.react.dev/learn/synchronizing-with-effects)
- 你可能不需要 Effect
	- 派生值渲染期计算；用户操作放事件处理器；勿用 Effect 链式更新
	- 📖 [你可能不需要 Effect](https://zh-hans.react.dev/learn/you-might-not-need-an-effect)
- Effect 生命周期
	- 以"开始/停止同步"思考，而非挂载/卸载；每次同步独立
	- 📖 [响应式 Effect 的生命周期](https://zh-hans.react.dev/learn/lifecycle-of-reactive-effects)
- Effect Event
	- 读取最新 props/state 但不作为响应式依赖（实验性 useEffectEvent）
	- 📖 [将事件从 Effect 中分开](https://zh-hans.react.dev/learn/separating-events-from-effects)
- 移除 Effect 依赖
	- 依赖由响应值"选中"；逻辑下移/更新函数/Effect Event 消依赖
	- 📖 [移除 Effect 依赖](https://zh-hans.react.dev/learn/removing-effect-dependencies)

## Ref 与 DOM

- ref 引用值
	- 改变不触发渲染；存定时器 ID、前次值等渲染外数据
	- 📖 [使用 ref 引用值](https://zh-hans.react.dev/learn/referencing-values-with-refs)
- ref 操作 DOM
	- focus/scroll/测量；ref 回调；透传到子组件 DOM
	- 📖 [使用 ref 操作 DOM](https://zh-hans.react.dev/learn/manipulating-the-dom-with-refs)
- flushSync
	- 强制立即同步提交更新（第三方 UI 集成等场景，慎用）
	- 📖 [flushSync](https://zh-hans.react.dev/reference/react-dom/flushSync)

## 条件渲染与列表

- 条件渲染
	- if / && / 三目；返回 null 不渲染但保留组件结构
	- 📖 [条件渲染](https://zh-hans.react.dev/learn/conditional-rendering)
- 列表与 key
	- map 渲染；key 稳定唯一且不用索引（顺序会变的场景）
	- 📖 [渲染列表](https://zh-hans.react.dev/learn/rendering-lists)
- Fragment
	- 多节点分组不增 DOM；需要 key 时用显式 `<Fragment>`
	- 📖 [Fragment](https://zh-hans.react.dev/reference/react/Fragment)

## 性能优化

- memo
	- props 浅比较不变则跳过重渲染
	- 📖 [memo](https://zh-hans.react.dev/reference/react/memo)
- 缓存计算与函数
	- useMemo 缓存昂贵计算；useCallback 稳定函数引用配合 memo
	- 📖 [useMemo](https://zh-hans.react.dev/reference/react/useMemo) / [useCallback](https://zh-hans.react.dev/reference/react/useCallback)
- 代码分割
	- lazy 动态导入组件 + Suspense 兜底
	- 📖 [lazy](https://zh-hans.react.dev/reference/react/lazy) / [Suspense](https://zh-hans.react.dev/reference/react/Suspense)
- 并发降级
	- useTransition / useDeferredValue 让紧急更新优先渲染
	- 📖 [useDeferredValue](https://zh-hans.react.dev/reference/react/useDeferredValue)
- Profiler 测量
	- 编程式收集渲染耗时；配合 DevTools Profiler 面板
	- 📖 [Profiler](https://zh-hans.react.dev/reference/react/Profiler)
- React Compiler
	- 构建期自动记忆化，替代手写 useMemo/useCallback；需遵循 React 规则
	- 📖 [React Compiler 介绍](https://zh-hans.react.dev/learn/react-compiler/introduction)

## 内置组件

- Suspense
	- 子树未就绪（懒加载/数据）时显示 fallback
	- 📖 [Suspense](https://zh-hans.react.dev/reference/react/Suspense)
- StrictMode
	- 开发期双调用渲染与 Effect，提前暴露不纯与副作用问题
	- 📖 [StrictMode](https://zh-hans.react.dev/reference/react/StrictMode)
- Activity 与 ViewTransition
	- 隐藏子树保留 state 并可预渲染；声明式视图过渡动画
	- 📖 [Activity](https://zh-hans.react.dev/reference/react/Activity) / [ViewTransition](https://zh-hans.react.dev/reference/react/ViewTransition)
- DOM 特殊组件
	- form action 直调函数；link/meta/title/style/script 自动提升到 head
	- 📖 [form](https://zh-hans.react.dev/reference/react-dom/components/form) / [link](https://zh-hans.react.dev/reference/react-dom/components/link)

## 服务端渲染与 RSC

- 客户端入口
	- createRoot 渲染；hydrateRoot 注水接管服务端 HTML
	- 📖 [createRoot](https://zh-hans.react.dev/reference/react-dom/client/createRoot) / [hydrateRoot](https://zh-hans.react.dev/reference/react-dom/client/hydrateRoot)
- 流式 SSR
	- renderToPipeableStream（Node）/ renderToReadableStream（Web）；Suspense 分段下发
	- 📖 [renderToPipeableStream](https://zh-hans.react.dev/reference/react-dom/server/renderToPipeableStream)
- 字符串与静态预渲染
	- renderToString/renderToStaticMarkup 一次性输出；prerender 静态生成（SSG）
	- 📖 [renderToString](https://zh-hans.react.dev/reference/react-dom/server/renderToString) / [prerender](https://zh-hans.react.dev/reference/react-dom/static/prerender)
- Server Components
	- 服务端先行渲染；零打包体积直接访问后端资源
	- 📖 [Server Components](https://zh-hans.react.dev/reference/rsc/server-components)
- Server Functions 与指令
	- 'use server' 暴露服务端函数（含 form action）；'use client' 标记客户端边界
	- 📖 [Server Functions](https://zh-hans.react.dev/reference/rsc/server-functions) / ['use client'](https://zh-hans.react.dev/reference/rsc/use-client) / ['use server'](https://zh-hans.react.dev/reference/rsc/use-server)
- 资源预加载
	- preload/preinit/preconnect/prefetchDNS 声明式加速资源
	- 📖 [preload](https://zh-hans.react.dev/reference/react-dom/preload) / [preinit](https://zh-hans.react.dev/reference/react-dom/preinit)

## React 规则

- 组件和 Hook 必须纯粹
	- 幂等渲染；props/state/context 视作不可变；副作用移出渲染
	- 📖 [组件和 Hook 必须纯粹](https://zh-hans.react.dev/reference/rules/components-and-hooks-must-be-pure)
- React 调用组件和 Hook
	- 不要在普通函数中直接调用组件函数，交给 JSX 与 React 调度
	- 📖 [React 调用组件和 Hook](https://zh-hans.react.dev/reference/rules/react-calls-components-and-hooks)
- Hook 的规则
	- 顶层调用 + 仅 React 函数；eslint-plugin-react-hooks 静态检查
	- 📖 [Hook 的规则](https://zh-hans.react.dev/reference/rules/rules-of-hooks)

## 工程化与生态

- 应用创建方式
	- 全栈框架（Next.js/React Router）；Vite 自建管线；嵌入现有项目
	- 📖 [创建一个 React 应用](https://zh-hans.react.dev/learn/creating-a-react-app) / [从零构建](https://zh-hans.react.dev/learn/build-a-react-app-from-scratch) / [添加到现有项目](https://zh-hans.react.dev/learn/add-react-to-an-existing-project)
- TypeScript
	- props/state/事件/Hook 的类型标注；严格模式
	- 📖 [使用 TypeScript](https://zh-hans.react.dev/learn/typescript)
- 测试与 act
	- act 包裹渲染与交互，确保更新与 Effect 应用完毕再断言
	- 📖 [act](https://zh-hans.react.dev/reference/react/act)
- 开发者工具
	- Components/Profiler 面板；编辑器 ESLint 集成
	- 📖 [React 开发者工具](https://zh-hans.react.dev/learn/react-developer-tools)

## 参考来源

- 内容整理自 [React 中文文档](https://zh-hans.react.dev/learn)，本地仓库：`D:\Project\zh-hans.react.dev`（`src/content/learn` 与 `src/content/reference`）
