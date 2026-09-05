---
title: list 如何快速删除某个指定下标的元素？
tags:
  - Java
  - 集合
  - List
  - ArrayList
  - LinkedList
  - CopyOnWriteArrayList
  - 删除
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# list 如何快速删除某个指定下标的元素？

> 三种 List 按下标删除的复杂度差异来源于**底层结构**：`ArrayList` 删后向前搬移（末尾 O(1)、中间 O(n)）、`LinkedList` 需遍历到下标再改指针（已知头尾才 O(1)）、`CopyOnWriteArrayList` 写时整数组复制（通常 O(n) 但并发读不受影响）。要"快速删"得先看清底层是数组还是链表。

## 一、这是什么

"快速删除指定下标"没有统一的魔法，关键在于**不同 List 的底层数据结构决定删除代价**。下表把三种 List 的机制与复杂度对清楚。

## 二、核心内容：复杂度对比表

| 实现 | `remove(index)` 机制 | 时间复杂度 |
| :--- | :--- | :--- |
| **ArrayList** | 删后把**后续元素向前移动**补位；**末尾删除 O(1)**，中间删除需搬移 | 末尾 **O(1)** / 中间 **O(n)** |
| **LinkedList** | 先**遍历到该下标**，再改链表指针删除；若已知是**头/尾节点**可直改头尾指针 | 一般 **O(n)** / 已知头尾 **O(1)** |
| **CopyOnWriteArrayList** | 写操作会**复制整个数组**再删，代价受数组复制速度制约 | 通常 **O(n)**（并发下删除不影响读，读并发好） |

### 三种实现的示例

```java
import java.util.ArrayList;
import java.util.List;

List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);
list.add(3);
list.remove(1);          // ArrayList：中间删，O(n)
System.out.println(list);
```

```java
import java.util.LinkedList;
import java.util.List;

List<Integer> list = new LinkedList<>();
list.add(1);
list.add(2);
list.add(3);
list.remove(1);          // LinkedList：先 O(n) 遍历到下标 1 再删
System.out.println(list);
```

```java
import java.util.concurrent.CopyOnWriteArrayList;

CopyOnWriteArrayList<Integer> list = new CopyOnWriteArrayList<>();
list.add(1);
list.add(2);
list.add(3);
list.remove(1);          // 写时复制整数组，O(n)；并发读不受影响
System.out.println(list);
```

> **一句话**：要"快速按下标删"，**ArrayList**（数组随机访问，即使 O(n) 也只是内存搬移，工程上通常仍最实用）；LinkedList 的下标删除反而是 O(n) 遍历，优点是已知头/尾时 O(1)。这提醒我们——"下标删除"别只看集合名，要看底层结构支持。

## 三、如何应用 / 面试怎么讲

**加分表达：**
- 主动讲清"复杂度取决于**底层结构**"而非"集合叫 List"——这是"懂"而非"背"。
- 强调 `ArrayList` 的 O(n) 只是**内存连续搬移**（CPU 缓存友好），实际工程往往仍最快；而 LinkedList 的 O(n) 是**链表逐跳遍历**，加上缓存不友好，通常更慢。
- 若真需要"头/尾高频增删"，LinkedList 的 O(1) 才发挥价值——从而回到"按场景选实现"的决策框架。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| 为什么 ArrayList 删中间是 O(n)？ | 删后要向前搬移后续元素补位 |
| LinkedList 删下标怎么是 O(n)？ | 链表无随机访问，得从头逐跳遍历到目标下标再改指针 |
| 三个里哪个"通常最快"？ | 工程上常是 ArrayList（搬移是连续内存 memcpy），除非极端大量头部增删 |
| CopyOnWrite 删为什么也 O(n)？ | 写时要把整数组 `copyOf` 复制一份 |

## 四、相关页面

- [[wiki/编程/java集合/List/ArrayList的扩容机制说一下]] — ArrayList 底层数组的搬运/扩容
- [[wiki/编程/java集合/概念/集合遍历的方法有哪些？]] — 遍历中删除（Iterator.remove）与按下标删除的配合
- [[wiki/编程/java集合/概念/java数组和集合的使用场景]] — 数组 vs 链表底层选择