---
title: Java 8 你知道有什么新特性？
tags:
  - Java
  - Java 8
  - Lambda
  - Stream
  - Optional
  - 新特性
created: 2026-08-22
updated: 2026-08-22
---

# Java 8 你知道有什么新特性？

> Java 8 是一次里程碑式大版本，核心是**引入函数式编程**：Lambda 表达式 + 函数式接口改变编码方式，Stream API 简化集合处理，Optional 降低空指针风险，此外还有方法引用、接口默认/静态方法、CompletableFuture 异步等新特性。

## 一、核心新特性速查表

| 特性名称                  | 描述                                      | 示例或说明                                                                                |
| :-------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------- |
| **Lambda 表达式**        | 简化匿名内部类，支持函数式编程                         | `(a, b) -> a + b` 代替匿名类实现接口                                                          |
| **函数式接口**             | 仅含一个抽象方法的接口，用 `@FunctionalInterface` 标记 | `Runnable`、`Comparator`，或自定义 `@FunctionalInterface interface MyFunc { void run(); }` |
| **Stream API**        | 链式操作处理集合数据，支持并行处理                       | `list.stream().filter(x -> x > 0).collect(Collectors.toList())`                      |
| **Optional 类**        | 封装可能为 `null` 的对象，减少空指针异常                | `Optional.ofNullable(value).orElse("default")`                                       |
| **方法引用**              | 简化 Lambda，直接引用现有方法                      | `System.out::println` 等价于 `x -> System.out.println(x)`                               |
| **接口默认方法与静态方法**       | 接口可定义默认实现和静态方法，增强扩展性                    | `interface A { default void print() { System.out.println("默认方法"); } }`               |
| **并行数组排序**            | 使用多线程加速数组排序                             | `Arrays.parallelSort(array)`                                                         |
| **重复注解**              | 允许同一位置多次使用相同注解                          | `@Repeatable` 注解配合容器注解使用                                                             |
| **类型注解**              | 注解可应用于更多位置（如泛型、异常等）                     | `List<@NonNull String> list`                                                         |
| **CompletableFuture** | 增强异步编程能力，支持链式调用和组合操作                    | `CompletableFuture.supplyAsync(() -> "result").thenAccept(System.out::println)`      |

## 二、最关键的两个：Lambda 与 Stream

Java 8 的众多新特性里，**改变日常编码风格最深的是 Lambda + Stream 这套函数式组合**：

- **Lambda 表达式**让"把行为作为参数传递"成为可能，取代了大量匿名内部类。
- **Stream API** 把集合处理改为声明式的链式管道（`filter` → `map` → `collect`），并可一键切换并行（`parallelStream`）。
- **方法引用** `类::方法` 是 Lambda 的进一步简化。

## 三、其他值得注意的点

- **Optional**：引导开发者显式处理"可能为空"，配合空指针防护。
- **接口默认方法**：允许给既有接口加方法而不破坏实现类（Java 8 之后接口演化的基础）。
- **CompletableFuture**：Java 8 之前异步靠 `Future`（只能阻塞 `get`）；它让异步结果可以链式组合、编排。

## 四、相关页面

- [[四大函数式接口]] — 函数式接口（Consumer / Supplier / Function / Predicate）
- [[wiki/编程/java基础/java新特性/Java 8 的函数式接口有哪些？]] <!-- 若存在 -->
- [[对注解解析的底层实现了解吗？]] — 重复注解/类型注解的底层