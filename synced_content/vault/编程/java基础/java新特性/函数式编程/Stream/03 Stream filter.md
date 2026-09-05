---
title: Stream filter
tags:
  - Java
  - Java 8
  - Stream
  - filter
  - 函数式编程
created: 2026-08-22
updated: 2026-08-22
---

# Stream filter

> `filter()` 是 Stream 常用的**转换方法**：对 Stream 的所有元素一一测试，不满足条件的被"滤掉"，剩余元素构成新 Stream。它是惰性的（不触发计算），接收的是 `Predicate` 接口对象。

## 一、概念：滤掉不满足条件者

对 1~9 这个 Stream 调用 `filter()`，测试函数 `f(x) = x % 2 != 0`（是否为奇数），过滤掉偶数，剩下奇数 1,3,5,7,9：

```
[ 1   2   3   4   5   6   7   8   9 ]
  │   X   │   X   │   X   │   X   │    X = 被滤掉（偶数）
  ▼       ▼       ▼       ▼       ▼
[ 1       3       5       7       9 ]
```

```java
import java.util.stream.IntStream;

IntStream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
        .filter(n -> n % 2 != 0)
        .forEach(System.out::println);
```

> 经过 `filter()` 后生成的 Stream 元素**可能变少**。

## 二、底层：接收 `Predicate` 接口

`filter()` 接收的是 `Predicate` 接口对象，负责判断元素是否符合条件：

```java
@FunctionalInterface
public interface Predicate<T> {
    // 判断元素t是否符合条件:
    boolean test(T t);
}
```

## 三、不限于数值，可处理任意对象

从一组 `LocalDate` 中过滤掉工作日，只留周六周日：

```java
Stream.generate(new LocalDateSupplier())
        .limit(31)
        .filter(ldt -> ldt.getDayOfWeek() == DayOfWeek.SATURDAY
                || ldt.getDayOfWeek() == DayOfWeek.SUNDAY)
        .forEach(System.out::println);
```

## 四、小结

- `filter()` 对 Stream 的每个元素进行测试，通过测试的元素被过滤后生成一个新 Stream。
- 属于**转换操作**，不触发计算。
- 结合 `map()`、`limit()` 等可链式组合出清晰的过滤-转换流水线。

## 五、相关页面

- [[00 Stream 是什么]] — 惰性计算概念
- [[02 Stream map]] — 兄弟转换操作
- [[wiki/编程/java基础/java新特性/四大函数式接口]] — Predicate 接口