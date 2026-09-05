---
title: 面试整理-Python asyncio 协程
tags:
  - Python
  - asyncio
  - 协程
  - 并发
  - 面试
  - 编程
created: 2026-08-27
updated: 2026-08-27
---

# 面试整理：Python asyncio 协程

> Python 并发方向的**必考题**。考的不是背 API，而是看你有没有抓住两条主线：**① asyncio 是单进程单线程里的「协作式」并发，靠主动让出，不提升运算速度、只省等待时间；② 严格区分 coroutine（协程对象）与 task（任务），coroutine 不变成 task 就不执行**。
> 一句话记忆：**asyncio = 一个 event loop（大脑）+ 一堆 task（待执行任务），全程只有一段代码在跑，谁在等待谁就让出控制权。**

> 源材料：B 站《【python】asyncio 的理解与入门》BV1oa411b7c9（Python 3.7+ 最新用法）

## 一、通用回答框架

不要一上来就贴 `async/await` 语法，那听起来像背代码。按**「定调 → 建立心智模型 → 拆核心概念 → 讲三种调度方式 → 点出本质边界」**递进，最能体现理解深度：

```
1. 一句话定调：asyncio 的本质（单线程协作式并发，不加速只省等待）   ← 先给结论，破掉「协程会更快」误区
2. 建立心智模型：event loop 是大脑，下面是很多 task               ← 核心图景
3. 拆最易混淆概念：coroutine vs task vs future                    ← 体现区分能力
4. 讲三种转 task 的方式：await / create_task / gather             ← 体现工程使用
5. 主动补边界与坑点：并发≠并行、无等待不加分、阻塞会卡死           ← 掌握节奏、引导追问
```

**开场句模板：**
> 「asyncio 虽然引入了一套新语法，但它本质上还是**一段正常的单进程单线程程序**，它**并不能提升运算速度**，它的价值在于**处理那些需要等待的任务**（最典型就是网络 IO）。它的运行核心是一个 **event loop**，像一个大脑面对很多可执行的任务，决定先跑哪个——但注意，**同一时刻只有一个任务在跑**，任务必须在等待时**主动交还控制权**，而不是像线程那样被系统抢占。」

## 二、核心概念总览（背这张表）

| 概念 | 是什么 | key point |
|---|---|---|
| **Coroutine Function** | `async def` 定义的函数 | 调用它**不会执行任何代码**，只返回一个 coroutine object（像生成器函数） |
| **Coroutine Object** | 调用 coroutine function 得到的对象 | **不变成 task 就不会被真正执行**；直接调用会得到 RuntimeWarning |
| **Task** | 把 coroutine 包装并注册进 event loop 的任务 | **只有 task 才会被调度执行**，才有状态（挂起/完成/取消） |
| **Future** | 一个「将来会有结果」的占位符/结果容器 | `asyncio.gather()` 的返回值就是一个 future，可被 await |
| **Event Loop** | 并发调度核心，「大脑」 | 决定下一个跑哪个 task；**不能强行打断**，只能等 task 主动让 |
| **asyncio.run(coro)** | 从同步进入异步模式的唯一入口 | 做两件事：①建 event loop ②把传入 coroutine 变成第一个 task |
| **await** | 让出控制权 + 等结果 + 取返回值 | 是协程里唯一的主动调度点 |

> **最关键的区分**：coroutine（对象）≠ task。**coroutine 只有在变成 task（被 event loop 调度）之后才开始执行**。但要注意一个常见误解：**直接 `await` 一个 coroutine 并不会把它变成 task**——它只是把该协程的代码**在当前 task 内同步执行**，到它内部的 Future 挂起点才让出。真正把 coroutine「隐式变成 task」的是 `gather()`（内部经 `ensure_future`）；显式变 task 的是 `asyncio.create_task`（及顶层入口 `asyncio.run`）。**event loop 调度的最小单位永远是 task，它无法直接执行裸协程。**

