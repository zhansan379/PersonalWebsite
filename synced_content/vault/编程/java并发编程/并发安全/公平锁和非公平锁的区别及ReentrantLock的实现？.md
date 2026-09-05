---
title: "公平锁和非公平锁的区别及 ReentrantLock 的实现？"
tags:
  - 并发编程
  - 并发安全
  - 公平锁
  - 非公平锁
  - ReentrantLock
  - AQS
  - hasQueuedPredecessors
  - 面试
created: 2026-08-25
updated: 2026-08-25
---

# 公平锁和非公平锁的区别及 ReentrantLock 的实现？

> 一句话定调：公平锁**按申请顺序**获取、非公平锁**允许插队竞争**。非公平锁吞吐更高（省去线程"休眠-唤醒"带来的用户态/内核态切换），但可能造成**线程饥饿**。`synchronized` **不是公平锁**；`ReentrantLock` 默认非公平、可配公平，**公平 vs 非公平唯一的代码差异就是公平锁多判了一句 `hasQueuedPredecessors()`**——队列里已有线程排队就放弃插队。特例：**`tryLock()` 永远不遵守公平原则**。

> **这道题对应的「答题主线」**，面试官问「什么是公平锁/非公平锁？ReentrantLock 怎么实现公平？」，可以按这条主线串起来：
> 一句话定义（公平=按申请顺序排队；非公平=先抢后排队）→ 非公平为何吞吐高（线程休眠/唤醒涉及用户态↔内核态切换，公平锁频繁切换变慢；非公平 CAS 直抢省切换）→ 非公平的代价（线程饥饿）→ 定位两者归属（synchronized 非公平；ReentrantLock 默认非公平可通过构造参数设公平）→ 落到源码（公平多判 `hasQueuedPredecessors()`）+ tryLock 特例。

## 一、什么是公平锁和非公平锁

- **公平锁**：多个线程**按照申请锁的顺序**获取锁。线程直接进入队列排队，队列中第一个线程才能获得锁。
  - 优点：各个线程公平平等，每个线程等待一段时间后都有机会执行；
  - 缺点：整体执行速度更慢、吞吐量更小。

- **非公平锁**：多个线程加锁时**直接尝试获取锁**，抢到了就占有，抢不到才到等待队列队尾等待。
  - 优点：整体执行速度更快、吞吐量更大；
  - 缺点：可能产生**线程饥饿**——若一直有线程插队，等待队列中的线程可能长时间得不到运行。

## 二、为什么非公平锁吞吐量比公平锁大

- **公平锁执行流程**：获取锁时先把线程**添加到等待队列队尾并休眠**；某线程用完锁后，唤醒队首线程尝试获取。锁的使用顺序即队列先后顺序。
  - 整个过程中线程从**运行态→休眠态→运行态**反复切换，而每次休眠和恢复都需要**用户态 → 内核态转换**，该转换较慢 → 公平锁执行慢。

- **非公平锁执行流程**：获取锁时**先通过 CAS 尝试**，成功直接拥有，失败才进等待队列等下次尝试。
  - 好处：不遵循先到先得，**避免了线程休眠和恢复的操作**，加速执行效率。

> 通俗说：公平锁频繁"睡了又醒、醒了又睡"，每次都要过内核态这道耗钱的闸；非公平锁先赌一把能抢就抢，抢不到再睡，平均比公平锁少很多的切换开销。

## 三、synchronized 是公平锁吗？

**不是。** synchronized **不属于公平锁**（非公平）；ReentrantLock **是**公平锁（可通过构造参数指定，但默认非公平）。所以谈到"公平/非公平可配置"时指的是 ReentrantLock。

## 四、ReentrantLock 怎么实现公平锁？

公平锁与非公平锁唯一的核心区别，在 `tryAcquire` 里是否多一个 `hasQueuedPredecessors()` 判断。

**公平锁的加锁源码：**

```java
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (!hasQueuedPredecessors() &&   // 多出来的判断
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    } else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

**非公平锁的加锁源码：**

```java
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (compareAndSetState(0, acquires)) {   // 没有 hasQueuedPredecessors()
            setExclusiveOwnerThread(current);
            return true;
        }
    } else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

