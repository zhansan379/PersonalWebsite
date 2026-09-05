---
title: Stream 其他操作
tags:
  - Java
  - Java 8
  - Stream
  - 函数式编程
  - flatMap
  - 并行
created: 2026-08-22
updated: 2026-08-22
---

# Stream 其他操作

> 除了 `map()`、`filter()`、`reduce()` 常用操作外，Stream 还提供一系列方法：转换操作（`sorted`、`distinct`、`skip`/`limit`）、合并操作（`concat`、`flatMap`）、并行（`parallel`）、以及各类聚合方法（`count`/`max`/`min`/`sum`/`allMatch`/`anyMatch` 等）。

## 一、排序 `sorted()`

对 Stream 元素排序，要求元素实现 `Comparable` 接口；若要自定义排序，传入 `Comparator`：

```java
List.of("Orange", "apple", "Banana")
    .stream()
    .sorted()                          // 默认按 Comparable
    .collect(Collectors.toList());

List.of("Orange", "apple", "Banana")
    .stream()
    .sorted(String::compareToIgnoreCase) // 自定义：忽略大小写
    .collect(Collectors.toList());
```

> `sorted()` 是转换操作，返回新的 Stream。

## 二、去重 `distinct()`

无需先转 Set，直接去重：

```java
List.of("A", "B", "A", "C", "B", "D").stream().distinct()
    .collect(Collectors.toList()); // [A, B, C, D]
```

## 三、截取 `skip()` / `limit()`

常把无限 Stream 转有限的：`skip(n)` 跳过前 n 个，`limit(n)` 截取最多前 n 个：

```java
List.of("A","B","C","D","E","F").stream()
    .skip(2)   // 跳过 A, B
    .limit(3)  // 截取 C, D, E
    .collect(Collectors.toList()); // [C, D, E]
```

截取操作也是转换操作。

## 四、合并 `concat()`

合并两个 Stream 用静态方法 `concat()`：

```java
Stream<String> s1 = List.of("A", "B", "C").stream();
Stream<String> s2 = List.of("D", "E").stream();
Stream<String> s = Stream.concat(s1, s2);
// collect => [A, B, C, D, E]
```

## 五、`flatMap()` — 把"集合的 Stream"拍平

当 Stream 的元素是集合时，想合并为单一 Stream 用 `flatMap()`：

```java
Stream<List<Integer>> s = Stream.of(
        Arrays.asList(1, 2, 3),
        Arrays.asList(4, 5, 6),
        Arrays.asList(7, 8, 9));

Stream<Integer> i = s.flatMap(list -> list.stream());
// i => 1,2,3,4,5,6,7,8,9
```

`flatMap()` 把 Stream 的每个元素（这里是 `List`）映射为 Stream，然后**合并**成一个新 Stream：

```
┌─────────────┬─────────────┬─────────────┐
│┌───┬───┬───┐│┌───┬───┬───┐│┌───┬───┬───┐│
││ 1 │ 2 │ 3 │││ 4 │ 5 │ 6 │││ 7 │ 8 │ 9 ││
│└───┴───┴───┘│└───┴───┴───┘│└───┴───┴───┘│
└─────────────┴─────────────┴─────────────┘
                     │  flatMap(List -> Stream)
                     ▼
   ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
   │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │
   └───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

## 六、并行 `parallel()`

普通 Stream 是单线程逐元素处理；元素数量很大时可并行加速。只需用 `parallel()` 转换，无需写多线程代码：

```java
String[] result = s.parallel()  // 变成可并行处理的 Stream
                   .sorted()
                   .toArray(String[]::new);
```

`parallel()` 转换后的 Stream 只要可能就会并行处理后续操作。

## 七、其他聚合方法

- `count()`：返回元素个数
- `max(Comparator<? super T> cp)` / `min(...)`：最大/最小元素

针对 `IntStream`/`LongStream`/`DoubleStream` 额外提供：`sum()`、`average()`。

测试条件的方法：
- `boolean allMatch(Predicate<? super T>)`：是否所有元素均满足
- `boolean anyMatch(Predicate<? super T>)`：是否至少一个有满足

最后常用的 `forEach()` 可循环处理每个元素：

```java
s.forEach(str -> { System.out.println("Hello, " + str); });
```

## 八、小结：操作一类表

- **转换操作**：`map()`、`filter()`、`sorted()`、`distinct()`、`skip()`/`limit()`（惰性，不计算）
- **合并操作**：`concat()`、`flatMap()`
- **并行**：`parallel()`
- **聚合操作**：`reduce()`、`collect()`、`count()`、`max()`/`min()`、`sum()`、`allMatch()`/`anyMatch()`、`forEach()`（立即计算）

## 九、相关页面

- [[00 Stream 是什么]] — 转换 vs 聚合
- [[06 Stream 输出集合]] — collect 收集
- [[04 Stream reduce]] — reduce 聚合