---
title: JavaScript 思维导图
tags:
  - JavaScript
  - 前端开发
  - 思维导图
created: 2026-09-30
updated: 2026-09-30
mindmap-plugin: basic
---

# JavaScript

## 语言基础

- JavaScript 是什么
	- 动态类型、解释执行、基于原型的多范式脚本语言
	- 📖 [JavaScript 指南：介绍](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Introduction) / [技术概览](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/JavaScript_technologies_overview)
- 语法与类型
	- 声明 var/let/const；变量提升；块级作用域；注释与标识符规则
	- 📖 [语法与类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Grammar_and_types)
- 七种原始类型
	- undefined/null/Boolean/Number/String/Symbol/BigInt + Object
	- 📖 [数据类型和数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Data_structures)
- 模板字符串
	- 反引号内嵌 ${} 表达式；多行字符串；标签模板
	- 📖 [模板字面量](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals)
- 词法文法
	- 标识符、字面量、自动分号插入（ASI）规则
	- 📖 [词法文法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar)
- 语言纵览
	- 从其他语言视角理解 JS：数字、字符串、对象、数组的全景介绍
	- 📖 [语言概览](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Language_overview)

## 控制流与错误处理

- 条件语句
	- if/else、switch（严格相等匹配）；块级作用域
	- 📖 [控制流与错误处理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- 循环与迭代
	- for/while/do...while；for...of（迭代值）vs for...in（枚举键）；break/continue/label
	- 📖 [循环与迭代](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Loops_and_iteration)
- 错误处理
	- try/catch/finally；throw 抛任意值；Error 类型体系（TypeError/ReferenceError…）
	- 📖 [try...catch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch) / [Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)
- 语句总览
	- 声明语句、流程控制、迭代语句的完整参考
	- 📖 [语句与声明](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements)

## 运算符与表达式

- 赋值与比较
	- 解构赋值；==（隐式转换）vs ===（严格相等）；Object.is 同值比较
	- 📖 [表达式与运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators)
- 相等性判断
	- 宽松相等、严格相等、同值零相等三种算法及 +0/-0、NaN 陷阱
	- 📖 [相等性比较与同值比较](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- 算术与位运算
	- 取余 %、幂 **；位运算按 32 位整数处理
	- 📖 [运算符参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators)
- 逻辑与空值运算
	- && 短路、|| 短路、?? 空值合并（只判 null/undefined）；?. 可选链
	- 📖 [可选链 ?.](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining) / [空值合并](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- 其他关键运算符
	- typeof/instanceof；delete/in；展开语法 ...；逗号运算符；运算符优先级表
	- 📖 [运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_precedence)

## 数字、字符串与日期

- Number 体系
	- 双精度浮点；0.1+0.2 精度问题；Number.isInteger/isNaN；parseInt/parseFloat
	- 📖 [数字与字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Numbers_and_strings) / [Number](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number)
- BigInt 大整数
	- 任意精度整数；n 后缀；不能与 Number 混算
	- 📖 [BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- Math 对象
	- 舍入、随机数、三角函数；Math.max/min 配合展开语法
	- 📖 [Math](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math)
- String 操作
	- 不可变性；slice/substring；includes/replaceAll；padStart；split/join
	- 📖 [String](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)
- Date 日期
	- Date.now/getTime 时间戳；Date.parse 解析；UTC 与本地时区
	- 📖 [日期与时间表示](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Representing_dates_times) / [Date](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)
- 国际化 Intl
	- Intl.NumberFormat/DateTimeFormat/Collator 本地化格式化
	- 📖 [国际化](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Internationalization) / [Intl](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl)

## 函数

- 函数声明与表达式
	- 声明会提升；函数表达式可匿名；IIFE 立即执行
	- 📖 [函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- 箭头函数
	- 无自身 this/arguments；词法 this；不可作构造函数
	- 📖 [箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- 参数处理
	- 默认参数；rest 剩余参数；arguments 对象（类数组）
	- 📖 [默认参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Default_parameters) / [剩余参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- 作用域与闭包
	- 函数嵌套形成作用域链；闭包 = 函数 + 其词法环境，可持有私有状态
	- 📖 [闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Closures)
- this 绑定
	- 调用方式决定 this；call/apply/bind 显式绑定；全局/严格模式差异
	- 📖 [this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- 高阶与回调
	- 函数作为一等公民：作参数（回调）、作返回值
	- 📖 [Function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function)

## 集合类型

- 数组
	- 可变长度；索引访问；length 截断；稀疏数组陷阱
	- 📖 [索引集合](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Indexed_collections) / [Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- 数组核心方法
	- map/filter/reduce 三件套；find/some/every；flat/flatMap；不可变方法 toSorted/toSpliced/with
	- 📖 [Array.prototype.map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map) / [reduce](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- Map 与 Set
	- Map 任意键、有序、size；WeakMap 弱引用键；Set 去重；WeakSet
	- 📖 [键控集合](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Keyed_collections) / [Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map) / [Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
- TypedArray 与 ArrayBuffer
	- 二进制数据视图；Uint8Array 等；DataView 精细读写
	- 📖 [类型化数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Typed_arrays) / [ArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

## 对象

- 对象基础
	- 字面量创建；属性访问点 vs 方括号；对象是可变引用
	- 📖 [使用对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects) / [Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
- 属性操作
	- Object.keys/values/entries；Object.assign 合并；hasOwn/in 判断存在
	- 📖 [Object.keys](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
- 属性的可枚举性与所有权
	- 自身属性 vs 原型属性；可枚举决定 for...in/keys 是否可见
	- 📖 [属性的可枚举性和所有权](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
- getter/setter
	- 访问器属性；defineProperty 精细控制可写/可枚举/可配置
	- 📖 [Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- 冻结与密封
	- Object.freeze 完全不可变（浅）；seal 禁增删；preventExtensions 禁新增
	- 📖 [Object.freeze](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
- JSON 序列化
	- JSON.stringify/parse；循环引用报错；toJSON 自定义
	- 📖 [JSON](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)

## 类与原型

- 原型链
	- 对象间委托；__proto__ 与 prototype；属性查找沿链向上；Object.create
	- 📖 [继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)
- class 语法
	- 原型的语法糖；constructor；extends 继承；super 调父类
	- 📖 [使用类](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_classes) / [Classes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- 私有成员
	- #field 私有字段/方法；static 静态成员；实例字段声明
	- 📖 [私有属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_properties)
- 静态初始化块
	- static {} 在类定义时执行，可访问私有成员
	- 📖 [静态初始化块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)

## 迭代器与生成器

- 迭代协议
	- Symbol.iterator 定义可迭代对象；next() 返回 {value, done}
	- 📖 [迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
- 生成器函数
	- function* 惰性产出；yield 暂停/恢复；双向传值
	- 📖 [迭代器与生成器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators) / [function*](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*)
- 自定义迭代器
	- 实现 Symbol.iterator 使对象可用 for...of 与展开语法
	- 📖 [迭代器和生成器指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators)

## 异步编程

- Promise 核心
	- pending/fulfilled/rejected 三态不可逆；then/catch/finally 链式
	- 📖 [使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises) / [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- Promise 组合器
	- all 全成功、allSettled 全落定、race 竞速、any 任一成功
	- 📖 [Promise.all](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- async/await
	- 基于 Promise 的语法糖；await 暂停 async 函数；try/catch 捕获异步错误
	- 📖 [async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- 事件循环
	- 调用栈 + 任务队列；宏任务（setTimeout）vs 微任务（Promise.then）；微任务优先
	- 📖 [JavaScript 执行模型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Execution_model) / [并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)
- 定时器
	- setTimeout/setInterval；clearTimeout；延迟不保证精确
	- 📖 [setTimeout](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setTimeout)
- 异步迭代
	- for await...of 消费异步可迭代对象；Symbol.asyncIterator
	- 📖 [for await...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for-await...of)

## 模块

- ES Module 基础
	- import/export；静态结构可 tree-shaking；模块默认严格模式、顶级作用域隔离
	- 📖 [JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- 导出方式
	- 具名导出 vs 默认导出；export * from 再导出；import 重命名
	- 📖 [export](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/export) / [import](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import)
- 动态导入
	- import() 返回 Promise；按需加载代码分割
	- 📖 [动态 import](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/import)
- 循环依赖
	- 提升声明可部分解决；运行时绑定是"活"的引用
	- 📖 [模块指南：循环导入](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

## 正则表达式

- 正则基础
	- 字面量 /pattern/flags；字符类、量词、分组、断言
	- 📖 [正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions) / [RegExp](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
- 断言与边界
	- ^ $ \b 边界；lookahead (?=) 前瞻、lookbehind (?<=) 后顾
	- 📖 [断言](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Assertions)
- 在字符串方法中使用
	- match/matchAll；replace 支持 $ 引用与函数回调；split/search
	- 📖 [String.prototype.replace](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)

## 元编程与高级特性

- Proxy 代理
	- 拦截对象操作（get/set/has…）；handler traps 自定义行为
	- 📖 [元编程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Meta_programming) / [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- Reflect 反射
	- Proxy traps 的默认行为实现；与 Proxy 一一对应
	- 📖 [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- Symbol
	- 唯一标识；知名符号定制行为（Symbol.iterator/toPrimitive/hasInstance）
	- 📖 [Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- 严格模式
	- 'use strict' 消除静默错误；禁未声明变量、重复参数等
	- 📖 [严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)
- 内存管理
	- 自动垃圾回收；可达性标记清除；循环引用已可处理；WeakRef/FinalizationRegistry
	- 📖 [内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Memory_management)
- 资源管理
	- using 声明（显式资源管理）；Symbol.dispose 确定性释放
	- 📖 [资源管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Resource_management)
- 废弃特性
	- with 语句、arguments.caller 等遗留特性，新代码勿用
	- 📖 [已废弃和过时的特性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Deprecated_and_obsolete_features)

## DOM 操作与事件

- DOM 脚本基础
	- document 查询（querySelector）；创建/插入/删除节点；操作属性与样式
	- 📖 [DOM 脚本简介](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Scripting/DOM_scripting)
- 事件监听
	- addEventListener 注册；事件对象；preventDefault/stopPropagation；移除监听
	- 📖 [事件入门](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Scripting/Events)
- 事件传播
	- 捕获 → 目标 → 冒泡三阶段；事件委托利用冒泡管理动态元素
	- 📖 [事件冒泡](https://developer.mozilla.org/zh-CN/docs/Learn/API/Client-side_web_APIs/Introduction#事件)
- 常用事件类型
	- 鼠标/键盘/表单/窗口事件；input vs change；DOMContentLoaded vs load
	- 📖 [Event 参考](https://developer.mozilla.org/zh-CN/docs/Web/API/Event)

## 参考来源

- 内容整理自 [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)，本地离线镜像：`D:\Download\browserDownload\JavaScript\JavaScript\developer.mozilla.org`（`en-US/docs/Web/JavaScript` 与 `en-US/docs/Learn_web_development/Core/Scripting`）
