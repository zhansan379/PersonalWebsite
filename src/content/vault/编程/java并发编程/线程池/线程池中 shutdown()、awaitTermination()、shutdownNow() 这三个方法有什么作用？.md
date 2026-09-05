---
title: 线程池中 shutdown()、awaitTermination()、shutdownNow() 这三个方法有什么作用？
tags:
  - Java
  - 并发编程
  - ThreadPoolExecutor
  - 线程池
  - shutdown
  - awaitTermination
  - shutdownNow
  - 中断
  - 面试
created: 2026-08-22
updated: 2026-08-24
---


> 一句话概述：关闭线程池的**三角色**是 `shutdown()`（温柔收尾：让已提交任务跑完）、`shutdownNow()`（强硬断电：中断所有、清空并返回未执行任务）、`awaitTermination()`（**轮询等待**：等指定时间后探测池是否已关闭，返回 true/false）。常规关闭是 **`shutdown()` 启动优雅收尾，再用 `awaitTermination()` 定时探测是否关完，必要时 `shutdownNow()` 兜底**。三个都是基于 `ExecutorService` 接口的方法。

## 一、这是什么

线程池运行中不能"咔嚓"一刀切，关闭分两种力度、加一种探测：

| 维度 | `shutdown()` | `awaitTermination(timeout, unit)` | `shutdownNow()` |
| :--- | :--- | :--- | :--- |
| 干什么 | 温柔收尾：状态置 `SHUTDOWN`，等已提交任务跑完 | **轮询探测**：等指定时间后查池是否已关闭，返回布尔 | 强行断电：状态置 `STOP` |
| 状态 | `SHUTDOWN` | 无（不改变状态） | `STOP` |
| 正在执行的线程 | 不中断，让它们自然跑完 | — | **试图 interrupt() 中断** |
| 空闲 worker | 只中断空闲的（`interruptIdleWorkers()`） | — | 中断所有（`interruptWorkers()`） |
| 队列里未执行的任务 | **仍按顺序执行到全部完成** | — | 清空，并**作为返回值拿回**（`drainQueue()`） |
| 之后提交新任务 | 抛 `RejectedExecutionException` | — | 同样抛 `RejectedExecutionException` |

一句话：**shutdown 是"开始温柔收尾"，awaitTermination 是"回头看看收好了没"，shutdownNow 是"没收好就强行断电，把没做完的任务还给你"。**

> `awaitTermination` 与前两者不同：它**不改变线程池状态**，只是一个"带超时的轮询探测"——调用后会**阻塞等待**至多 timeout，时间到了检查线程池是否已关闭并返回布尔；超时仍没关闭就返回 `false`。它必须**配合 shutdown / shutdownNow 使用**（单独调它没有意义，因为池根本不会被关闭）。配套的状态查询还有 `isTerminated()`。

## 二、核心内容：源码对比

### shutdown() 源码

```java
public void shutdown() {
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        checkShutdownAccess();
        advanceRunState(SHUTDOWN);      // 状态置 SHUTDOWN
        interruptIdleWorkers();         // 只中断【空闲】的 worker
        onShutdown();
    } finally {
        mainLock.unlock();
    }
    tryTerminate();
}
```

### shutdownNow() 源码

```java
public List<Runnable> shutdownNow() {
    List<Runnable> tasks;
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        checkShutdownAccess();
        advanceRunState(STOP);          // 状态置 STOP
        interruptWorkers();             // 中断【所有】的 worker
        tasks = drainQueue();           // 清空未执行的任务队列
    } finally {
        mainLock.unlock();
    }
    tryTerminate();
    return tasks;                       // 把未执行任务作为返回值返回
}
```

### 关键源码注释对应

- `shutdown` 调 `interruptIdleWorkers()`：只对**处于空闲等待状态的 worker** 调用 `interrupt()`——正在干活的线程不打断，等它自然结束。
- `shutdownNow` 调 `interruptWorkers()`：对**所有** worker（含正在执行的）调 `interrupt()`。
- `shutdownNow` 调 `drainQueue()`：把池队列里等待的、还没执行的任务全部取出返回，业务方可自行处理这些未跑任务。

### awaitTermination 的经典用法：轮询等待关闭完成

`awaitTermination(timeout, unit)` 是 `ExecutorService` 提供的方法，**接受超时时间**，用于阻塞等待线程池关闭。关池最常见的组合姿势，是 `shutdown()` 后循环 `awaitTermination()` 探测是否关完：

