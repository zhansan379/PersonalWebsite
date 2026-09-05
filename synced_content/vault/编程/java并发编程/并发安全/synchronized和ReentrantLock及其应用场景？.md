---
title: "synchronized 和 ReentrantLock 及其应用场景？"
tags:
  - 并发编程
  - 并发安全
  - synchronized
  - ReentrantLock
  - 锁
  - AQS
  - monitor
  - 面试
created: 2026-08-25
updated: 2026-08-25
---

# synchronized 和 ReentrantLock 及其应用场景？

> 一句话定调：synchronized 是**内置的监视器锁（JVM 层面，被编译成 monitorenter/monitorexit）**，简单、自动释放，是非公平锁；ReentrantLock 是**基于 AQS 的显式可重入锁（JDK 层面）**，需手动 unlock，额外提供了**可中断 / 超时获取 / 公平锁 / 多条件变量**四个高级能力。**选型口诀：简单同步用 synchronized，需要高级功能或精细控制时用 ReentrantLock**。

> **这道题对应的「答题主线」**，面试官问「synchronized 和 ReentrantLock 的区别及应用场景？」，可以按这条主线串起来：
> 先给一句话定调（内置监视器锁 vs 基于 AQS 的显式可重入锁）→ 五个维度速查区别（用法/加解锁/锁类型/响应中断/底层实现）→ synchronized 原理（monitorenter/monitorexit + 计数器 + waitSet/entryList 双队列 + 内存语义）→ ReentrantLock 原理（AQS + state 可重入计数 + 公平/非公平 Sync 子类）→ 四能力对比（synchronized 没有：可中断 / 超时 / 公平 / 多条件）→ 按场景选型收尾（简单用 synchronized，高级功能用 ReentrantLock）。

## 一、五个维度的思路区别（速查表）

| 维度 | synchronized | ReentrantLock |
| :--- | :--- | :--- |
| **用法** | **关键字**，直接修饰普通方法 / 静态方法 / 代码块 | `java.util.concurrent.locks` 包下的**类**，显式调用 `lock()` / `unlock()`，通常配合 try-finally 保证一定释放 |
| **获取与释放** | **自动**：进入修饰代码块自动加锁，离开自动释放 | **手动**：必须自己 `lock()` / `unlock()` |
| **锁类型** | 属于**非公平锁** | **既可以是公平锁也可以是非公平锁**（默认非公平，`new ReentrantLock(true)` 公平） |
| **响应中断** | **不能**响应中断 | **可以**响应中断（`lockInterruptibly`），有助于处理死锁 |
| **底层实现** | **JVM 层面**，通过监视器（Monitor）实现 | **AQS** 实现（JDK 层面） |

> 两者都是**可重入锁**。差别集中在「是否自动化、锁类型是否可调、能否中断、底层在哪一层」。

## 二、synchronized 工作原理

### 2.1 是什么

synchronized 是 Java 提供的**原子性内置锁**。这种内置的、使用者看不到的锁也被称为**监视器锁（Monitor Lock）**。

- 使用后，编译会在同步代码块前后加上 **`monitorenter` 和 `monitorexit` 字节码指令**，底层依赖**操作系统互斥锁**实现。
- 核心作用：实现**原子性操作** + 解决共享变量的**内存可见性**问题。

### 2.2 加锁/解锁：计数器语义

- 执行 `monitorenter` 时**尝试获取对象锁**：如果对象没被锁定、或当前线程已经持有锁（可重入），**锁计数器 +1**；此时其他竞争锁的线程进入**等待队列**。
- 执行 `monitorexit` 时**计数器 -1**；当计数器值减为 0，锁释放，等待队列中的线程继续竞争。

### 2.3 排它性 + 性能代价

synchronized 是**排它锁**：一个线程获得锁后，其他线程必须等其释放才能获得。