## 三、核心要点展开（回答时按顺序讲）

### 3.1 本质：asyncio 是什么（第一必答点）

- asyncio 只是一个**新语法**（`async/await`），**不是新的神奇机制**；底层仍是**单进程单线程**的普通 Python 程序。
- **它不能提升运算速度**；它只适合处理**需要等待（IO bound）**的任务——真正运算很少、大部分时间在等回复。
- 网络通读是典型场景：等待时间可以交给别的 task 干活。

> 面试加分表达：**「它是把等待的时间利用起来，而不是把计算变快」**。如果代码里根本没有等待，协程毫无帮助。

### 3.2 心智模型：event loop + task

- **event loop = 大脑**，面对一批「可执行的 task」，决定先跑哪个。
- **同一时刻只有一个 task 在跑**，不存在系统级上下文切换，跟线程不一样。
- task **无法命令** event loop 去跑某个 task，**只能告诉 event loop「我在等 XX task」**；最终跑谁由 event loop 决定。

> 关键理解：**这是「协作式」调度**，不是「抢占式」。event loop 没有能力从 task 手里强行拿回控制权，**必须 task 主动交还**。交还控制权只有两种方式：**① await 交回；② 函数运行完毕交回**。所以**一个 task 里若有死循环，整个程序就卡死**。

### 3.3 好处：无竞争冒险

- 因为控制权**明确、显式**地交给 event loop，你能清楚地知道每个任务**什么时候停止运算**——没有线程那种系统级的随机抢占，**不存在竞争冒险（race condition）问题**（单线程内部，让出点之间是原子化的）。

> 面试可以对比 IT：**线程=抢占式，随时可能被切走→要考虑数据竞争+加锁；协程=协作式，只在 await 处让出→一个 task 从开始到下一个 await 之间代码天然不需要加锁**。

### 3.4 coroutine function 与 coroutine object（易混点）

```python
async def main():           # coroutine function
    print("hello")
```

- `main()` 的返回值**不是**字符串，而是**一个 coroutine object**；`print("hello")` **不会**被执行（会有 RuntimeWarning）。
- 要真正运行，需要**进入 asyncio 模式（建 event loop）+ 把 coroutine 变成 task**。

### 3.5 进入异步模式：asyncio.run()

```python
asyncio.run(main())   # 参数是 coroutine（不是 task）
```

- 是**同步模式 → 异步模式的唯一入口**，做两件事：① 建立 event loop；② 把传入的 coroutine **变成第一个 task**。
- event loop 建立后就去找可执行的 task，于是开始运行 `main` 这个 task。
- 这也印证了：**event loop 的顶层入口必须是 task，它无法直接执行一个裸协程**——`asyncio.run` 的那个包装动作就是关键。

### 3.6 三种「把 coroutine 变成 task」的方式（核心调度，重点讲）

**① 直接 await 一个 coroutine** —— 这是**串行**的，不是我们要的并发，而且**不会变成 task**：

> ⚠️ **重要纠正（修正上期误区）**：`await` 一个协程，**并不会把它包装成 Task**。`await coro` 本质类似**调用一个生成器、驱动它的代码在当前 task 内执行**——这些步骤**同步执行**，直到它内部遇到一个挂起点（通常是 inner Future，例如 `asyncio.sleep` 内部 new 一个 Future 再 `await` 它）才停下让出控制权。所以其实是**内层完整 await 了那个 Future**，而该协程始终隶属于**当前同一个 task**，**没有产生新的调度单元**。

`await coroutine` 与 `await task` 的本质差异：
- `await coroutine`：把协程**内联**进当前 task 执行，**不产生新 task / 新调度单元**。
- `await task`：**先**（显式 `create_task`，或由 `gather` 内部包装）把协程变成独立 task 注册进 event loop，才成为**可被并发调度**的新单元。

