---
title: 使用 CompletableFuture 编排异步任务
tags:
  - Java
  - 并发
  - CompletableFuture
  - 异步
  - 回调
  - 编排
  - CompletionStage
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# 使用 CompletableFuture 编排异步任务

> `CompletableFuture`（Java 8 引入）是对 `Future` 的升级，实现了 `CompletionStage` 接口与 `Future` 接口。它不再让主线程阻塞等待，而是**注册回调**，任务完成或出错时自动触发；并能把多个异步任务做**串行**（`thenApply`/`thenCombine`）与**并行**（`anyOf`/`allOf`）编排，实现复杂异步流程控制。学会的要点：创建（supplyAsync/runAsync）→ 取结果（get/join/getNow）→ 回调（thenXxx）→ 组合（two 任务/多任务）。

## 一、这是什么

`Future.get()` 需要阻塞等待或轮询 `isDone()`，主线程会被迫停住。`CompletableFuture` 改成了"**回调驱动**"：传入回调对象，异步任务完成或发生异常时自动调用对应方法，并支持把多个异步任务组合起来串行/并行。扎实掌握以下四部分，就能覆盖绝大多数异步场景。

## 二、核心内容

### 1. 创建异步任务

#### ① supplyAsync —— 带返回值的异步任务

返回 `CompletableFuture<U>`，需要一个 `Supplier<U>`。两种重载：**默认线程池**（`ForkJoinPool.commonPool()`）或**自定义线程池**。

```java
// 带返回值异步请求，默认线程池
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
    System.out.println("do something....");
    return "result";
});
System.out.println("结果->" + cf.get()); // 等待任务执行完成

// 带返回值异步请求，可自定义线程池
ExecutorService es = Executors.newSingleThreadExecutor();
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> "result", es);
```

#### ② runAsync —— 无返回值的异步任务

返回 `CompletableFuture<Void>`，需要一个 `Runnable`，同样有默认/自定义线程池两种重载：

```java
CompletableFuture<Void> cf = CompletableFuture.runAsync(() -> {
    System.out.println("do something....");
});
System.out.println("结果->" + cf.get());
```

**对比**：`supplyAsync` 用 `Supplier`（可返回结果）适用于要结果的任务；`runAsync` 用 `Runnable`（无返回）适用于"只管执行"的任务。

### 2. 获取任务结果的方法

| 方法 | 行为 |
| :--- | :--- |
| `T get()` | 若完成返回结果，否则**阻塞等待**并抛检查异常（`InterruptedException`/`ExecutionException`） |
| `T get(timeout, unit)` | 最大等待指定时间，超时抛 `TimeoutException` |
| `T join()` | 类似 get，但抛**非检查异常**（unchecked），更符合函数式写法；方便 lambda/流里用 |
| `T getNow(valueIfAbsent)` | 已完成则返回结果，否则返回给定的**兜底值**（不阻塞） |
| `boolean complete(value)` | 若未完成，将结果设为给定值 |
| `boolean completeExceptionally(ex)` | 若未完成，抛出给定异常 |

> 要点：`get()`（检查异常）vs `join()`（unchecked异常）在 lambda/stream 中更常用后者；不想要阻塞等待返回值，用 `getNow(兜底)` 或直接注册回调。

### 3. 异步回调处理（两阶段：A 完成后执行 B）

所有回调都有两套：`thenXxx`（沿用**当前线程**）与 `thenXxxAsync`（提交到**线程池**另起线程，能自定义线程池）。

#### ① thenApply —— 有入参有返回值（转换链）

把上一个任务的结果作为入参传进回调，回调**有返回值**，可继续链式：

```java
CompletableFuture<Integer> cf1 = CompletableFuture.supplyAsync(() -> 1);
CompletableFuture<Integer> cf2 = cf1.thenApply(result -> result + 2); // 串行转换
System.out.println("cf2结果->" + cf2.get()); // 3
```

#### ② thenAccept —— 有入参无返回值（消费结果）

把结果传给回调做"消费"，回调**无返回值**（`CompletableFuture<Void>`）：

```java
CompletableFuture<Integer> cf1 = CompletableFuture.supplyAsync(() -> 1);
CompletableFuture<Void> cf2 = cf1.thenAccept(result -> {
    System.out.println("上个任务结果：" + result); // 只消费，不返回
});
```

#### ③ thenRun —— 无入参无返回值（后续动作）

上个任务完成后执行一个**不看结果、不返回**的动作：

```java
CompletableFuture<Integer> cf1 = CompletableFuture.supplyAsync(() -> 1);
CompletableFuture<Void> cf2 = cf1.thenRun(() -> System.out.println("执行后续动作"));
```

#### ④ whenComplete —— 捕获结果与异常（无返回值）

任务完成后回调，把**结果或执行异常**都传进来（正常时异常为 null）；返回的 CompleteableFuture 结果与上任务一致（正常则 get 返回结果，异常则 get 抛异常）：

```java
CompletableFuture<Integer> cf1 = CompletableFuture.supplyAsync(() -> {
    int a = 1 / 0; // 模拟异常
    return 1;
});
CompletableFuture<Integer> cf2 = cf1.whenComplete((result, e) -> {
    System.out.println("上个任务结果：" + result);
    System.out.println("上个任务抛出异常：" + e);
});
```

