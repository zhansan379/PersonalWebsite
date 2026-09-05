---
title: Stream 创建
tags:
  - Java
  - Java 8
  - Stream
  - 函数式编程
created: 2026-08-22
updated: 2026-08-22
---

# Stream 创建

> 要使用 Stream 必须先创建它。常见创建方式有：`Stream.of()`、基于数组/Collection、基于 `Supplier`（无限序列）、以及 API 提供的直接方法（文件行、正则分割）。另有针对基本类型的 `IntStream`/`LongStream`/`DoubleStream`。

## 一、`Stream.of()` — 最简方式

直接用静态方法 `Stream.of()` 传入可变参数，创建能输出确定元素的 Stream：

```java
Stream<String> stream = Stream.of("A", "B", "C", "D");
stream.forEach(System.out::println); // forEach 实际是内部循环
```

虽然没什么实质用途，但测试很方便。

## 二、基于数组或 Collection

- 数组 → `Stream`：用 `Arrays.stream()` 方法
- `Collection`（`List`、`Set`、`Queue` 等）→ `Stream`：直接调用 `stream()` 方法

```java
Stream<String> stream1 = Arrays.stream(new String[] { "A", "B", "C" });
Stream<String> stream2 = List.of("X", "Y", "Z").stream();
```

这类方式把一个现有序列变为 Stream，元素是固定的。

## 三、基于 Supplier — 表示无限序列

通过 `Stream.generate()` 传入一个 `Supplier` 对象：

```java
Stream<String> s = Stream.generate(Supplier<String> sp);
```

基于 `Supplier` 的 Stream 会不断调用 `Supplier.get()` 产生下一个元素。这种 Stream **保存的不是元素，而是算法**，可表示无限序列。

```java
Stream<Integer> natual = Stream.generate(new NatualSupplier());
// 注意：无限序列必须先变成有限序列再打印:
natual.limit(20).forEach(System.out::println);

class NatualSupplier implements Supplier<Integer> {
    int n = 0;
    public Integer get() { n++; return n; }
}
```

**关键**：无限序列不能直接对 `forEach()`/`count()` 等最终求值操作，会死循环；必须先用 `limit()` 截取前面若干元素变成有限序列。

> 相比 `List`，无限序列用 Stream 几乎不占空间，因为每个元素实时计算、用的时候才生成。

## 四、其他方法 — API 直接提供

- **`Files.lines()`**：把一个文件变成 Stream，每个元素是一行内容：

```java
try (Stream<String> lines = Files.lines(Paths.get("/path/to/file.txt"))) { ... }
```

- **`Pattern.splitAsStream()`**：把长字符串用正则分割成 Stream 而非数组：

```java
Pattern p = Pattern.compile("\\s+");
Stream<String> s = p.splitAsStream("The quick brown fox ...");
```

## 五、基本类型专属的 Stream

Java 泛型不支持基本类型，不能用 `Stream<int>`。为了保存 `int` 只能 `Stream<Integer>`（会有装箱/拆箱开销）。为提高效率，标准库提供 `IntStream`、`LongStream`、`DoubleStream`：

```java
// 将int[]数组变为IntStream:
IntStream is = Arrays.stream(new int[] { 1, 2, 3 });
// 将Stream<String>转换为LongStream:
LongStream ls = List.of("1", "2", "3").stream().mapToLong(Long::parseLong);
```

## 六、小结

创建 Stream 的方法有：`Stream.of()`、基于数组/Collection、基于 `Supplier`（无限序列）、以及 `Files.lines()`/`Pattern.splitAsStream()` 等 API 方法。消耗基本类型时应使用 `IntStream`/`LongStream`/`DoubleStream`。

## 七、相关页面

- [[00 Stream 是什么]] — Stream 概念与惰性计算
- [[06 Stream 输出集合]] — 从 Stream 收集到集合