---
title: ArrayList 线程安全吗？把 ArrayList 变成线程安全有哪些方法？
tags:
  - Java
  - 集合
  - ArrayList
  - 线程安全
  - CopyOnWriteArrayList
  - Vector
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# ArrayList 线程安全吗？把 ArrayList 变成线程安全有哪些方法？

> `ArrayList` **不是线程安全的**。要变线程安全有三条路：`Collections.synchronizedList` 包装（同步锁）、`CopyOnWriteArrayList`（写时复制，**推荐**）、`Vector`（老派同步，已过时）。

## 一、这是什么

`ArrayList` 底层是数组，普通单线程下高效；但**多线程并发读写时没有同步保护**。需要线程安全时，有几种替代/包装方案，区别在**加锁粒度与读写策略**。

## 二、核心内容：三种方案

### 1. `Collections.synchronizedList()` — 包装同步锁

把 `ArrayList` 包一层，所有方法用 `synchronized` 同步（整个 List 加锁）：

```java
List<String> synchronizedList = Collections.synchronizedList(arrayList);
```

> 注意：返回的是包装类，迭代时仍需外部手动同步（迭代器非线程安全）。

### 2. `CopyOnWriteArrayList` — 写时复制（推荐）

线程安全的 List 实现，**写操作复制整个数组、读不加锁**，适合读多写少：

```java
CopyOnWriteArrayList<String> copyOnWriteArrayList = new CopyOnWriteArrayList<>(arrayList);
```

> 机制详见 [[wiki/编程/java集合/List/线程安全的 List， CopyonWriteArraylist是如何实现线程安全的]]。

### 3. `Vector` — 老派同步实现

Java 的老旧线程安全 List，方法基本都 `synchronized`，性能差不推荐：

```java
Vector<String> vector = new Vector<>(arrayList);
```

## 三、如何应用 / 面试怎么讲

**回答骨架**：定调"不是线程安全的" → 三种变安全的方法 → 各自锁粒度/读写策略 → 推荐选型。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| 三种方案怎么选？ | 默认 **CopyOnWriteArrayList**（读多写少最佳）；Collections.synchronizedList 简单但整 List 锁；Vector 过时 |
| CopyOnWrite 和 synchronizedList 区别？ | 前者**读写分离**（读无锁、写复制），适合读多写少；后者**整体加锁**，简单但并发读也串行 |
| synchronizedList 迭代要额外加锁吗？ | 要，因为其迭代器没同步，并发修改会抛 CME |
| 为什么推荐 CopyOnWrite 而非 Vector？ | Vector 所有方法整体加锁，并发效率低；CopyOnWrite 读无锁、写用 ReentrantLock 复制，读写性能更好 |

## 四、相关页面

- [[wiki/编程/java集合/List/为什么ArrayList不是线程安全的，具体来说是哪里不安全？]] — 并发 add 的三个具体问题
- [[wiki/编程/java集合/List/线程安全的 List， CopyonWriteArraylist是如何实现线程安全的]] — CopyOnWriteArrayList 源码级原理
- [[wiki/编程/java集合/概念/Java中的线程安全的集合是什么？]] — 线程安全集合全景