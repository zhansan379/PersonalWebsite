---
title: 介绍一下 AQS
tags:
  - Java
  - 并发编程
  - AQS
  - AbstractQueuedSynchronizer
  - 队列
  - 锁
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# 介绍一下 AQS

> 答题主线：AQS（AbstractQueuedSynchronizer）是一个**构建锁（例子：`ReentrantLock`、`ReentrantReadWriteLock`）与同步器（负责线程排队、阻塞、唤醒、维护状态的底层工具。）的模板框架**，核心只有三样东西——**① volatile 的 state 同步状态；② 一个 CLH 变体的 FIFO 双向等待队列；③ 留给子类重写的获取/释放模板方法**。共享资源空闲就把当前线程设为持有者，被占用则把线程封进队列阻塞，释放时由队列唤醒合适线程。你常见的 `ReentrantLock`、`Semaphore`、`CountDownLatch` 内部都是基于它实现的。

**FIFO = First‑In‑First‑Out，先进先出**

## 一、四步回答骨架

1. **定调**：AQS 全称 `AbstractQueuedSynchronizer`，一个抽象类，是构建锁、同步器、协作工具类的**模板框架**（可理解为"锁的半成品"）。它的存在意义：把 `state` 管理 + 等待队列 + 阻塞唤醒这些**通用活**都做好，子类只需实现几个获取/释放方法。
2. **三大件之一 · state**：一个 `volatile int` 表示同步状态。含义**由子类决定**：`ReentrantLock` 里是可重入计数（0=无线程持有）、`Semaphore` 是剩余许可、`CountDownLatch` 是剩余待倒数。修改靠 `getState`/`setState`/`compareAndSetState`（CAS 原子改，底层 Unsafe）。
3. **三大件之二 · FIFO 队列**：一个 CLH 变体的**虚拟双向队列**。拿不到锁的线程被包装成节点排队，AQS 就是"排队管理器"；锁释放时唤醒下一个合适线程。基本思想：**共享资源空闲→当前线程设为持有者；被占→进入队列阻塞等待唤醒**。
4. **三大件之三 · 模板方法**：`tryAcquire`/`tryRelease`/`tryAcquireShared` 等由子类重写，含义随协作类而定（Semaphore 的获取是 `acquire`、CountDownLatch 的"获取"是 `await` 等）。**AQS 的任务**：状态原子管理、线程阻塞/解除阻塞、队列管理。

## 二、核心内容：AQS 的三大部件与工作机制

### 1. 什么是 AQS

`AbstractQueuedSynchronizer` 是 Java 并发包 `java.util.concurrent.locks` 里的一个**抽象类**，用于构建锁和同步器的工具框架。主流并发工具内部都套着它：

- `ReentrantLock`（可重入锁）
- `Semaphore`（信号量）
- `CountDownLatch`（倒计数）
- `ReadWriteLock`（读写锁）
- `ThreadPoolExecutor`（线程池的允许线程数）

这些类内部都有 `Sync` 内部类，而 `Sync` 就是 AQS 的子类（继承自 AQS）。**AQS 帮子类干三件事**：① 同步状态（如计数器）的原子性管理；② 线程的阻塞与解除阻塞；③ 队列的管理。

### 2. 核心思想

> 如果被请求的**共享资源空闲**，就将当前请求资源的线程设置为**有效的工作线程**，把共享资源设为锁定状态；如果共享资源**被占用**，就通过一种阻塞等待唤醒机制保证锁分配——这个机制用 **CLH 队列的变体**实现，把暂时拿不到锁的线程加入队列。

- **CLH**：Craig、Landin and Hagersten 队列，原始是**单向链表**；AQS 用的是它的**变体——虚拟双向队列（FIFO）**。每个请求资源的线程被封装成一个节点（Node）实现排队。

### 3. 三大部件详解

#### ① 状态 state（volatile int）
- 含义**随实现类而不同**：
  - `Semaphore`：剩余许可证数量；
  - `CountDownLatch`：还需要倒数的数量；
  - `ReentrantLock`：锁的占有情况（含**可重入计数**），`state == 0` 表示不被任何线程占有。
- `state` 用 `volatile` 修饰、可能被并发修改，所以修改它的方法都必须保证线程安全——通过 `getState`、`setState`、`compareAndSetState`（CAS）读写更新。这些方法底层都依赖 `Unsafe` 类。

