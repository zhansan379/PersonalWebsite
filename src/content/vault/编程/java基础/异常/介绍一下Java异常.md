---
title: 介绍一下 Java 异常
tags:
  - Java
  - 异常
  - Throwable
  - 异常体系
created: 2026-08-22
updated: 2026-08-22
---

# 介绍一下 Java 异常

> Java 异常体系以 `Throwable` 为根，分为 `Error`（程序无法处理的严重错误）与 `Exception`（程序可处理的异常）。`Exception` 又分为受检异常（编译期强制处理）与非受检异常（`RuntimeException` 及其子类，无需强制捕获）。

## 一、异常体系总览

![[img/Pasted image 20260822165143.png]]

Java 的异常体系基于 `Throwable` 及其子类。`Throwable` 有两个重要子类：**`Error`** 和 **`Exception`**。

## 二、Error（错误）

表示**运行环境的错误**，是程序无法处理的严重问题，如虚拟机错误、动态链接库失效等。**程序不应该尝试捕获这类错误**。

常见示例：`OutOfMemoryError`、`StackOverflowError`。

## 三、Exception（异常）

表示**程序本身可以处理的异常情况**，分为两大类：

### 1. 非运行时异常（受检异常，Checked Exception）

- 编译时**必须被捕获或声明抛出**
- 通常是外部错误，如文件不存在（`FileNotFoundException`）、类未找到（`ClassNotFoundException`）
- **强制程序员处理**可能出现的这些问题，增强程序健壮性

### 2. 运行时异常（非受检异常，Unchecked Exception / RuntimeException）

- 特指 `RuntimeException` 及其子类，与 `Error` 一起构成 Java 的**非受检异常家族**
- 由**程序逻辑错误**导致，如空指针访问（`NullPointerException`）、数组越界（`ArrayIndexOutOfBoundsException`）
- **不需要**在编译时强制捕获或声明

## 四、相关页面

<!-- 该分类下如有其他异常相关笔记，可在此补充链接 -->