---
title: juc 包下你常用的类？
tags:
  - Java
  - 并发编程
  - JUC
  - ThreadPoolExecutor
  - ConcurrentHashMap
  - CopyOnWriteArrayList
  - CountDownLatch
  - CyclicBarrier
  - Semaphore
  - AtomicInteger
  - AtomicReference
  - 面试
created: 2026-08-24
updated: 2026-08-25
---

# juc 包下你常用的类？

> 一句话概述：JUC 是 `java.util.concurrent` 并发工具包。面试问"常用哪些类"考的是**广度 + 组织能力**，按**职责分四类**记最清晰——① **线程池**（`ThreadPoolExecutor`/`Executors`）；② **并发集合**（`ConcurrentHashMap`/`CopyOnWriteArrayList` 等）；③ **同步工具**（`CountDownLatch`/`CyclicBarrier`/`Semaphore`）；④ **原子类**（`AtomicInteger`/`AtomicReference`）。先给四类框架再逐类举例，就不散。

## 一、这是什么

JUC 是 Java 提供的**并发工具库**（`java.util.concurrent`），把多线程开发中常用的线程池、线程安全集合、并发协作工具、原子操作都封装好了。面试问这题，**不靠背 API**，而是展示"有一套覆盖并发各子问题的工具清单"。把常用类按职责**归成四大类**，面试时先抛框架再逐个展开，既显广度又显条理。

## 二、核心内容：四大类常用 JUC 类

### ① 线程池类

| 类 | 职责 | 关键点 |
| :--- | :--- | :--- |
| `ThreadPoolExecutor` | 最核心的线程池类，创建和管理线程池 | 可通过 7 参数灵活配核心/最大线程数、任务队列、拒绝策略 |
| `Executors` | 线程池**工厂类** | `newFixedThreadPool`/`newCachedThreadPool`/`newSingleThreadExecutor` 快速建池，但暗藏 OOM 隐患，复杂场景建议手写 ThreadPoolExecutor |

> 扩展：`ScheduledExecutorService`（定时/周期调度）、`ForkJoinPool`（分治窃取）同属这一类。

### ② 并发集合类

| 类 | 职责 | 关键点 |
| :--- | :--- | :--- |
| `ConcurrentHashMap` | 线程安全哈希表 | JDK1.7 分段锁（Segment）；1.8 起改为 **CAS + synchronized 锁桶头节点**，锁粒度更细，高并发下优于 Hashtable |
| `CopyOnWriteArrayList` | 线程安全 List | 写时复制新数组，读在旧数组上，**读写分离**，适合**读多写少** |

> 扩展：`ConcurrentLinkedQueue`（CAS 无锁队列）、`CopyOnWriteArraySet`、`ConcurrentSkipListMap`（跳表有序）等同属这一类。

### ③ 同步工具类

| 类                | 职责                  | 一句话记忆                                    |
| :--------------- | :------------------ | :--------------------------------------- |
| `CountDownLatch` | 一个/多个线程等待一组线程完成后再继续 | "**一批完成就放行**"（countDown 减到 0）            |
| `CyclicBarrier`  | 一组线程互相等待，全到屏障点才一起走  | "**互相等到齐**"，可重置复用，可选 barrierAction       |
| `Semaphore`      | 控制同时访问某个资源的线程数      | "**限量并发**"（acquire/release 借还许可），如数据库连接池 |

> 区别速记：Latch = 等**别人**干完；Barrier = 大家**互相**到齐；Semaphore = 同时能进 **N** 个。

### ④ 原子类

	多个线程并发地对一个共享变量进行“读-改-写”操作（如自增、更新），且你希望利用硬件级别的CAS（比较并交换）机制，实现无锁（Lock-Free）的线程安全，以避免重量级锁（synchronized）带来的性能开销和阻塞风险。

| 类                 | 职责                | 关键点                                            |
| :---------------- | :---------------- | :--------------------------------------------- |
| `AtomicInteger`   | 整数原子操作（自增/自减/CAS） | 硬件级原子指令，**无锁**，避免 synchronized 性能开销，适用于计数/状态标记 |
| `AtomicReference` | 对象引用的原子更新         | 保证更新要么全成功要么全失败，常用于**无锁数据结构**或原子替换对象            |