#### ② FIFO 队列（双向链表）
- 存放"等待的线程"。AQS 就是"排队管理器"：多线程争用同一把锁时，靠它把没抢到锁的线程串起来；锁释放时，锁管理器挑选一个合适线程占有刚释放的锁。
- 队列是**双向链表**形式（CLH 变体的虚拟队列），先进先出（FIFO）。

#### ③ 获取/释放等方法（由子类实现）
- 利用 AQS 的协作工具类里**最核心的方法**，含义各不相同：
  - **获取方法**依赖 state，经常阻塞（如获取不到锁时）。`Semaphore` 的获取是 `acquire`（获取一个许可）；`CountDownLatch` 的"获取"是 `await`（等待倒数结束）。
  - **释放方法**：`Semaphore` 是 `release`（释放许可）；`CountDownLatch` 是 `countDown`（倒数减一）。
- **每个实现类都要重写** `tryAcquire`、`tryRelease` 等方法，把"抢占成功/失败"的判定规则交给子类，AQS 负责排队、阻塞、唤醒这些通用流程。

## 三、如何应用 / 面试怎么讲

**加分表达：**
- 一上来就给**"三个部件"**（state / FIFO 队列 / 模板方法），比背 AQS 全称高级——体现你抓得住骨架而非记名词。
- 强调 **state 的含义是由子类赋予的**（锁计数 vs 信号量许可 vs 倒数计数）——这是"懂"而非"背"的分水岭。
- 点出 **模板方法模式** 的本质：AQS 把排队/阻塞/唤醒这些"通用流程"固定下来，把"抢锁成功与否"这种"变化点"留给子类 `tryXxx`——符合设计动机。
- 顺带解释"**共享资源空闲→设为持有者；被占→入队阻塞**"的本源思想，再落到"为什么用队列"（排队等待而非忙等）。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| AQS 是干什么的？ | 构建锁/同步器的模板框架；把 state 管理、队列管理与阻塞唤醒这些通用机制封装好，子类只需重写 tryXxx 获取/释放方法 |
| 为什么叫 "同步器/排队管理器"？ | 它管的是"谁拿到 state、谁进队列等"，协调多个线程对共享资源的并发访问 |
| state 具体是什么？ | volatile int 同步状态；含义由子类定：ReentrantLock 可重入计数、Semaphore 剩余许可、CountDownLatch 剩余倒数；0 常表示"无持有/未开始" |
| state 怎么改才线程安全？ | getState/setState 普通读写 + compareAndSetState(CAS) 原子更新，底层依赖 Unsafe |
| 等待队列是什么结构？ | CLH 变体的**虚拟双向链表（FIFO）**，线程被封装成 Node 排队；原版 CLH 是单向、AQS 用双向便于处理中断/超时/取消 |
| 如何支持可重入？ | 同线程重入时 state 累加；释放按计数递减，计数到 0 才真正释放锁（ReentrantLock） |
| 公平锁与非公平锁靠什么区分？ | 主要在 tryAcquire 门槛：**非公平**一上来就 CAS 抢（可能插队，性能高）；**公平**先检查队列前面是否还有等待节点，有则排队（不插队）。AQS 只提供骨架，公平性由子类自定义 |
| 为什么通常要配合 while 循环自旋检查？ | 入队前可能有多个线程同时 CAS 竞争，需循环重试直至成功；acquire 常用循环 CAS 保证不丢失唤醒 |
| 没有拿到锁的线程怎么被阻塞、怎么被唤醒？ | 入队后 park（LockSupport.park）阻塞；前驱释放时 unpark（LockSupport.unpark）唤醒后继，避免忙等消耗 CPU |
| 可以自己用 AQS 做一个同步器吗？ | 可以——继承 AQS，实现 tryAcquire/tryRelease（独占）或 tryAcquireShared/tryReleaseShared（共享），用 getState/setState/compareAndSetState 维护状态；AQS 自动处理入队/阻塞/唤醒 |
| 与 synchronized 的关系？ | synchronized 是 JVM 关键字、自动锁；AQS 是 Java 层提供的基础框架，ReentrantLock/Semaphore 等上层同步器基于它自研，能力更丰富（可中断/可超时/可多个条件队列） |

## 四、相关页面

- [[wiki/编程/java并发编程/多线程/使用 Future]] — 基于 AQS 的协作类在"同步等待结果"上的应用
- [[wiki/编程/java集合/Map/ConcurrentHashMap怎么实现的？]] — 分段锁 Segment 亦继承自 ReentrantLock（其底层经 AQS）
- [[static 与 final]] — static 相关前置概念（静态方法与实例成员）整理