- 由于 Java 线程与操作系统原生线程**一一对应**，线程被阻塞/唤醒时会从**用户态切换到内核态**，这种切换非常消耗性能。（注：JDK6 之后引入偏向锁/轻量级锁/重量级锁升级，多数场景已不直接进入重量级锁；但这一点对理解"锁有代价"依然成立。）

### 2.4 内存语义（可见性）

- **加锁**：清除工作内存中的共享变量，再从主内存读取。
- **释放锁**：将工作内存中的共享变量写回主内存。

### 2.5 深入源码：waitSet 与 entryList 双队列

synchronized 底层实际维护两个队列 `waitSet` 和 `entryList`：

1. 多个线程进入同步代码块时，**首先进入 `entryList`**；
2. 其中一个线程获取到 monitor 锁后，**赋给当前线程**，计数器 +1；
3. 若线程调用 `wait()`，**释放锁**，当前线程置为 null，计数器 -1，进入 `waitSet` 等待被唤醒；`notify()` / `notifyAll()` 之后又回到 `entryList` 竞争锁；
4. 线程执行完毕，同样释放锁：计数器 -1，当前线程置为 null。

## 三、ReentrantLock 工作原理

### 3.1 它是什么

ReentrantLock 是 `java.util.concurrent` 提供的**显式可重入锁**。底层依赖 **AbstractQueuedSynchronizer（AQS）** 这个抽象类——AQS 提供基本同步机制框架，包含**等待队列、状态值**等。

ReentrantLock 在 AQS 基础上，通过内部类 **Sync** 实现具体锁操作；不同 Sync 子类（`FairSync` / `NonfairSync`）实现公平锁与非公平锁的不同逻辑。

### 3.2 四大高级能力（synchronized 不具备）

| 能力 | 说明 | 底层机制 |
| :--- | :--- | :--- |
| **可中断性** | 线程等待锁的过程中可被其他线程中断、提前结束等待 | `LockSupport.park()` / `unpark()` |
| **设置超时时间** | 尝试获取锁可设超时，超时未获锁则放弃 | 内部 `tryAcquireNanos` |
| **公平 / 非公平锁** | 默认非公平；公平锁按线程等待顺序获取。 | `new ReentrantLock(true)` 设公平锁 |
| **多个条件变量** | 每个条件变量可与锁关联，更灵活等待/唤醒 | `Condition` 接口：`await()` / `signal()` |

**公平锁区别**：公平锁按线程申请锁的**顺序**获取；非公平锁允许多个线程同时竞争、不考虑申请顺序。

```java
ReentrantLock fairLock = new ReentrantLock(true);   // 公平锁

ReentrantLock lock = new ReentrantLock();
Condition condition = lock.newCondition();           // 多条件变量
condition.await();
condition.signal();
```

### 3.3 可重入性

ReentrantLock 支持**可重入**：同一线程可多次获得同一把锁，不会死锁。通过 **AQS 的 `state` 字段记录重入次数**——多次获取锁时 `state` 递增，释放时递减，**只有当 `state` 减为 0 时，其他线程才有机会获取锁**。

## 四、应用场景的区别（选型）

### synchronized 适用场景

- **简单同步需求**：对代码块/方法做简单同步控制时是很好的选择——使用简单、无需额外资源管理，锁在方法退出或代码块执行完毕后**自动释放**。
- **代码块同步**：只想同步特定代码段而非整个方法时，用 synchronized 代码块可**精细控制同步范围**、减少锁持有时间、提高并发。
- **内置锁的使用**：synchronized 用对象的内置锁（监视器锁），在需要用"对象本身作为锁对象"、且对象状态与锁保护的代码紧密相关时很合适。

### ReentrantLock 适用场景

- **高级锁功能需求**：需要公平锁、响应中断、定时锁尝试、多个条件变量时，ReentrantLock 是更好的选择。
- **性能优化**：在高度竞争环境中，ReentrantLock 因提供更细的粒度控制（如尝试锁定、定时锁定）可减少线程阻塞概率，性能可能更好。
- **复杂同步结构**：需要多个条件变量协调线程通信时，ReentrantLock + `Condition` 提供更灵活的方案。

