---
title: String、StringBuffer、StringBuilder 的区别和联系
tags:
  - Java
  - String
  - StringBuffer
  - StringBuilder
  - 不可变性
  - 线程安全
created: 2026-08-22
updated: 2026-08-22
---

# String、StringBuffer、StringBuilder 的区别和联系

> 三者都是字符串相关类，核心差异在**可变性**和**线程安全**：`String` 不可变天然线程安全但性能差；`StringBuilder` 可变非线程安全但单线程性能最高；`StringBuffer` 可变且线程安全，介于两者之间。

## 一、四大维度对比

### 1. 可变性（Immutable）

- **`String`**：**不可变**（Immutable）。一旦创建，内容无法修改，每次修改都会生成一个新的对象。
- **`StringBuilder`** / **`StringBuffer`**：**可变**（Mutable），可直接修改字符串内容而不会创建新对象。

### 2. 线程安全性

- **`String`**：因不可变，天然线程安全。
- **`StringBuilder`**：**不是线程安全**，适用于单线程环境。
- **`StringBuffer`**：**线程安全**，方法通过 `synchronized` 关键字实现同步，适用于多线程环境。

### 3. 性能

- **`String` 最低**：频繁修改时会生成大量临时对象，增加内存开销和 GC 压力。
- **`StringBuilder` 最高**：没有线程安全的开销，适合单线程下的字符串操作。
- **`StringBuffer` 略低**：线程安全机制引入了同步开销。

### 4. 使用场景

- **`String`**：字符串内容固定或不常变化。
- **`StringBuilder`**：频繁修改字符串且在单线程环境。
- **`StringBuffer`**：频繁修改字符串且在多线程环境。

## 二、对比总结表

| 特性       | String   | StringBuilder | StringBuffer |
| :------- | :------- | :------------ | :----------- |
| **不可变性** | 不可变      | 可变            | 可变           |
| **线程安全** | 是（因不可变）  | 否             | 是（同步方法）      |
| **性能**   | 低（频繁修改时） | 高（单线程）        | 中（多线程安全）     |
| **适用场景** | 静态字符串    | 单线程动态字符串      | 多线程动态字符串     |

## 三、示例代码

```java
// String 的不可变性
String str = "abc";
str = str + "def"; // 新建对象，str 指向新对象

// StringBuilder（单线程高效）
StringBuilder sb = new StringBuilder();
sb.append("abc").append("def"); // 直接修改内部数组

// StringBuffer（多线程安全）
StringBuffer sbf = new StringBuffer();
sbf.append("abc").append("def"); // 同步方法保证线程安全
```

## 四、如何选择

- 内容固定或不常变化 → **`String`**
- 频繁修改 + 单线程 → **`StringBuilder`**
- 频繁修改 + 多线程 → **`StringBuffer`**

> 实际开发的大多数场景（如拼接日志、动态 SQL）都在单线程中进行，**优先用 `StringBuilder`**；`StringBuffer` 因同步开销较慢，仅当确有多线程共享可变字符串时才用。

## 五、相关页面

- [[== 与 equals 有什么区别？]] — String 常量池与 equals 内容比较（来源相关）
- [[四大函数式接口]] <!-- 若相关 -->