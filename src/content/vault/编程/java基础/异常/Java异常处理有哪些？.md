---
title: Java 异常处理有哪些？
tags:
  - Java
  - 异常
  - 异常处理
  - try-catch
created: 2026-08-22
updated: 2026-08-22
---

# Java 异常处理有哪些？

> Java 异常处理的核心手段有四类：**try-catch**（捕获并处理）、**throw**（手动抛出）、**throws**（方法声明移交）、**finally**（无论是否异常都执行的收尾）。常与 [[wiki/编程/java基础/异常/介绍一下Java异常]] 配合理解"什么异常、如何处理"。

## 一、try-catch 语句块

用于**捕获并处理可能抛出的异常**。`try` 块包含可能抛异常的代码，`catch` 块处理特定类型异常（可多个），`finally` 可选地定义无条件执行的代码。

```java
try {
    // 可能抛出异常的代码
} catch (ExceptionType1 e1) {
    // 处理异常类型1的逻辑
} catch (ExceptionType2 e2) {
    // 处理异常类型2的逻辑
} catch (ExceptionType3 e3) {
    // 处理异常类型3的逻辑
} finally {
    // 可选的finally块，用于定义无论是否发生异常都会执行的代码
}
```

> 多个 `catch` 需注意顺序：子类异常在前、父类在后，否则父类会提前捕获导致子类分支失效（编译报错）。

## 二、throw 语句

用于**手动抛出异常**，可根据需要在代码中主动抛出特定类型异常。

```java
throw new ExceptionType("Exception message");
```

## 三、throws 关键字

用于在方法声明中声明"可能抛出的异常类型"。若方法可能抛出异常但不想在内部处理，可用 `throws` 将异常**传递给调用者**处理。

```java
public void methodName() throws ExceptionType {
    // 方法体
}
```

## 四、finally 块

用于定义**无论是否发生异常都会执行的代码块**，通常用于释放资源、确保资源正确关闭。

```java
try {
    // 可能抛出异常的代码
} catch (ExceptionType e) {
    // 处理异常的逻辑
} finally {
    // 无论是否发生异常，都会执行的代码
}
```

> ⚠️ `finally` 会在 `try` 的 `return` 之前执行；若 `finally` 中也含 `return`，会**覆盖** `try`/`catch` 中的返回值（易踩坑，应避免在 `finally` 里写 `return`）。

## 五、区别速记

| 手段 | 位置 | 作用 |
| :--- | :--- | :--- |
| `try-catch` | 方法体内 | 就地捕获处理 |
| `throw` | 方法体内 | 主动抛出异常 |
| `throws` | 方法签名上 | 声明并上抛给调用者 |
| `finally` | try 结构内 | 无条件收尾（资源清理） |

## 六、相关页面

- [[wiki/编程/java基础/异常/介绍一下Java异常]] — 异常体系与受检/非受检分类