> 扩展：`AtomicLong`、`AtomicBoolean`、数组原子类（`AtomicIntegerArray` 等）、`AtomicIntegerFieldUpdater` 同类。

### ⑤ 常用类的代码实践

> 前 ①②③④ 的表格是「一句话记忆」，这节给出**可运行的代码示例**，配合理解每个工具的实际用法——`java.util.concurrent` 包里的并发工具，常见的就这几类。

**① 线程池/异步：`Future` + `Callable`（能返回结果、可取消任务）**

`Callable` 类似 `Runnable` 但**可返回结果、可抛异常**；`Future` 表示异步计算的结果，可通过它取结果或取消任务。

```java
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class FutureCallableExample {
    public static void main(String[] args) throws Exception {
        ExecutorService executorService = Executors.newSingleThreadExecutor();

        Callable<Integer> callable = () -> {
            System.out.println(Thread.currentThread().getName() + " 开始执行 Callable 任务");
            Thread.sleep(2000);  // 模拟耗时操作
            return 42;           // 返回结果
        };

        Future<Integer> future = executorService.submit(callable);
        System.out.println("主线程继续执行其他任务");

        try {
            Integer result = future.get();  // 等待 Callable 任务完成并获取结果
            System.out.println("Callable 任务的结果: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }

        executorService.shutdown();
    }
}
```

**② 并发集合：`ConcurrentHashMap`（线程安全哈希表）**

允许多个线程**同时读**，并一定程度支持**并发写**，避免 `HashMap` 多线程下需手动 `synchronized` / `Collections.synchronizedMap()` 的性能问题。

```java
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapExample {
    public static void main(String[] args) {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        map.put("key1", 1);
        map.put("key2", 2);

        // 并发读操作
        map.forEach((key, value) -> System.out.println(key + ": " + value));

        // 并发写操作（computeIfAbsent 原子地补 key）
        map.computeIfAbsent("key3", k -> 3);
    }
}
```

**③ 同步工具：`CountDownLatch`（一批完成就放行）**

CountDownLatch 是 Java 并发包（java.util.concurrent）中的一个同步工具类，用于让一个或多个线程**等待**其他线程完成操作后再继续执行。
其核心是通过一个计数器（Counter）实现线程间的协调，常用于多线程任务的分阶段控制或主线程等待多个子线程就绪的场景，核心原理：
• 初始化计数器：创建 CountDownLatch 时指定一个初始计数值（如 N）。
• 等待线程阻塞：调用 await() 的线程会被阻塞，直到计数器变为 0。
• 任务完成通知：其他线程完成任务后调用 countDown()，使计数器减 1。
• 唤醒等待线程：当计数器减到 0 时，所有等待的线程会被唤醒。


```java
import java.util.concurrent.CountDownLatch;

public class CountDownLatchExample {
    public static void main(String[] args) throws InterruptedException {
        int numberOfThreads = 3;
        CountDownLatch latch = new CountDownLatch(numberOfThreads);

        for (int i = 0; i < numberOfThreads; i++) {
            new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + " 正在工作");
                try { Thread.sleep(1000); } catch (InterruptedException e) { e.printStackTrace(); }
                latch.countDown();  // 完成工作, 计数器减一
                System.out.println(Thread.currentThread().getName() + " 完成工作");
            }).start();
        }

        System.out.println("主线程等待工作线程完成");
        latch.await();  // 主线程等待, 直到计数器为 0
        System.out.println("所有工作线程已完成, 主线程继续执行");
    }
}
```

**③ 同步工具：`CyclicBarrier`（互等到齐、可重置复用）**

允许**一组线程互相等待，直到到达一个公共的屏障点**；全部到达后一起继续执行，且屏障**可重置循环使用**。与 `CountDownLatch` 不同——它侧重**线程间相互等待**，而非等待某些操作完成。

```java
import java.util.concurrent.CyclicBarrier;

public class CyclicBarrierExample {
    public static void main(String[] args) {
        int numberOfThreads = 3;
        CyclicBarrier barrier = new CyclicBarrier(numberOfThreads, () -> {
            System.out.println("所有线程都到达了屏障, 继续执行后续操作");
        });

        for (int i = 0; i < numberOfThreads; i++) {
            new Thread(() -> {
                try {
                    System.out.println(Thread.currentThread().getName() + " 正在运行");
                    Thread.sleep(1000);  // 模拟运行时间
                    barrier.await();      // 等待其他线程
                    System.out.println(Thread.currentThread().getName() + " 已经通过屏障");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

**③ 同步工具：`Semaphore`（限量并发）**

**计数信号量**，控制同时访问某共享资源的线程数量。`acquire()` 获取许可、`release()` 释放许可；无许可则阻塞直到有释放。常用来限制对数据库连接池、文件操作等资源的并发访问量。

```java
import java.util.concurrent.Semaphore;

