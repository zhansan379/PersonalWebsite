---
title: Java 线程的状态有哪些？
tags:
  - Java
  - 并发编程
  - 多线程
  - 线程状态
  - Thread.State
  - BLOCKED
  - WAITING
  - 面试
created: 2026-08-24
updated: 2026-08-24
---

# Java 线程的状态有哪些？

> 一句话概述：`Thread.State` 枚举共 **6 种**——`NEW`、`RUNNABLE`、`BLOCKED`、`WAITING`、`TIMED_WAITING`、`TERMINATED`。注意**没有 RUNNING**（`RUNNABLE` 涵盖 OS 层的就绪 + 运行）；面试真正考的是 **BLOCKED 与 WAITING 的区别**——前者是**锁竞争失败被动进入、锁释放后自动重试**，后者是**主动调用方法进入、必须被显式唤醒**。

## 一、这是什么

Java 线程的生命周期状态由 `java.lang.Thread.State` 枚举定义，一共 6 个值。它描述的是 **JVM 层面**的线程状态，与操作系统的线程状态并非一一对应。

![[Pasted image 20260824213545.png]]

| 状态 | 含义 | 怎么进入 |
| :--- | :--- | :--- |
| `NEW` | 已 `new` 出对象，还没 `start()` | `new Thread()` |
| `RUNNABLE` | 可运行（**包含 OS 层的 ready 就绪与 running 运行**） | `start()` 之后 |
| `BLOCKED` | 等待进入 `synchronized` 的 monitor 锁 | 抢锁失败，**被动** |
| `WAITING` | 无限期等待另一线程的特定动作 | `wait()` / `join()` / `park()`，**主动** |
| `TIMED_WAITING` | 带超时的等待 | `sleep(n)` / `wait(n)` / `join(n)` / `parkNanos` |
| `TERMINATED` | `run()` 正常返回或抛异常结束 | 执行完毕 |

> ℹ️ **易错点**：`Thread.State` 中**没有 `RUNNING`**。OS 层区分"就绪（等 CPU 时间片）"和"运行（占着 CPU）"，但 JVM 把两者合并成一个 `RUNNABLE`——因为对 Java 代码而言，是否正在被 CPU 调度不可控也不重要。

## 二、核心内容：BLOCKED 和 WAITING 有啥区别？

这是本页最高频的考点。两者都"停下不跑"，但成因与恢复方式完全不同。

### 1. 触发条件不同

- **BLOCKED**：线程试图获取某个对象的 **monitor 锁**（进入 `synchronized` 块或方法），但锁已被另一线程持有 → 线程被阻塞，直到锁可用。
- **WAITING**：线程**主动**等待另一个线程执行某些动作，典型来源：
  - `Object.wait()` —— 等 `notify`
  - `Thread.join()` —— 等目标线程结束
  - `LockSupport.park()` —— 等 `unpark`

> 两种状态下线程都**不消耗 CPU**；且 `WAITING` 的线程**不参与锁的竞争**（`wait()` 会先释放锁）。

### 2. 唤醒机制不同

- **BLOCKED 是自动恢复的**：锁一旦被释放，线程就有机会重新尝试获取。若此刻锁未被别人抢走，它就从 `BLOCKED` 变回 `RUNNABLE`——**不需要任何人通知它**。
- **WAITING 必须被显式唤醒**：例如调用了 `Object.wait()` 的线程，必须等另一个线程在**同一对象**上调用 `Object.notify()` / `notifyAll()` 才能醒；`park()` 要等 `unpark()`；`join()` 要等目标线程终止。

### 3. 两句话记住区别

| 维度 | BLOCKED | WAITING |
| :--- | :--- | :--- |
| 怎么来的 | 锁竞争失败后**被动**触发 | 调方法**主动**触发 |
| 怎么走的 | 锁释放后**自动**重试 | 必须被**特定方法主动唤醒** |

> **一句话**：**BLOCKED 是"被门挡住"，门开了自己会进；WAITING 是"自己坐下等叫号"，不叫不动。**

## 三、如何应用 / 面试怎么讲

