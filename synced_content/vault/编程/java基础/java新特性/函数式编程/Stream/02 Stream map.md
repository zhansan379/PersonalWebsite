---
title: Stream map
tags:
  - Java
  - Java 8
  - Stream
  - map
  - 函数式编程
created: 2026-08-22
updated: 2026-08-22
---

# Stream map

> `map()` 是 Stream 最常用的**转换方法**：把一个 Stream 的每个元素一一映射为另一个元素，生成一个新的 Stream。它是惰性的（不触发计算），接收的是 `Function` 接口对象。

## 一、概念：把函数映射到每个元素

`map` 操作把一种运算映射到序列的每一个元素上。例如对 `x` 求平方 `f(x) = x * x`，映射到 1~9 得到 1,4,9,...,81：

```
[ 1   2   3   4   5   6   7   8   9 ]
  │   │   │   │   │   │   │   │   │    => 每个元素应用 f(x) = x*x
  ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
[ 1   4   9  16  25  36  49  64  81 ]
```

```java
Stream<Integer> s = Stream.of(1, 2, 3, 4, 5);
Stream<Integer> s2 = s.map(n -> n * n);
```

## 二、底层：接收 `Function` 接口

`map()` 方法接收的是 `Function` 接口对象，负责把一个 `T` 类型转换成 `R` 类型：

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper);
```

`Function` 的定义：

```java
@FunctionalInterface
public interface Function<T, R> {
    // 将T类型转换为R:
    R apply(T t);
}
```

## 三、不仅能算数，也能转换对象和字符串

```java
List.of("  Apple ", " pear ", " ORANGE", " BaNaNa ")
        .stream()
        .map(String::trim)      // 去空格
        .map(String::toLowerCase) // 变小写
        .forEach(System.out::println); // 打印
```

通过若干步 `map` 转换，可以写出逻辑简单、清晰的代码。

## 四、小结

- `map()` 用于将一个 Stream 的每个元素**映射成另一个元素**并转换成新 Stream。
- 可以将一种元素类型**转换成另一种**元素类型（如 `String` → `LocalDate`）。
- 属于**转换操作**，不触发计算，可链式调用。

## 五、相关页面

- [[00 Stream 是什么]] — 惰性计算概念
- [[03 Stream filter]] — 兄弟转换操作
- [[wiki/编程/java基础/java新特性/四大函数式接口]] — Function / Predicate 等接口