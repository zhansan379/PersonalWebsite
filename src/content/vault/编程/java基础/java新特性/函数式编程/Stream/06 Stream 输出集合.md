---
title: Stream 输出集合
tags:
  - Java
  - Java 8
  - Stream
  - collect
  - Collectors
  - 函数式编程
created: 2026-08-22
updated: 2026-08-22
---

# Stream 输出集合

> 把 Stream 的元素收集到集合（List/Set/Map 或数组）是**聚合操作**，会强制 Stream 输出每个元素、真正触发计算。核心方法是 `collect(Collectors.toXxx())` 或 `toArray()`。Stream 操作分**转换操作**（惰性，不计算）与**聚合操作**（立即计算）两类。

## 一、转换 vs 聚合（重要区分）

- **转换操作**（`map()`、`filter()`）：把一个 Stream 转换为另一个 Stream，**不会触发任何计算**
- **聚合操作**（`reduce()`、`collect()`）：对 Stream 的每个元素进行计算，得到一个确定结果，会**立即触发计算**。

验证：转换操作保存的只是规则，不占内存也不算：

```java
Stream<Long> s1 = Stream.generate(new NatualSupplier());
Stream<Long> s2 = s1.map(n -> n * n);   // 不计算
Stream<Long> s3 = s2.map(n -> n - 1);   // 不计算
System.out.println(s3); // java.util.stream.ReferencePipeline$3@...
```

而聚合操作会触发连锁反应——下游向上游逐个请求元素，直到源头：

```java
Stream<Long> s4 = s3.limit(10);
s4.reduce(0, (acc, n) -> acc + n); // 真正从 Supplier 请求数据并聚合
```

## 二、输出为 List

把 Stream 元素保存到 List 用 `collect(Collectors.toList())`：

```java
Stream<String> stream = Stream.of("Apple", "", null, "Pear", "  ", "Orange");
List<String> list = stream
        .filter(s -> s != null && !s.isBlank()) // 先过滤空串
        .collect(Collectors.toList());
```

`Collectors.toList()` 是一个 `Collector` 实例，内部通过类似 `reduce()` 的操作把每个元素添加到 `ArrayList`。类似的，`collect(Collectors.toSet())` 收集到 Set。

## 三、输出为数组

用 `toArray()` 并传入数组的"构造方法"：

```java
List<String> list = List.of("Apple", "Banana", "Orange");
String[] array = list.stream().toArray(String[]::new);
```

`String[]::new` 的签名是 `IntFunction<String[]>` 的 `String[] apply(int)`（传入 int 数组长度，返回数组）。

## 四、输出为 Map

需要两个映射函数，分别把元素映射为 key 和 value：

```java
Stream<String> stream = Stream.of("APPL:Apple", "MSFT:Microsoft");
Map<String, String> map = stream.collect(Collectors.toMap(
        s -> s.substring(0, s.indexOf(':')),   // 映射为 key
        s -> s.substring(s.indexOf(':') + 1))); // 映射为 value
```

## 五、分组输出

用 `Collectors.groupingBy()`，提供分组 key 和分组 value 两个函数：

```java
List<String> list = List.of("Apple", "Banana", "Blackberry", "Coconut", "Avocado", "Cherry", "Apricots");
Map<String, List<String>> groups = list.stream()
        .collect(Collectors.groupingBy(s -> s.substring(0, 1), Collectors.toList()));
// 结果: {A=[Apple, Avocado, Apricots], B=[Banana, Blackberry], C=[Coconut, Cherry]}
```

对 `Student` 这类含年级/班级字段的对象，可非常简单地按年级或班级分组归类。

## 六、小结

Stream 通过 `collect()` 方法可以方便地输出为 `List`、`Set`、`Map`，还可以分组输出；输出为数组用 `toArray()`。这些都是**聚合操作**，会真正触发 Stream 的计算。

## 七、相关页面

- [[00 Stream 是什么]] — 惰性计算与聚合计算的原理
- [[04 Stream reduce]] — 另一种聚合操作
- [[03 Stream filter]] — 配合 filter 先过滤再收集