#### ⑤ handle —— 同 whenComplete 但有返回值

与 whenComplete 区别仅在回调**有返回值**，可在异常时给出替代结果，避免异常向上传播：

```java
CompletableFuture<Integer> cf2 = cf1.handle((result, e) -> {
    System.out.println("上个任务结果：" + result + " 异常：" + e);
    return result + 2; // 有返回值（如兜底/转换）
});
```

**回调一族速记**：`thenApply`=有参有返回；`thenAccept`=有参无返回；`thenRun`=无参无返回；`whenComplete`=拿到结果+异常但无返回；`handle`=同 whenComplete 但要返回一个替代值。

### 4. 多任务组合处理

#### ① 都完成才继续：thenCombine / thenAcceptBoth / runAfterBoth

三个方法都把**两个 CompletableFuture 组合**，**两个都正常完成**才进入下一阶段：

| 方法 | 入参 | 返回值 |
| :--- | :--- | :--- |
| `thenCombine` | 两个任务的结果都传入 | **有**（如将两结果相加） |
| `thenAcceptBoth` | 两个任务的结果都传入 | 无 |
| `runAfterBoth` | 无入参 | 无 |

```java
CompletableFuture<Integer> cf1 = CompletableFuture.supplyAsync(() -> 1);
CompletableFuture<Integer> cf2 = CompletableFuture.supplyAsync(() -> 2);
CompletableFuture<Integer> cf3 = cf1.thenCombine(cf2, (a, b) -> a + b); // 都完成，合并结果
System.out.println("cf3结果->" + cf3.get()); // 3
```

> 两个任务中只要有一个执行异常，则将异常作为该任务的执行结果。

#### ② 任一带 one 完成就继续：applyToEither / acceptEither / runAfterEither

三者也组合两个任务，但**只要有一个正常完成**就进入下一阶段（适合"多源取最快"）：

| 方法 | 入参 | 返回值 |
| :--- | :--- | :--- |
| `applyToEither` | 已完成任务的结果传入 | **有** |
| `acceptEither` | 已完成任务的结果传入 | 无 |
| `runAfterEither` | 无入参 | 无 |

```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> { sleep(2000); return "cf1 任务完成"; });
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> { sleep(5000); return "cf2 任务完成"; });
CompletableFuture<String> cf3 = cf1.applyToEither(cf2, result -> { // 2秒后 cf1 先完成，触发
    System.out.println("接收到" + result);
    return "cf3 任务完成";
});
```

#### ③ 批量编排：allOf / anyOf（多个任务）

| 方法 | 行为 |
| :--- | :--- |
| `allOf(...)` | **所有任务都完成**才返回；只要有一个执行异常，则 get 时抛异常；全正常则 get 返回 `null` |
| `anyOf(...)` | **只要有一个任务完成**就返回该结果；若有异常则 get 抛异常；全正常 get 返回**最快完成的结果** |

```java
CompletableFuture<String> cfAll = CompletableFuture.allOf(cf1, cf2, cf3); // 全完成
CompletableFuture<Object> cfAny = CompletableFuture.anyOf(cf1, cf2, cf3); // 任一完成
```

### 5. 命名规则 / 线程模型

- `xxx()`：在当前线程继续执行下一步。
- `xxxAsync()`：提交到线程池异步执行（可自定义线程池，默认 `ForkJoinPool.commonPool()`）。

> 例：`thenApply` 与 `thenApplyAsync` 的最大区别就是**下一步在哪条线程跑**——用 `thenApply` 时子任务与主方法同线程，`thenApplyAsync` 则另起线程。

## 三、如何应用

1. **替代"阻塞等待结果"**：需要结果时注册 `thenAccept`/`thenApply`，而非主线程 `get()` 干等。
2. **串行依赖链**：先查证券代码再查价格，用 `thenApply` 把上一步结果喂给下一步。
3. **无返回值的一步遍历**：`supplyAsync` 造任务 → `thenAccept`/`thenRun` 做旁路动作。
4. **异常兜底**：`whenComplete`/`handle` 拿到异常信息，`handle` 还能返回替代值避免异常上抛。
5. **两任务都完成再合并**：分布式拿两个独立数据 → `thenCombine` 聚合。
6. **多源取最快 / 容错**：`anyOf`/`applyToEither` 同时发起多个源，任一带 one 返回即用。
7. **汇聚等待**：`allOf` 等所有子任务完成后一起聚合再处理。

## 四、相关页面

- [[wiki/编程/java并发编程/多线程/使用 Future]] — CompletableFuture 的前身与动机（阻塞等待的问题）
- [[completableFuture怎么用的？]] — 面试向整合篇（面试答法与追问预案，与本文的使用详解互补）
- [[wiki/编程/java并发编程/多线程/Java 多线程与 JMM]] — 线程池与异步执行的内存语义背景
- [[wiki/编程/java基础/java新特性/Lambda 表达式基础]] — supplyAsync/thenApply 的 lambda 写法基础
- [[Java 8 你知道有什么新特性？]] — CompletableFuture 是 Java 8 新特性之一