### 一句话选型

> **synchronized** 适用简单同步、不需要额外锁功能的场景；**ReentrantLock** 适用需要更高级锁功能、性能优化或复杂同步逻辑的情况。具体取决于应用需求与性能考虑。

## 五、面试速答与追问预案

### 5.1 三十秒速答版

两者都是可重入的排它锁。synchronized 是内置监视器锁（编译成 monitorenter/monitorexit，JVM 自动加解锁，非公平）；ReentrantLock 是基于 AQS 的显式锁（手动 lock/unlock + try-finally），额外提供可中断、超时获取、公平锁、多条件变量四个能力。简单同步用 synchronized，需要高级功能用 ReentrantLock。

### 5.2 追问预案

**Q1：synchronized 和 ReentrantLock 最大的区别是什么？**
**A**：一是**使用方式**（前者自动释放、后者需手动 unlock 且要 finally 保证）；二是 ReentrantLock 多了**四个高级能力**（可中断 / 超时 / 公平 / 多条件变量）；三是 ReentrantLock 基于 AQS 在**高竞争**下有更灵活的控制。锁定的本质都是排它 + 可重入。

**Q2：为什么 ReentrantLock 支持可重入不会死锁？**
**A**：靠 AQS 的 `state` 字段记录重入次数——同一线程每次重入 `state++`，释放递减，只有 `state==0` 才真正让出锁。所以同一个线程多次进同一把锁不会自己锁自己。

**Q3：公平锁和非公平锁各自代价是什么？**
**A**：公平锁按等待顺序获取，避免线程饥饿但**切换开销大、吞吐低**；非公平锁允许"插队"，吞吐更高但可能**导致后到线程饿死**（极端下队首线程迟迟不被调度）。默认是非公平。

**Q4：ReentrantLock 可中断怎么用在业务里？**
**A**：用 `lock.lockInterruptibly()`——等待锁时收到 `interrupt()` 会抛出中断异常提前退出等待，避免长等待无法取消。常配合超时锁 `tryLock(timeout, unit)` 使用。

**Q5：多条件变量相比 wait/notify 有什么好处？**
**A**：synchronized 只有一组 wait/notify，多个等待条件只能靠 notifyAll 全部唤醒再自筛；ReentrantLock 可按业务条件建多个 `Condition`，**精确唤醒对应条件的线程**，避免无谓竞争。例如生产者-消费者里读/写通道分开。

**Q6：高竞争下为什么说 ReentrantLock 性能可能更好？**
**A**：两者重量级部分底层都可能涉及用户态/内核态切换，但 ReentrantLock 提供非阻塞尝试（tryLock）、超时、可中断等待等**更细粒度控制**，能让线程减少盲目阻塞和唤醒，从而在高度竞争时有优化空间。不过具体要看场景，现代 JDK 的 synchronized 经锁升级优化后差距不一定大。

## 六、相关页面

- [[编程/java并发编程/并发安全/介绍一下AQS]] — ReentrantLock 的底层同步器：state + CLH 队列 + 模板方法
- [[编程/java并发编程/并发安全/AQS 面试整合：答法逻辑、ReentrantLock 原理与从零设计]] — ReentrantLock 基于 AQS 的具体走查（加锁/解锁/公平非公平）
- [[编程/java并发编程/并发安全/Java中有哪些常用的锁，在什么场景下使用？]] — 各类锁的全局选型（含 synchronized/ReentrantLock 定位）
- [[编程/java并发编程/并发安全/怎么理解可重入锁？]] — 可重入概念专项
- [[编程/java并发编程/多线程/线程间通信有哪些方式？]] — Lock + Condition 在「等待/唤醒」中的定位
- [[编程/java并发编程/并发安全/juc包下你常用的类？]] — ReentrantLock 所属的 JUC 全家桶
- [[编程/java并发编程/并发安全/synchronized锁静态方法和普通方法区别？]] — synchronized 依锁对象（this vs Class）划分互斥范围的专项