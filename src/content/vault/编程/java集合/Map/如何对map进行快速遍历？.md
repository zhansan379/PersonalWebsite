---
title: 如何对 map 进行快速遍历？
tags:
  - Java
  - 集合
  - Map
  - HashMap
  - 遍历
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# 如何对 map 进行快速遍历？

> 答题主线：Map 遍历有**五种方式**，核心在**是否需要同时拿 key + value**——需要键值时优先 `entrySet()`（一次拿到 Entry，最常用、性能好）；只要 key 用 `keySet()`；要删元素用 `Iterator`；旧新函数式用 `forEach`/`Stream`。**应对"快速+"的理解：优先 `forEach`（Java 8）/ `entrySet`**。

## 一、四步回答骨架

1. **定调**：Map 不实现 `Iterable`（不像 List/Set），所以遍历要么转 `entrySet`/`keySet`，要么用 `forEach`。
2. **按"要不要键值"给主次**：需键值→`entrySet`；只要 key→`keySet`；函数式→`forEach`/`Stream`；边遍历边删→`Iterator`。
3. **点性能关键**：`entrySet` 一次拿 `Entry` 优于 `keySet`+`get`（避免二次查表）。
4. **收尾**：Java 8 起推荐 `forEach((k,v)->...)`，最简洁高效。

## 二、核心要点：五种遍历方式

### 1. for-each + `entrySet()`（最常用，需键值）

一次拿到 `Map.Entry`，同时取 key、value，性能最佳：

```java
Map<String, Integer> map = new HashMap<>();
map.put("key1", 1);
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
}
```

### 2. for-each + `keySet()`（只要 key）

若只需 key，或想用 `map.get(key)` 取值；比 entrySet 多一次查表：

```java
for (String key : map.keySet()) {
    System.out.println("Key: " + key + ", Value: " + map.get(key));
}
```

### 3. 迭代器（边遍历边删）

需要删除元素时用 `entrySet().iterator()`（可用 `it.remove()` 安全删）：

```java
Iterator<Map.Entry<String, Integer>> iterator = map.entrySet().iterator();
while (iterator.hasNext()) {
    Map.Entry<String, Integer> entry = iterator.next();
    System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
}
```

### 4. Lambda + `forEach()`（Java 8，最简洁）

直接 `(key, value)` 两个参数，官方推荐的现代写法：

```java
map.forEach((key, value) -> System.out.println("Key: " + key + ", Value: " + value));
```

### 5. Stream API（Java 8，可链式操作）

可过滤/映射/聚合，是遍历之外还能做操作的升级版：

```java
map.entrySet().stream()
   .forEach(entry -> System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue()));

// 还能过滤、映射、toMap
Map<String, Integer> filtered = map.entrySet().stream()
        .filter(entry -> entry.getValue() > 1)
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
```

## 三、如何应用 / 面试怎么讲

**加分表达：**
- 主动说"**同时要键值和删除用 `entrySet`/迭代器**，因为一次拿 Entry 不用二次 `get`"——体现性能意识。
- 区分 `forEach`（Map 自带默认方法，直接两参）与 `Stream.forEach`（能链式 filter/map/collect），与集合遍历里的区分一致。
- 提删除场景记得挂上 `Iterator.remove()` 安全删（对应 `ConcurrentModificationException`）。

**一句口决**：**键值都要用 entrySet，只要 key 用 keySet，Java 8 推荐 forEach，要删用 Iterator，要筛选聚合用 Stream**。

## 四、可能被追问的点与预案

| 追问 | 应答案点 |
| :--- | :--- |
| 为什么遍历优先 entrySet 而非 keySet？ | entrySet 一次拿 Entry 同时取 k/v；keySet 遍历后再 `get` 是一次**二次哈希查表**，多开销（尤其 HashMap） |
| Map 能用 for-each 直接遍历吗？ | 不能直接 `for(entry : map)`，Map 自身不 implements Iterable；要 `map.entrySet()` 才 usable |
| 遍历中删除元素用哪种？ | 用 `entrySet().iterator()` + `it.remove()`；for-each 内 `remove` 抛 CME |
| forEach 和 Stream 遍历区别？ | `map.forEach` 是 Map 自带的默认方法（两参简洁）；`map.entrySet().stream()` 能链式 filter/map/collect/并行 |
| 遍历键值顺序如何？ | 取决于实现：HashMap 无序；LinkedHashMap 保插入序；TreeMap 按 key 有序 |
| 五者性能差异？ | 对 HashMap：entrySet≈forEach（都一次遍历）；keySet+get 最慢（多一次查表）；Stream 与 forEach 相当，二叉多一层流包装 |

## 五、相关页面

- [[wiki/编程/java集合/概念/说说java中的集合]] — Map 各类实现（HashMap/LinkedHashMap/TreeMap）与遍历顺序
- [[wiki/编程/java集合/概念/集合遍历的方法有哪些？]] — 集合遍历通用知识（与 Map 遍历呼应）
- [[wiki/编程/java基础/object/Object类有哪些方法？]] — `equals`/`hashCode` 是 Map key 定位的基石 <!-- 若相关 -->