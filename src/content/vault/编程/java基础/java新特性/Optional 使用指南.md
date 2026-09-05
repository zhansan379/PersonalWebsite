---
title: Optional 使用指南
tags:
  - Java
  - Java 8
  - Optional
  - 空指针
  - 新特性
created: 2026-08-22
updated: 2026-08-22
---

# Optional 使用指南

> `Optional` 是 Java 8 引入的容器类，通过显式声明"值可能不存在"，从根本上替代裸 `null` 的隐式传递，配合 `orElse` / `ifPresent` / `map` 等 API 优雅地消灭 `NullPointerException`，提升代码的健壮性与可读性。

## 一、这是什么

- **容器类**：`Optional<T>` 用于存储一个可能为 `null` 的值。
  - 值存在 → `Optional` 包含该值
  - 值不存在 → `Optional` 为空（`empty`）

**核心思想**：把"这个值可能为空"从务工中的隐式契约，变成类型上显式可见的信号，迫使调用方在处理前考虑为空的情况。

## 二、核心内容

### 1. 为什么需要 Optional

| 价值 | 说明 |
| :--- | :--- |
| **避免 NPE** | 明确表示值可能为空，强迫先处理为空场景 |
| **提升可读性** | 返回 `Optional` 比返回 `null` 更能传递"可选"语义 |
| **提高健壮性** | `orElse` / `ifPresent` / `map` 优雅替代大量 `if-else` 嵌套 |

### 2. 创建 Optional

| 方法 | 行为 |
| :--- | :--- |
| `Optional.of(value)` | 传非空值；**传 `null` 抛 NPE** |
| `Optional.ofNullable(value)` | 允许 `null`，为 `null` 时返回空 Optional |
| `Optional.empty()` | 创建空 Optional |

```java
Optional<String> a = Optional.of("Hello");          // 非空
Optional<String> b = Optional.ofNullable(null);      // 空 Optional
Optional<String> c = Optional.empty();               // 空 Optional
```

### 3. 检查值是否存在

- `isPresent()`：是否包含值
- `isEmpty()`（**Java 11 引入**）：是否为空

```java
if (optional.isPresent()) { System.out.println(optional.get()); }
if (optional.isEmpty())   { System.out.println("No value"); }
```

### 4. 获取值

| 方法 | 行为 |
| :--- | :--- |
| `get()` | 取唯一值，**为空抛 `NoSuchElementException`，应避免直接使用** |
| `orElse(default)` | 为空返回默认值（可能先构建默认对象） |
| `orElseGet(Supplier)` | 为空时**惰性**通过 `Supplier` 生成默认值 |
| `orElseThrow(() -> ex)` | 为空抛指定异常 |

```java
String v1 = optional.get();
String v2 = optional.orElse("Default");
String v3 = optional.orElseGet(() -> buildDefault());   // 惰性
String v4 = optional.orElseThrow(() -> new IllegalArgumentException("missing"));
```

### 5. 处理值（函数式）

| 方法 | 行为 |
| :--- | :--- |
| `ifPresent(Consumer)` | 值存在才执行操作 |
| `ifPresentOrElse(Consumer, Runnable)`（**Java 9+**） | 值存在 / 不存在分别执行 |
| `map(fn)` | 值存在时转换，返回新的 Optional |
| `flatMap(fn)` | 同 `map`，但 `fn` 返回的必须是 `Optional` |
| `filter(pred)` | 值满足条件保留，否则返回空 Optional |

```java
optional.ifPresent(v -> System.out.println("Value: " + v));
Optional<Integer> len = optional.map(String::length);
Optional<String> up = optional.flatMap(v -> Optional.of(v.toUpperCase()));
Optional<String> f = optional.filter(v -> v.startsWith("H"));
```

## 三、如何应用

### 1. 方法返回值（核心场景）

把可能返回 `null` 的方法改为返回 `Optional`，明确"可选"契约：

```java
public Optional<User> findUserById(Long id) {
    return userRepository.findById(id);   // 返回 Optional<User>
}
```

### 2. 替代传统 null 检查

```java
// 传统：手写 if 判空
String v = getValue();
System.out.println(v != null ? v.toUpperCase() : "Default");

// Optional：语义化一行
Optional<String> opt = getOptionalValue();
System.out.println(opt.orElse("Default").toUpperCase());
```

### 3. 减少嵌套空判断

```java
// 传统：层层嵌套判空
if (user != null && user.getAddress() != null) {
    System.out.println(user.getAddress().getCity());
}

// Optional：链式 map 扁平展开
Optional.ofNullable(user)
        .map(User::getAddress)
        .map(Address::getCity)
        .ifPresent(System.out::println);
```

### 最佳实践速记

1. ✅ **返回值用 Optional**：明确告诉调用方可能没有结果（`Optional<User> findById`）
2. ❌ **不用作字段**：容器类，不适合序列化/持久化（JPA 实体、DTO 字段勿用）
3. ❌ **避免 `get()`**：优先 `orElse` / `ifPresent` 等安全方法
4. ⚠️ **不过度使用**：简单判空不必引入；仅在"值确实可能不存在"时使用

## 四、相关页面

- [[wiki/编程/java基础/java新特性/Java 8 你知道有什么新特性？]] — Optional 是 Java 8 核心新特性之一
- [[wiki/编程/java基础/java新特性/Lambda 表达式基础]] — map/filter/ifPresent 的 lambda 基础
- [[wiki/编程/java基础/object/String、StringBuffer、StringBuilder的区别和联系.md]] — 不可变对象与空安全（来源相关）