public class SemaphoreExample {
    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(2);  // 允许 2 个线程同时访问

        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                try {
                    semaphore.acquire();  // 获取许可
                    System.out.println(Thread.currentThread().getName() + " 获得了许可");
                    Thread.sleep(2000);   // 模拟资源使用
                    System.out.println(Thread.currentThread().getName() + " 释放了许可");
                    semaphore.release();  // 释放许可
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

## 三、如何应用 / 面试怎么讲

**加分表达：**
- 先给**四类框架**（线程池 / 并发集合 / 同步工具 / 原子类）再逐个举例——体现"脑子里有一套覆盖并发各子问题的清单"，而非背 API。
- 每类带一个**关键细节**收口：线程池类点"Executors 有 OOM 坑，复杂用 ThreadPoolExecutor"；集合类点"ConcurrentHashMap 1.8 用 CAS+锁桶、CopyOnWrite 适读多写少"；同步工具点"Latch/Barrier/Semaphore 三个一句话区别"；原子类点"CAS 无锁 vs synchronized 转兑权衡"。
- 收尾给个**选型思路**：并发容器选 ConcurrentHashMap、读多写少选 CopyOnWrite、多线程协作按场景选三工具、计数/状态用原子类——呼应"会用且懂怎么选"。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| 为什么弃用 Hashtable/Vector 而用 ConcurrentHashMap/CopyOnWrite？ | Hashtable 方法级 synchronized 锁整个对象、并发度低；ConcurrentHashMap 锁桶/分段粒度细；读多写少用 CopyOnWrite 读写分离 |
| ConcurrentHashMap 1.7 和 1.8 区别？ | 1.7 Segment 分段锁（ReentrantLock）；1.8 volatile+CAS 写空槽+synchronized 锁桶头节点，锁粒度更细并发度更高 |
| CopyOnWriteArrayList 适用场景？ | 读多写少（如读多改少配置）、写时复制开销大，写频繁不适合 |
| CountDownLatch 和 CyclicBarrier 区别？ | Latch 等别人做完放行、不可复用；Barrier 互相等到齐、可重置复用、可带回调 |
| Semaphore 有什么用？ | 控制同时访问资源的线程数（限量并发），如数据库连接池限流 |
| 为什么用 AtomicInteger 而不用 synchronized？ | 靠硬件 CAS 原子指令，避免加锁/线程阻塞开销，高并发计数器更高效 |
| AtomicReference 有什么用？ | 原子替换对象引用，用于无锁数据结构/乐观更新（如 CAS 更新某共享对象） |
| Executors 快捷建池有什么问题？ | newCachedThreadPool 可致大量线程 OOM、newFixedThreadPool 无界队列任务堆积 OOM；复杂业务手动 ThreadPoolExecutor |

## 四、相关页面

- [[wiki/编程/java集合/Map/ConcurrentHashMap怎么实现的？]] — 并发集合代表的实现细节深挖
- [[wiki/编程/java并发编程/线程池/线程池怎么使用？]] — ThreadPoolExecutor/Executors 使用上手
- [[wiki/编程/java并发编程/多线程/使用 Future]] — 用 Future/Callable 取异步结果，与示例⑤呼应
- [[wiki/编程/java并发编程/多线程/使用 CompletableFuture]] — Future 的升级：声明式回调与编排
- [[wiki/编程/java并发编程/并发安全/介绍一下AQS]] — 三大同步工具（Latch/Barrier/Semaphore）共有的底层同步器
- [[wiki/编程/java并发编程/多线程/线程间通信有哪些方式？]] — 同步工具类在"线程协作/通信"中的定位
- [[wiki/编程/java并发编程/并发安全/Java中有哪些常用的锁，在什么场景下使用？]] — 原子类与锁的选型对比（CAS 乐观 vs synchronized 悲观）