> 两种写法**最终结果一样，但内部机制不同**，一定要分清。正因为 `await coroutine` 不新建调度单元，`await say_after("hello",1); await say_after("world",2)` 会**串行 3 秒**——必须等第一个跑完才启动第二个。结论：**直接用 `await coroutine` 拿不到并发**，要先 `create_task`/`gather` 把协程变成独立 task 才有并发。

**② asyncio.create_task()** —— 先创建，再统一 await，才能并发：

```python
task1 = asyncio.create_task(say_after("hello", 1))
task2 = asyncio.create_task(say_after("world", 2))
await task1          # 此时 await 的是 task，不再是 coroutine
await task2
```

- `create_task(coro)`：把 coroutine **包装成 task 并注册到 event loop**，**但不立即执行**（要等当前 task 让出控制权）。
- 关键差异：`await` **一个 task** 时，就**省略了「把 coroutine 变成 task」这一步**，只做「等它完成 + 让出控制权 + 取返回值」。
- main 趁自己还有控制权，先把两个 task 都建好注册进 event loop；到真正 `await task1` 时让出控制权，event loop 发现有 task2 可以执行 → **两个 task 同时等待 → 2 秒搞定**。

**③ asyncio.gather()** —— 批量并发 + 自动收集返回值，免手写 create_task：

```python
results = await asyncio.gather(say_after("hello",1), say_after("world",2))
# results = ['hello-1', 'world-2']，顺序与传入顺序一致
```

- `gather()` **不是** coroutine function，参数可以是**多个 coroutine / task / future**，返回一个 **future**（可 await）。
- 若传入的是 coroutine，会**自动先把每个隐式变成 task** 并注册进 event loop → 不用手动 create_task。
- `await` 这个 future = 告诉 event loop「等里面**每一个** task 都完成我才继续」，并把**所有返回值按传入顺序收集成一个 list** 返回。
- 同一段逻辑，用 `await coroutine` 是 3 秒，用 `gather()` 是 2 秒（因为 gather 先把两个 coroutine 变 task，main 执行到 await 时才交给 event loop，event loop 有更多 task 可调度）。

> 命题焦点：**await 一个 coroutine（串行） vs await 一个 task（可并行） vs gather（批量并发+收集返回值）** 的区别，是面试官最爱的抓手。

### 3.7 拿返回值：必须 await

- coroutine 内部正常 `return f"..."`。
- **要拿到 coroutine/task 的返回值，必须是 `result = await task`（或 `= await coro`）**，**不能**是 `result = task` —— 那是 task 对象本身，不是返回值。`await` 负责「把结果取出来」。

## 四、结论与本质边界（收尾必讲）

- **并发（concurrent）≠ 并行（parallel）**：虽然这叫「并发」，但**同时刻只有一段代码在跑**，它只是**再利用等待时间**。
- **没有等待就没有收益**：如果代码里没有「等待」这件事，协程对代码没有任何帮助。
- **一个 task 阻塞/死循环会卡死全部**：因为协作式调度，event loop 无法强抢控制权。
- **务必分清 coroutine 与 task**：coroutine 只有被 event loop 调度（变成 task）才会执行；**直接 `await` 协程不会变成 task**（只是内联执行到 inner Future 挂起点）。真正会变成 task 的时机 = `create_task` 显式包装 / `gather`（内部 `ensure_future`）/ 顶层 `asyncio.run`。**event loop 调度的最小单位永远是 task。**

## 五、30 秒速答版

> asyncio 是 Python 单进程单线程里的**协作式并发**框架，核心是**一个 event loop + 一群 task**。它不像线程那样被系统抢占，而是**每个 task 在等待时主动交还控制权**，所以同一时刻只有一段代码在跑，它**不提升运算速度，只把 IO 等待的时间利用起来**，因此适合网络这种 IO 密集任务，也正因为是协作式、让出点显式，**没有竞争冒险问题**。
> 使用上有三件事要搞清：**① coroutine function（`async def`）调用只返回 coroutine 对象、不执行；② 要运行必须先进入事件循环（`asyncio.run`）并把 coroutine 变成 task；③ 调度协程有三种方式——直接 `await coroutine`（**不会变 task、内联串行**）、`asyncio.create_task` 显式包装成 task 再 `await`（并发）、`asyncio.gather` 批量包装成 task 并收集返回值**。

