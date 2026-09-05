---
title: Stream reduce
tags:
  - Java
  - Java 8
  - Stream
  - reduce
  - 函数式编程
created: 2026-08-22
updated: 2026-08-22
---

# Stream reduce

> `reduce()` 是 Stream 的**聚合方法**：把一个 Stream 的所有元素按照聚合函数聚合成一个结果。它接收 `BinaryOperator` 接口。**聚合操作会立刻触发计算**（与惰性的转换操作相反）。

## 一、基本用法：累加求和

```java
int sum = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
        .reduce(0, (acc, n) -> acc + n);
System.out.println(sum); // 45
```

## 二、原理：`acc` 累积器

`reduce()` 接收 `BinaryOperator` 接口，负责把上次累加的结果和本次元素进行运算：

```java
@FunctionalInterface
public interface BinaryOperator<T> {
    // Bi操作：两个输入，一个输出
    T apply(T t, T u);
}
```

其本质等同 for 循环的累积：先初始化为指定值（这里是 0），再对每个元素依次调用 `(acc, n) -> acc + n`：

```
acc = 0                  // 初始化为指定值
acc = 0 + 1 = 1          // n = 1
acc = 1 + 2 = 3          // n = 2
...
acc = 36 + 9 = 45        // n = 9
```

所以这个 `reduce()` 操作就是一个求和。

## 三、去掉初始值 → 返回 Optional

不带初始值会返回 `Optional<Integer>`，因为 Stream 的元素可能为 0 个，无法调用聚合函数：

```java
Optional<Integer> opt = stream.reduce((acc, n) -> acc + n);
if (opt.isPresent()) {
    System.out.println(opt.get());
}
```

## 四、灵活运用：求积、聚合对象

**求积**（初始值必须为 1）：

```java
int s = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9).reduce(1, (acc, n) -> acc * n); // 362880
```

**聚合为 Map**（把 `k=v` 配置行聚合成一个 `Map`）：

```java
List<String> props = List.of("profile=native", "debug=true", "logging=warn", "interval=500");
Map<String, String> map = props.stream()
        .map(kv -> {
            String[] ss = kv.split("\\=", 2);
            return Map.of(ss[0], ss[1]);
        })
        .reduce(new HashMap<String, String>(), (m, kv) -> {
            m.putAll(kv);
            return m;
        });
```

> 说明：将对象的聚合也归到 `map()` + `reduce()` 组合，展示了 reduce 不仅处理数值，也能对任意 Java 对象累积。

## 五、小结

- `reduce()` 将一个 Stream 的每个元素依次作用于 `BinaryOperator`，并将结果合并。
- `reduce()` 是**聚合方法**，聚合方法会**立刻对 Stream 进行计算**（这是唯一需要注意的触发点）。

## 六、相关页面

- [[00 Stream 是什么]] — 惰性计算 vs 聚合计算
- [[02 Stream map]] — 与 map 组合实现任意对象的聚合
- [[06 Stream 输出集合]] — 另一种聚合：collect