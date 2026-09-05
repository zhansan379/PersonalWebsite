---
title: Stream 是什么
tags:
  - Java
  - Java 8
  - Stream
  - 函数式编程
  - 惰性计算
created: 2026-08-22
updated: 2026-08-22
---

# Stream 是什么

> Java 8 引入的流式 API，位于 `java.util.stream` 包。它代表**任意 Java 对象的序列**，支持函数式编程与链式操作，核心特点是**惰性计算**（元素可实时计算、转换操作不触发计算）。

## 一、三大易混淆点：Stream vs InputStream vs List

**划重点**：此 `Stream` 不同于 `java.io` 的 `InputStream`/`OutputStream`：

| | java.io | java.util.stream |
| --- | --- | --- |
| 存储 | 顺序读写的 `byte` 或 `char` | 顺序输出的任意 Java 对象实例 |
| 用途 | 序列化至文件或网络 | 内存计算 / 业务逻辑 |

**再次划重点**：`Stream` 也不同于 `List`（`List` 的每个元素都已在内存中），`Stream` 的元素**可能没有预先存储在内存，而是实时计算出来的**：

| | java.util.List | java.util.stream |
| --- | --- | --- |
| 元素 | 已分配并存储在内存 | 可能未分配，实时计算 |
| 用途 | 操作一组已存在的 Java 对象 | 惰性计算 |

## 二、典型例子：表示"全体自然数"

`List` 无法表示无限集合（自然数是无限的，内存再大也放不下）：

```java
List<BigInteger> list = ??? // 全体自然数?
```

用 `Stream` 可以做到，且能进行各种操作：

```java
Stream<BigInteger> naturals = createNaturalStream(); // 全体自然数
naturals.map(n -> n.multiply(n)) // 1, 4, 9, 16, 25...
        .limit(100)               // 截取前100个
        .forEach(System.out::println); // 打印前100个自然数的平方
```

## 三、Stream 的三大特点

1. **可"存储"有限个或无限个元素**（"存储"打了引号：元素可能已在内存，也可能实时计算）。
2. **一个 `Stream` 可轻易转换为另一个 `Stream`**，而不修改原 `Stream` 本身。
3. **惰性计算**：真正的计算通常发生在最后结果的获取。

## 四、惰性计算的原理

```java
Stream<BigInteger> naturals = createNaturalStream(); // 不计算
Stream<BigInteger> s2 = naturals.map(n -> n.multiply(n)); // 不计算
Stream<BigInteger> s3 = s2.limit(100); // 不计算
s3.forEach(System.out::println); // 计算
```

**要点**：一个 `Stream` 转换为另一个 `Stream` 时，实际上只存储了**转换规则**，没有任何计算发生。只有最后调用 `forEach` 等需要输出元素的操作时才真正计算。

因此 Stream API 基本用法是：**创建一个 Stream → 做若干次转换 → 最后调用一个求值方法获取结果**：

```java
int result = createNaturalStream() // 创建Stream
             .filter(n -> n % 2 == 0) // 任意个转换
             .map(n -> n * n) // 任意个转换
             .limit(100) // 任意个转换
             .sum(); // 最终计算结果
```

## 五、小结

- Stream API 提供了一套新的流式处理的抽象序列。
- Stream API 支持函数式编程和链式操作。
- **转换操作不触发计算，聚合操作才触发计算**（详见 [[06 Stream 输出集合]]）。

## 六、相关页面

- [[01 Stream 创建]] — 如何创建 Stream
- [[02 Stream map]] / [[03 Stream filter]] / [[04 Stream reduce]] — 常用转换/聚合操作
- [[05 Stream 其他操作]] — sorted、distinct、flatMap、并行等
- [[wiki/编程/java基础/java新特性/Lambda 表达式基础]] — Stream 依赖的基础