## 六、高频追问预案

### 6.1 概念本质方向

| 追问 | 回答要点 |
|---|---|
| asyncio 能提升性能吗？ | **不能提升运算（CPU）速度**。它只对 **IO 密集/需要等待** 的任务有效，把阻塞等待时间让给别的 task；CPU 密集任务用协程几乎无收益甚至会更慢。 |
| 协程和线程的本质区别？ | 线程是**抢占式**（系统随时切走，需加锁防数据竞争）；协程是**协作式**（只有 `await`/函数结束才让出，让出点之间天然原子，**单线程内无竞争冒险**）。线程是 CPU 调度单位、有系统级上下文切换；协程是用户态自己调度、切换不进内核。 |
| 为什么不提升速度还叫「并发」？ | 并发指**逻辑上同时存在多个进行中的任务**、交替执行（concurrent）；**不叫并行（parallel）**。asyncio 是**单线程并发**，同时刻只有一段代码在跑。 |
| coroutine 和 task 有什么区别？ | coroutine 只是「一个可执行过程的描述/对象」，**不 enter event loop 就不执行**；task 是 coroutine 被**包装并注册进 event loop 后的调度单元**，有状态。**必须有 task 才会被调度执行。** |
| task 和 future 什么关系？ | future 是一个「未来才有结果」的占位容器；task 是一种特殊的 future（承载一个 coroutine）。`gather()` 返回 future，`create_task()` 返回 task。都可被 await。 |
| `await` 到底做了什么？ | `await` 一个 coroutine：**不会包装成 task**，而是把该协程代码**内联到当前 task 同步执行**，到它内部 Future 的挂起点才让出控制权，等它返回再提取返回值。`await` 一个 task：等待的是**独立的调度单元**（该 task 完成才继续并取回结果）。 |

### 6.2 调度与并发方向

| 追问 | 回答要点 |
|---|---|
| 为什么 `await coroutine` 是串行的？ | 因为 `await coro` **不会新建 task / 调度单元**，而是把 coro 的代码**内联进当前 task 同步执行到挂起点**，等它返回才执行下一条——所以第二个 `await` 只能等第一个跑完。要用并发，必须先把协程注册成**独立 task**（`create_task`/`gather`），让它们成为 event loop 可分别调度的新单元。**常考点：直接 `await` 协程 ≠ 并发。** |
| `create_task` 和 `gather` 怎么选？ | 需要**逐个精细控制/取消/拿单值**用 `create_task`；要**一批并发、批量收集返回值、想少写模板**用 `gather`（gather 会自动把 coroutine 变 task 并收集成 list）。 |
| 三个 task 并发，总耗时是最大者还是总和？ | 若互不依赖、都在等待（如各自 sleep/网络请求），总耗时 ≈ **最大的那个**（本例 hello 等 1s + world 等 2s = 2s，不是 3s）。 |
| event loop 是怎么决定先跑哪个的？ | 由事件循环内部的就绪队列/调度策略决定，**task 不能指定**，只能声明「我在等 XX」。能跑（就绪）的 task 里，event loop 挑一个执行，遇到 await 又让出。 |
| 一个 task 里有长时间的 CPU 计算会怎样？ | 因为**协作式**，这段计算**不会中断**，直到遇到 `await` 或返回，才会让出——期间其他 task 全被卡住，整个程序可能变慢/卡死。 |
| 死循环会让程序卡死吗？ | 会。event loop 无法强抢控制权，一个 task 陷入**永不让出的死循环**，整个事件循环就停摆。 |

### 6.3 深入 / 边界方向

