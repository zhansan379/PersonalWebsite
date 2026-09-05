---
title: 说说 java 中的集合
tags:
  - Java
  - 集合
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# 说说 java 中的集合

> 答题主线：**按"三大接口 + 各自常用实现"分层展开**——`List`（有序可重复，可索引）、`Set`（无序不可重复）、`Map`（键值对，key 唯一），每个都讲清"底层数据结构 + 特点 + 适用场景"。

## 一、四步回答骨架

1. **定调**：Java 集合分三大接口——`List`（有序、可重复、可索引）、`Set`（无序、不可重复）、`Map`（键值对、key 唯一）。注意 `Map` 不在 `Collection` 体系内。
2. **List 场景**：ArrayList（数组实现、随机访问快、中间增删慢）vs LinkedList（双向链表、头尾增删快，但有误区要澄清）。
3. **Set/Map 场景**：HashSet/HashMap（哈希、查重快）、LinkedHashSet/LinkedHashMap（保插入顺序）、TreeSet/TreeMap（有序红黑树）、ConcurrentHashMap（线程安全）。
4. **收尾抛深水区**：引到 HashMap 原理、扩容、树化、线程安全等高频追问。
![[Pasted image 20260823085822.png]]
## 二、核心要点

### 1. List（线性、有序、可重复、可索引）

- **ArrayList**：**容量可变、非线程安全**的列表，底层**数组**实现。扩容时创建更大的数组并把原数组复制过去。**随机访问快**（O(1)），**尾部追加/删除高效**；但**中间位置插入/删除需搬移元素**，代价高。
- **LinkedList**：本质是**双向链表**，支持高效头尾插入/删除，也可作双端队列。

> 基本上无脑用ArrayList就可以了，主要原因有以下几点：
> 数组本来随机访问速度就快，相比于LinkedList唯一的差距就是在插入或删除时，可能需要移动元素位置慢一点，但实际上ArrayList做了优化，底层调用的是C++编写的native方法，除非在1w+头插入这种场景下可能会高一点点，否则其他场景都是ArrayList速度更快


- 其他：`Vector`（线程安全，类似 ArrayList）、`Stack`（栈）。

### 2. Set（不允许重复，无序）

- **HashSet**：通过 **HashMap** 实现，HashMap 的 Key 即存储元素，所有 Key 共用一个 `PRESENT` 常量 Value。用 Key 保证唯一性，但不保证有序；因底层 HashMap 非线程安全，**HashSet 也非线程安全**。
- **LinkedHashSet**：继承自 HashSet，通过 **LinkedHashMap** 实现，用**双向链表维护插入顺序**
- **TreeSet**：通过 **TreeMap** 实现，添加时按比较规则插入**合适位置，保证插入后仍有序**。

> 一般用HashSet就行，性能比较好。如果说需要顺序，要是插入顺序就用LinkedHashSet，要是自定义顺序就用TreeSet

### 3. Map（键值对，key 无序唯一，value 可重复）

`Map` 没有继承 `Collection`。给出 key 就返回对应 value。主要实现：

- **HashMap**：
  - **JDK 1.8 前**：数组 + 链表，链表解决哈希冲突（拉链法）。
  - **JDK 1.8 后**：当某桶**链表长度 ≥ 8 且数组长度 ≥ 64** 才转**红黑树**减少搜索时间；若**数组长度 < 64**，只会触发扩容而不做树化。
- **LinkedHashMap**：继承自 HashMap，底层仍是拉链散列（数组+链表/红黑树），额外增加**双向链表**保持**插入顺序/访问顺序**。
- **Hashtable**：数组 + 链表，线程安全（过时）。
- **TreeMap**：**红黑树**（自平衡排序二叉树），key 有序。
- **ConcurrentHashMap**：Node 数组 + 链表 + 红黑树，**线程安全**（JDK1.8 前 Segment 锁，1.8 后 `volatile` + CAS / `synchronized`）。

> 链表很长代表冲突严重，但如果数组本身就很小，问题根源是桶不够多，先扩容打散元素；只有数组足够大了，链表还能长到 8，说明真散不开了，这时候才转红黑树提速。
> 当红黑树中的节点数量因为 remove 操作减少到 小于等于 6 时，红黑树会重新退化为链表。这也从侧面说明：8 是树化的“安全防线”，6 是退化的“缓冲地带”，两者之间的 7 作为滞后区间，避免了频繁转换。
> 要求线程安全就是使用concurrentHashMap

## 三、如何应用 / 面试怎么讲

**加分表达：**
- 说 HashMap 一定要讲**版本差异**（1.8 前后：链表→红黑树）和**精确条件**（≥8 且数组≥64，否则只扩容不树化）——这两句是"背过"和"懂"的分水岭。
- 说 LinkedList 要**主动澄清误区**（有引用的 O(1) vs 任意位置的 O(n)），比只报"双向链表"高一个档次。
- 提 ConcurrentHashMap 顺带一句 **1.8 锁粒度变化**（Segment → volatile+CAS/synchronized）。

**一句收口**：List 认数组（ArrayList）为默认，Set/Map 认哈希（HashSet/HashMap）为默认；要顺序用 Linked/Tree，要线程安全用 ConcurrentHashMap。

## 四、可能被追问的点与预案

| 追问 | 应答案点 |
| :--- | :--- |
| ArrayList 和 LinkedList 到底选谁？ | 默认 **ArrayList**；LinkedList 的 O(1) 前提是持有节点引用，任意位置插删先 O(n) 找 + 缓存不友好，多数场景更慢 |
| HashMap 什么时候转红黑树？ | 链表**≥8 且数组≥64** 转红黑树；若数组<span——**<64** 时只**扩容**不做树化 |
| HashMap 为什么是线程不安全的？ | 多线程并发 put 可能数据错乱/死循环(1.8 前)；要安全用 ConcurrentHashMap 或加锁 |
| ConcurrentHashMap 1.8 怎么保证安全？ | 1.8 前是 **Segment 分段锁**；1.8 改成 **`volatile` + CAS + `synchronized`**（锁单个桶/Node），粒度更细 |
| Hashtable 和 HashMap 区别？ | Hashtable 线程安全（方法 synced）但性能差、不允许 null key/value、老旧；HashMap 相反 |
| HashSet 底层怎么去重的？ | 通过 HashMap 的 Key 唯一性；对象需正确重写 `equals`/`hashCode` |
| 什么场景用 TreeMap/TreeSet？ | 需要 key 有序（按自然顺序或自定义比较器）时；底层红黑树、自平衡 |
| Map 和 Collection 的关系？ | **Map 不继承 `Collection`**，是独立的键值对体系；`Collection` 才是 List/Set 等单列集合的根 |
| 为什么数组长度<64 不树化？ | 桶太少时哈希冲突普遍，先**扩容**能直接摊薄每个桶的元素数，比重建红黑树更划算、开销更小 |

## 五、相关页面

- [[wiki/编程/java集合/概念/java数组和集合的使用场景]] — 数组 vs 集合的整体选择（底层）
- [[wiki/编程/java基础/object/Object类有哪些方法？]] — `equals`/`hashCode` 是 HashSet/HashMap 去重与查找的基石 <!-- 若存在 -->
- [[wiki/编程/java并发编程/多线程/Java 多线程与 JMM]] — ConcurrentHashMap 线程安全涉及的并发基础 <!-- 若存在 -->