```java
// 1. 先温柔收尾：拒收新任务、等已提交任务自然跑完
service.shutdown();

// 2. 循环探测：每 1 秒看一次是否已关闭；没关完就继续等/提示
while (!service.awaitTermination(1, TimeUnit.SECONDS)) {
    System.out.println("线程池没有关闭");
}
System.out.println("线程池已经关闭");
```

`awaitTermination` 的行为：到点了没关完返回 `false`（上方 while 继续），关完了返回 `true`（退出循环）。注意它**本身不会触发关闭**——必须先用 `shutdown`/`shutdownNow` 启动关闭，它只负责"等 + 探测"。

### 生产经典三段式：shutdown → awaitTermination → shutdownNow 兜底

优雅关闭的**完整套路**（源码对应 `ThreadPoolHelper.shutdown()` 示例）：

1. **`shutdown()`**：先温柔收尾，等已提交任务自然执行完。
2. **`awaitTermination(N秒)`**：给任务一个"宽限期"，定时探测是否已关闭；**宽限期内关完**就成功收尾。
3. **`shutdownNow()` 兜底**：宽限期到了**仍没关完**（说明有任务拖太久或拒不响应），改用 `shutdownNow()` 强中断、清空并返回未执行任务，业务方再自行处理这些残留任务。

```java
comitTaskPool.shutdown();
if (!comitTaskPool.awaitTermination(3, TimeUnit.SECONDS)) {  // 3 秒宽限后仍没关完
    if (comitTaskPool.shutdownNow().size() > 0) {            // 强中断，还有没跑完的任务
        logger.debug("线程池没有关闭成功");
    } else {
        logger.debug("shutdownNow 执行完毕，成功关闭");
    }
}
```

> 这段"**先软后硬、grace period 兜底**"是生产关池的标准答案——既能给正常任务留时间收尾，又能在等待过久时强制收场、不丢任务。

## 四、核心机制：为什么 shutdownNow 不保证立即退出？

`shutdownNow` 试图终止线程的**手段是 `Thread.interrupt()`**，但这种打断的作用是有限的：

> 如果线程里**没有 `sleep`、`wait`、`Condition`、定时锁**等会响应中断的阻塞点，`interrupt()` 是无法中断当前线程的（只会打个中断标记，线程继续跑）。

所以 `shutdownNow()` **并不代表线程池一定立即退出**——它可能必须等待所有正在执行的任务都执行完（甚至这些任务自己不检查中断标志）才能真正退出。真正"能被打断"的线程，得在任务里主动处理中断（如对 `InterruptedException` 做出响应，或轮询 `isInterrupted()`）。

### 三角色分别怎么对待 interrupt()？