| 追问 | 回答要点 |
|---|---|
| asyncio 能利用多核吗？ | **单线程的 asyncio 只用单核**。要并行多核需配合多进程/多线程（如 `asyncio` + 线程池，或 `asyncio.run_in_executor`）。 |
| 为什么说「没有等待就没帮助」？ | asyncio 的核心是**复用等待间隙**。若代码没有 IO/等待，`await` 没有可让出的时间片，纯 CPU 计算场景谈何并发，只有开销。 |
| goroutine/其他语言的协程和 Python 协程差异？ | Go 是**抢占式（1.14+ 异步抢占）**可防止单个协程独占；Python 的 `asyncio` 是**纯粹协作式**（无抢占）。Go 协程由运行时多路复用 GMP 调度到多核；Python asyncio 单线程单核。 |
| asyncio 里的阻塞式库（如 `time.sleep`、`requests`）会怎样？ | **会阻塞整个事件循环**，让所有 task 卡住。必须用非阻塞版本：`asyncio.sleep`、`aiohttp`，或用 `run_in_executor` 丢到线程池。 |
| 除了 `asyncio.run` 还有别的方式吗？ | 低层可用 `loop = asyncio.new_event_loop()` + `loop.run_until_complete(coro)` 等，但 `asyncio.run` 是最推荐的**单一入口**（自动创建和关闭 loop）。 |

### 6.4 陷阱题 / 易错方向

| 追问 | 回答要点 |
|---|---|
| `asyncio.run(main())` 里 `main()` 返回的是什么？ | 是 coroutine object。`asyncio.run` 接收的是它，并把它变成第一个 task。 |
| 我调用 `main()` 了，为什么没打印？还报警告？ | 因为 `main()` 只**返回 coroutine object 而不执行**。要执行必须把它交给 event loop（`asyncio.run(main())`），否则会报 RuntimeWarning「coroutine was never awaited」。（对，函数没被 await 时就会报这个。） |
| `result = task` 能拿到返回值吗？ | **不能**，那只是 task 对象。必须 `result = await task` 才拿得到真正的返回值（Task.result() / await 底层调用它）。 |
| `gather` 的返回 list 顺序是什么？ | 与**传入参数的顺序一致**，不是完成顺序。 |
| `await` 一个协程会把它变成 task 吗？ | **不会**。`await coroutine` 只是把协程**内联到当前 task** 执行到挂起点（inner Future），**不产生新的调度单元**。要变成可并发调度的独立单元，必须用 `create_task` / `gather`（内部 `ensure_future`）/ 顶层 `asyncio.run`。**event loop 只调度 task。** |
| 既然 GPU/IO 都等，怎么判断一个任务是不是适合 asyncio？ | 看它**是否「CPU 密集」还是「IO 密集」**——IO 密集/等待多（网络、磁盘、爬虫）适合；CPU 密集（大量计算）不适合 asyncio。 |

## 七、加分表达：一句话点醒面试官

> **「asyncio 的本质是『用一个单线程的协作调度器，把 IO 等待的时间卖给别的任务』。它卖的是『等待时间』，不是『计算能力』。也因为所有让出都发生在 `await` 这个显式位置，单线程内天然无数据竞争。」**
> 补一句工程落地点：**「真正做网络请求一定要用非阻塞库（aiohttp、httpx AsyncClient），用 `requests` 这种同步库会把整个 event loop 卡死。」**

## 八、相关页面

- [[编程/操作系统/进程管理/00 面试整理-进程 线程 协程]] — 进程/线程/协程三者对比主线（"隔离性 vs 切换成本"），协程在用户态调度、协作式
- [[编程/java并发编程/多线程/线程的创建方式有哪些？]] — 线程与任务的关系（task vs 载体），可与协程对比参考
- [[编程/java并发编程/多线程/使用 CompletableFuture]] — 另一套「异步编排」思路（回调式 vs Python 的 await 协程式）
- [[编程/操作系统/进程管理/进程，线程，协程的区别是什么？]] — 三者定义原始笔记