**回答骨架：**
1. **先给全集**：6 种状态列出来（NEW / RUNNABLE / BLOCKED / WAITING / TIMED_WAITING / TERMINATED）。
2. **主动纠一个坑**：强调**没有 RUNNING**，`RUNNABLE` 已涵盖 OS 的就绪与运行两个子状态。
3. **落到重点**：面试真正想听的是 BLOCKED vs WAITING——按"**触发（被动/主动）+ 唤醒（自动/显式）**"两个维度答。
4. **补 TIMED_WAITING**：它是 WAITING 的"带超时版"，好处是**到点自己醒，不依赖别人叫**，工程上比无限期等待更安全。

**加分表达：**
- 点出 `wait()` 与 `sleep()` 的关键差别：**`wait()` 释放锁并进入 WAITING，`sleep()` 不释放锁、进入 TIMED_WAITING**——这是"懂"而非"背"的分水岭。
- 提一句 **`BLOCKED` 只针对 `synchronized`**：`ReentrantLock` 抢锁失败走的是 `LockSupport.park()`，状态是 **WAITING / TIMED_WAITING 而非 BLOCKED**。这条几乎能直接拉开分差。
- 收尾给工程价值：线上排查时 `jstack` 打出的线程栈状态就是这套枚举——一堆 `BLOCKED` 指向锁竞争热点，一堆 `WAITING on Object.wait()` 往往是线程池空闲或等结果。

### 追问预案

| 追问 | 应答要点 |
| :--- | :--- |
| Java 线程有几种状态？ | 6 种，`Thread.State` 枚举：NEW / RUNNABLE / BLOCKED / WAITING / TIMED_WAITING / TERMINATED |
| 为什么没有 RUNNING 状态？ | JVM 不关心线程是否正被 CPU 调度，把 OS 的 ready + running 合并为 `RUNNABLE` |
| BLOCKED 和 WAITING 最大区别？ | ①BLOCKED 锁竞争失败**被动**进入，WAITING 调方法**主动**进入；②BLOCKED 锁释放后**自动**重试，WAITING 必须**显式唤醒** |
| 哪些方法会进 WAITING？ | `Object.wait()`（无参）、`Thread.join()`（无参）、`LockSupport.park()` |
| 哪些方法会进 TIMED_WAITING？ | `Thread.sleep(n)`、`wait(n)`、`join(n)`、`LockSupport.parkNanos/parkUntil` |
| `wait()` 和 `sleep()` 有什么区别？ | `wait()` 是 Object 方法、**必须持锁调用且会释放锁**、进 WAITING；`sleep()` 是 Thread 静态方法、**不释放锁**、进 TIMED_WAITING |
| ReentrantLock 抢锁失败是 BLOCKED 吗？ | **不是**。`BLOCKED` 专指等 `synchronized` 的 monitor；ReentrantLock 基于 AQS 用 `LockSupport.park()`，表现为 WAITING / TIMED_WAITING |
| WAITING 的线程会占 CPU 或抢锁吗？ | 都不会。不消耗 CPU；`wait()` 进入前已释放锁，故不参与锁竞争 |
| TERMINATED 的线程能再 start 吗？ | 不能，再 `start()` 抛 `IllegalThreadStateException`（线程对象不可复用，这也是要线程池的原因之一） |
| 怎么在线上看线程状态？ | `jstack` / `jconsole` / Arthas；大量 BLOCKED → 锁竞争热点，大量 `WAITING on Object.wait()` → 池中空闲或等结果 |

## 四、相关页面

- [[wiki/编程/java并发编程/多线程/线程间通信有哪些方式？]] — wait/notify、Condition 正是 WAITING 状态的来源与唤醒手段
- [[wiki/编程/java并发编程/多线程/如何停止一个线程的运行？]] — 中断如何作用于阻塞态线程（抛 `InterruptedException`）
- [[wiki/编程/java并发编程/多线程/线程的创建方式有哪些？]] — NEW → RUNNABLE 的起点，以及为何 TERMINATED 不可复用
- [[wiki/编程/java并发编程/并发安全/Java中有哪些常用的锁，在什么场景下使用？]] — synchronized（BLOCKED）与 ReentrantLock（WAITING）的差异根源
- [[wiki/编程/java并发编程/并发安全/介绍一下AQS]] — `LockSupport.park/unpark` 与 AQS 队列的阻塞唤醒机制
- [[wiki/编程/java并发编程/多线程/java里面的线程和操作系统的线程一样吗？]] — JVM 状态与 OS 状态为何不是一一对应