### 4.1 核心差异一句话

公平锁多了一个限制条件：**`hasQueuedPredecessors()` 为 false**——该方法是判断等待队列里**是否已有线程在排队**。

- **公平锁**：一旦有线程在排队，当前线程就**不再尝试获取**锁，而是乖乖去排队；
- **非公平锁**：无论是否已有线程排队，都**先尝试抢一把**，抢不到再去排队。

### 4.2 特例：tryLock() 不遵守公平原则

即使设置的是公平锁模式，`tryLock()` 也会**插队**：一旦有线程释放锁，正在 `tryLock` 的线程就能立刻获得锁，哪怕它前面已有正在排队的线程。

看源码即明：

```java
public boolean tryLock() {
    return sync.nonfairTryAcquire(1);   // 直接调用非公平获取逻辑
}
```

它调用的就是 `nonfairTryAcquire()`——**是不公平的，和锁本身是否公平无关**。

### 4.3 小结

- **公平锁**：按多个线程申请锁的顺序获取锁（实现公平）；
- **非公平锁**：加锁时不考虑排队，直接尝试获取，存在"后申请却先获得"的情况，但换来了更高的整体效率。

## 五、面试速答与追问预案

### 5.1 三十秒速答版

公平锁按申请顺序、非公平锁允许插队。非公平吞吐更高，因为省去线程休眠/唤醒导致的用户态↔内核态切换，但可能线程饥饿。synchronized 非公平；ReentrantLock 默认非公平、可配公平，二者代码唯一区别是公平锁多判断 `hasQueuedPredecessors()`。特例：tryLock() 永远插队，不走公平逻辑。

### 5.2 追问预案

**Q1：非公平锁到底省掉了哪部分开销？**
**A**：公平锁线程拿锁要"排队→休眠→被唤醒→重调度运行"，每次休眠/唤醒都涉及用户态↔内核态切换。非公平锁先 CAS 抢一把，能抢到就完全不用休眠，省掉了这部分切换成本，所以吞吐更高。

**Q2：非公平锁的饥饿问题怎么理解？严重吗？**
**A**：若某线程频繁在锁释放瞬间插队，队列里等了很久的线程可能一直抢不到 → 饿死。实践中高并发频繁竞争且 fairness 要求不高时仍常用非公平（默认），因为饥饿概率相对可控，且公平锁开销大。

**Q3：hasQueuedPredecessors() 具体判断什么？**
**A**：判断 AQS 等待队列里**队首是否存在头节点之外的其他排队线程**。存在 → 返回 true → 公平锁线程不再尝试抢占，去排队；返回 false（没人排队）→ 才允许 CAS 争抢。

**Q4：ReentrantLock 公平锁构造参数怎么传？**
**A**：`new ReentrantLock(true)` 公平，`new ReentrantLock(false)` 防止歧义显式非公平（**默认无参即非公平**）。

**Q5：既然 tryLock() 非公平，它有什么实际用途？**
**A**：tryLock 本身语义是"非阻塞地尝试拿锁，拿不到立刻返回/超时放弃"，专用于避免长时间阻塞等待（配合循环重试、超时锁）。它刻意走非公平逻辑，是为了保证"立刻尝试、可以插队"的即时性需求。

## 六、相关页面

- [[编程/java并发编程/并发安全/synchronized和ReentrantLock及其应用场景？]] — ReentrantLock 的公平/非公平是"四大高级能力"之一，本页为其专项展开
- [[编程/java并发编程/并发安全/AQS 面试整合：答法逻辑、ReentrantLock 原理与从零设计]] — hasQueuedPredecessors / tryAcquire 等基于 AQS 的完整加锁走查
- [[编程/java并发编程/并发安全/介绍一下AQS]] — 公平/非公平锁靠 tryXxx 门槛区分、队列为何存在
- [[编程/java并发编程/并发安全/Java中有哪些常用的锁，在什么场景下使用？]] — 公平/非公平在锁选型中的宏观定位
- [[编程/java并发编程/并发安全/乐观锁的实现方式及CAS的缺点和解决？]] — 非公平锁"CAS 直抢"用到的乐观锁原子手段