| 方法                   | 是否调 interrupt                   | 对谁调                   | 目的 / 效果                                                                                                                                                    |
| :------------------- | :------------------------------ | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shutdown()`         | 是，但调的是 `interruptIdleWorkers()` | 仅**空闲** worker        | 打断它们在 `getTask()→workQueue.take()/poll()` 上的**阻塞等待**，让它们醒来、重新检查 `SHUTDOWN` 状态后自然退出；**正在执行的任务不打断**，让其跑完                                                     |
| `awaitTermination()` | **否**，不调任何 interrupt            | —                     | 只做"等待 + 探测"。它唯一的中断相关行为是**被"调用方"线程的 interrupt 影响**——调用它的主线程如在 `awaitTermination` 里被 interrupt，会抛 `InterruptedException`（它声明了 `throws InterruptedException`） |
| `shutdownNow()`      | 是，调的是 `interruptWorkers()`      | **所有** worker（含正在执行的） | 对每个 worker 线程设**中断标志**，但只是"协作式喊话打标"——任务是否真的停，取决于它自己是否响应中断                                                                                                  |

**几个值得注意的点：**
- `shutdown` 的 interrupt 不是"命令停工"，而是一个**唤醒 trick**：把空闲线程从队列的阻塞取任务处打断出来，让它多跑一圈循环、发现池已 `SHUTDOWN` 且没任务可分，就自己退出并减 worker 数。所以它不会误伤正在跑的任务。
- `shutdownNow` 的 interrupt 是"对全体的尝试性打断"：能不能停下全看任务——在 `sleep`/`wait`/`Condition`/`lockInterruptibly` 等可中断阻塞点的会立刻抛 `InterruptedException`；纯计算、不检查`isInterrupted()` 的会继续跑到底。
- **中断是"合作式的、只抛接力棒"**：三个方法最终都归结到 `Thread.interrupt()` 只是**把中断标志置位**，没有任何强制终止能力；真正的执行权始终在线程/任务手里。

只有 awaitTermination() 在抛出异常时会==清除中断状态==，shutdown() 和 shutdownNow() 并不会清除当前线程的中断状态。
## 五、如何应用 / 面试怎么讲

**加分表达：**
- 先给**关闭的三角色**：shutdown="开始温柔收尾（任务跑完）"，awaitTermination="轮询探测收好了没"，shutdownNow="没收好就强行断电、把没做完的任务还给你"——把三者串成故事比孤立背最直观。
- 强调 **awaitTermination 不改变状态、必须配合 shutdown 用**（它是"带超时的探测"，单独调没意义）——这是它和另两者最易混淆的点。
- 会讲**生产三段式**（shutdown → awaitTermination(宽限期) → shutdownNow 兜底），天然覆盖"优雅 + 兜底"，是这道题的高分表达。
- 主动点出 shutdown/shutdownNow 都"不能再提交新任务"的共同点，以及 shutdownNow 的不确定性（未必立即退，靠 interrupt 协作式打断，呼应线程停止话题）。
- 要领：shutdownNow 会**返回未执行任务**让业务方处理（落到 Redis 持久化、记日志等），这是它和 shutdown 最实用差异。
 
**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| shutdown() 和 shutdownNow() 最本质区别？ | shutdown 置 SHUTDOWN、让队列已有任务执行完再退、只中断空闲 worker；shutdownNow 置 STOP、中断所有 worker、清空并返回未执行任务 |
| 两者之后还能提交任务吗？ | 都不能，再提交抛 `RejectedExecutionException` |
| awaitTermination 是什么？ | 带超时的**轮询探测**方法：阻塞等待至多 timeout，时间到检查池是否已关闭并返回布尔；它**不改变线程池状态**，必须配合 shutdown/shutdownNow 用，单独调没意义 |
| 关闭线程池的标准组合姿势？ | `shutdown()` → `while(!awaitTermination(...))` 轮询；生产进阶：shutdown → awaitTermination(宽限 N 秒) → 仍没关完就 shutdownNow 兜底并处理返回任务 |
| 为什么 awaitTermination 要在循环里？ | 单次 awaitTermination 只等一个超时周期就返回；循环能在没关完时持续探测直到成功关闭 |
| shutdownNow 一定立即退出吗？ | 不一定；它靠 Thread.interrupt() 打断，若线程无 sleep/wait/Condition 等可中断阻塞点，interrupt 只是打标，得等任务自己跑完/响应中断 |
| shutdownNow 返回什么？ | 返回 `List<Runnable>`——池队列中**尚未执行**的任务，业务可自行处理 |
| 中断对正在运行的任务有效吗？ | 仅当任务处于可中断的阻塞（sleep/wait/lockInterruptibly/Condition 等）或自己检查中断标志才会生效；否则打断无效 |
| 为什么 shutdown 用 interruptIdleWorkers 而 shutdownNow 用 interruptWorkers？ | shutdown 想优雅收尾，只需"喊停"空闲等待的线程（它们在等新任务，没必要继续等）；shutdownNow 急着断电，连执行中的也尝试打断 |
| 如何处理 shutdownNow 返回的任务？ | 存到持久化队列（如 Redis/MQ）待后续重试，或打日志跟踪，避免任务丢失 |
| 和线程正常结束（任务 run 完）区别？ | 线程池关闭是"管理线程生命周期"的角度；任务 run 完是单个任务结束。shutdown 系列是让线程池整体进入拒绝新任务并逐步结束的状态 |

## 六、相关页面

- [[wiki/编程/java并发编程/线程池/有线程池参数设置的经验吗？]] — 线程池五件套参数与关闭纪律的整体框架
- [[wiki/编程/java并发编程/多线程/如何停止一个线程的运行？]] — shutdownNow 依赖的中断（interrupt）机制本质
- [[wiki/编程/java并发编程/多线程/线程的创建方式有哪些？]] — 线程池的提交与生命周期入口（submit/shutdown）
- [[wiki/编程/java并发编程/多线程/使用 CompletableFuture]] — 线程池生命周期管理的应用场景