---
title: 使用 Future 获取异步结果
tags:
  - Java
  - 并发
  - Future
  - Callable
  - 线程池
  - 异步
created: 2026-08-22
updated: 2026-08-22
---

# 使用 Future 获取异步结果

> `Future<V>` 是 Java 标准库提供的"未来结果"句柄：向线程池提交一个 `Callable` 任务即可获得 `Future`，在任意时刻调用 `get()` 拿到异步执行结果——任务未完成时 `get()` 会阻塞，从而摆脱 `Runnable`"无返回值"的限制。

## 一、这是什么

提交任务到线程池有两种方式：

- **`Runnable`**：`run()` 方法**无返回值**。任务需要结果时得自己保存到字段、再暴露 getter，非常不便。
- **`Callable<V>`**：`call()` 方法**有返回值**，且是泛型接口，可返回指定类型的任务结果。

`Callable` 需要一个"获取异步结果"的通道 → 这就是 **`Future`**。`ExecutorService.submit(Callable)` 返回一个 `Future<V>` 实例，代表一个将来能取到结果的对象。

## 二、核心内容

### 1. 使用流程

```java
ExecutorService executor = Executors.newFixedThreadPool(4);
// 定义任务（Callable 有返回值）
Callable<String> task = new Task();
// 提交任务，获得 Future 句柄
Future<String> future = executor.submit(task);
// 在将来某时刻获取异步执行结果
String result = future.get(); // 任务未完成则阻塞等待
```

### 2. `Future<V>` 接口方法

| 方法 | 行为 |
| :--- | :--- |
| `get()` | 获取结果，任务未完成时**阻塞等待** |
| `get(long timeout, TimeUnit unit)` | 获取结果，**只等待指定时长**（超时抛 `TimeoutException`） |
| `cancel(boolean mayInterruptIfRunning)` | 取消当前任务 |
| `isDone()` | 判断任务是否已完成 |

### 3. 两种等待方式及其局限

- 调用阻塞的 `get()`，或轮询 `isDone()`。
- **通病**：无论哪种，主线程都会被"吊住"，要么干等要么反复查，无法在任务完成时被主动通知。

> 这正是下一阶段引入 `CompletableFuture`（回调机制 + 可串行/并行编排）的动机，见相关页面。

## 三、如何应用

1. 需要拿到**线程池任务的返回值**时，用 `Callable` + `Future` 替代 `Runnable`。
2. 对耗时不确定的任务，用带超时的 `get(timeout, unit)` 避免无限卡死。
3. 若需"完成即回调、多任务编排"，升级使用 `CompletableFuture`。

## 四、相关页面

- [[wiki/编程/java并发编程/多线程/使用 CompletableFuture]] — Future 的增强版：回调 + 串行/并行编排
- [[wiki/编程/java并发编程/多线程/Java 多线程与 JMM]] — 线程池与异步执行的内存语义背景