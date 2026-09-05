---
title: == 与 equals 有什么区别？
tags:
  - Java
  - 面向对象
  - equals
  - ==
  - 字符串常量池
created: 2026-08-22
updated: 2026-08-22
---

# == 与 equals 有什么区别？

> 一句话概括：**`==` 比较"地址"，`equals` 比较"内容"**（前提是类重写了 `equals`）。但这句话若不展开讲容易让人懵，下面详细拆解。

## 一、`==` 运算符

`==` 在 Java 里是非常简单粗暴的比较方式：

- **基本数据类型**（如 `int`、`double`）：直接比较数值是否相等，没问题。
- **对象（引用类型）**：**不比较内容**，而是比较两个变量是否指向内存中的**同一个对象**，即地址是否相同。

**示例**：

```java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);  // 输出 false
```

虽然 `a` 和 `b` 内容都是 `"hello"`，但用了两次 `new`，在堆内存创建了两个完全独立的 `String` 对象，`a`、`b` 指向不同对象，地址不同，`==` 返回 `false`。

## 二、`equals` 方法

`equals` 是 `Object` 类定义的方法，所有 Java 对象都继承它。**它的默认行为其实和 `==` 一样，也是比地址**。

但关键在于，很多常用类（`String`、`Integer` 等）都**重写**了 `equals`，重写后不再比地址，而是比较对象**实际存储的内容**。

**还是刚才的例子**：

```java
String a = new String("hello");
String b = new String("hello");

System.out.println(a.equals(b));  // 输出 true
```

虽然 `a`、`b` 是两个不同对象，但 `String` 重写了 `equals`，会逐个字符比较内容，发现都是 `"hello"`，返回 `true`。

## 三、经典面试陷阱：字符串常量池

```java
String c = "hello";
String d = "hello";

System.out.println(c == d);  // 输出 true
```

为什么这里 `==` 也是 `true`？因为直接用双引号创建字符串时，JVM 把它放进**字符串常量池**。若池子里已有 `"hello"`，`d` 就直接复用 `c` 指向的对象，两者地址相同，`==` 自然返回 `true`。

> 对比：`new String("hello")` 不走常量池复用，每次都在堆新建对象，所以前例 `==` 为 `false`。

## 四、总结

- **`==`**：比较引用地址，适合判断两个变量是否指向同一个对象。
- **`equals`**：比较对象内容，但**前提是类重写了 `equals`**（如 `String`）；若未重写，则和 `==` 效果一样。

**实际开发**：比较两个字符串或对象内容是否相等，**一定要用 `equals`，而不是 `==`**。这也是阿里巴巴开发规范明确要求"判断字符串相等必须用 equals"的原因。

## 五、相关页面

- [[Object类有哪些方法？]] — `equals`/`hashCode` 的底层约定（重写 equals 必须配套重写 hashCode）
- [[wiki/编程/java基础/object/实现深拷贝的三种方法是什么？]] <!-- 若相关 -->