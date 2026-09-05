---
title: try catch 中的语句运行情况
tags:
  - Java
  - 异常
  - try-catch
  - finally
created: 2026-08-22
updated: 2026-08-22
---

# try catch 中的语句运行情况

> `try` 块代码按顺序执行；抛出异常则在 `catch` 匹配处理，之后继续 `catch` 之后的代码；若无匹配 `catch` 则异常上抛给上层。`finally` 中的 `return` 会覆盖 `try` 中的 `return`。

## 一、try 块的基本执行流程

`try` 块中的代码将按顺序执行：

1. 抛出异常 → 在 `catch` 块中进行匹配和处理 → 程序继续执行 `catch` 块之后的代码
2. 没有匹配的 `catch` 块 → 异常被传递给上一层调用的方法

## 二、经典题：finally 中的 return 覆盖

```java
try { return "a"; } finally { return "b"; }
```

**这条语句返回啥？**

`finally` 块中的 `return` 语句会**覆盖** `try` 块中的 `return`，因此该语句返回 `"b"`。

> ⚠️ 原理：`finally` 在 `try` 的 `return` 之前执行；当 `finally` 里也含 `return` 时，会取代 `try`/`catch` 中待返回的值。因此**应避免在 `finally` 中写 `return`**，这是隐藏致命 bug 的常见来源。

## 三、扩展：常见的组合考点

- **`try { return a; } finally {}`（finally 无 return）**：返回 `"a"`，`finally` 只是执行清理。
- **`try { } catch { } finally { }` 全都有**：正常流程按 try → catch(如有异常) → finally 执行。
- **`return a` + `finally` 修改局部变量**：若返回的是基本类型，`finally` 中的修改不生效（返回的是已保存的副本）；若返回的是引用类型，修改可能可见。

## 四、相关页面

- [[wiki/编程/java基础/异常/Java异常处理有哪些？]] — try-catch / throw / throws / finally 四种手段
- [[wiki/编程/java基础/异常/介绍一下Java异常]] — 异常体系