---
title: Java 中的线程安全的集合是什么？
tags:
  - Java
  - 集合
  - 并发
  - 线程安全
  - ConcurrentHashMap
  - CopyOnWriteArrayList
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# Java 中的线程安全的集合是什么？

> 答题主线：**分两个阵营**——`java.util` 的老派同步集合（`Vector`、`Hashtable`，靠方法加 `synchronized` 整体锁，性能差已少用）；`java.util.concurrent` 的新派并发集合（`ConcurrentHashMap`、`CopyOnWrite`、`BlockingQueue` 等，用更细粒度锁/CAS/无锁，性能与安全兼顾，是正解）。

## 一、四步回答骨架

1. **定调**：线程安全集合分两个阵营——老的 `java.util` 同步容器 vs 新的 `java.util.concurrent` 并发容器。
2. **画老派**：`Vector`（同步动态数组）、`Hashtable`（同步哈希表）——方法加 `synchronized`，锁整个对象，简单但性能差，**除兼容外已不推荐**。
3. **讲新派（重点）**：按类型给出并发版——Map（`ConcurrentHashMap`）、List（`CopyOnWriteArrayList`）、Set（`ConcurrentSkipListSet`/`CopyOnWriteArraySet`）、Queue（`ConcurrentLinkedQueue`/`BlockingQueue`）、Deque。
4. **收尾给选型**：默认 `ConcurrentHashMap`；`CopyOnWrite` 适合**读多写少**；要阻塞协作选 `BlockingQueue`；each 各有适用场景而非万能。

## 二、核心要点

### 1. 老派：`java.util` 的同步容器（靠整体加锁）

- **Vector**：线程安全的动态数组，内部方法基本都 `synchronized` 修饰；内部用对象数组保存，满时创建新数组并拷贝原数据。
  - **缺点**：同步有额外开销，**不需要线程安全时不建议选**。
- **Hashtable**：线程安全的哈希表，加锁方式是给**每个方法加 `synchronized`，锁住整个 Table 对象**，不支持 null 键值；因同步开销大已少用，需要线程安全哈希表用 `ConcurrentHashMap`。

> 共性：**锁粒度最粗（整对象）**，并发效率低——这就是它们被新派替代的原因。

### 2. 新派：`java.util.concurrent` 的并发集合（细粒度锁 / CAS / 无锁）

**并发 Map：**
- **ConcurrentHashMap**：与 Hashtable 主要区别在**加锁粒度**。
  - **JDK 1.7**：加**分段锁（Segment）**，每个 Segment 管 table 一部分，不同分段并发操作互不影响。
  - **JDK 1.8**：取消 Segment，直接在 **table 元素（桶的头节点）上加锁**，粒度缩小到单桶。put 时：若槽位为 null 用 **CAS** 写入；否则对头节点 `synchronized` 加锁遍历桶做替换/新增；链表超阈值转红黑树提高查找效率。
- **ConcurrentSkipListMap**：基于**跳表（SkipList）** 的可排序并发集合，可在对数预期时间完成增删查。

**并发 Set：**
- **ConcurrentSkipListSet**：线程安全**有序**集合，底层用 ConcurrentSkipListMap 实现。
- **CopyOnWriteArraySet**：线程安全**无序**集合（可当线程安全 HashSet）。有意思的是它和 HashSet 都继承 `AbstractSet`，但 HashSet 靠散列表、它靠**动态数组（CopyOnWriteArrayList）**实现，并非散列表。

**并发 List：**
- **CopyOnWriteArrayList**：ArrayList 的线程安全变体，**所有写操作（add/set）都对底层数组做全新复制**，允许存 null。写时用 `Lock` 同步、复制新数组添加后替换旧数组；**读操作不加锁直接返回**。适合**读多写少**。

**并发 Queue：**
- **ConcurrentLinkedQueue**：高并发场景队列，**无锁（CAS）**实现高性能；性能通常好于 BlockingQueue。
- **BlockingQueue**：功能不在高并发性能，而在**简化多线程数据共享**。提供**读写阻塞等待**机制：消费快空了则读阻塞、生产快满了则写阻塞。

**并发 Deque：**
- **LinkedBlockingDeque**：链表双端队列，**没有读写锁分离**，同一时间只能一个线程操作。
- **ConcurrentLinkedDeque**：基于链接节点的无限并发链表，可安全并发插删访问，多线程共享时合适。

## 三、如何应用 / 面试怎么讲

**加分表达：**
- 一定要**先分老派/新派两阵营**，别一上来报菜名——这是"理解"与"背诵"的分水岭。
- 讲 ConcurrentHashMap 强调 **1.7 Segment → 1.8 锁桶（volatile+CAS+synchronized）**的粒度演进，是"懂"的标志。
- 讲 CopyOnWrite 点出**读多写少**的适用前提（写要复制数组，代价高）；讲 BlockingQueue 点出它是为**数据共享/生产者-消费者**设计的，而非追求高并发。

**一句口决**：要线程安全 Map 认 **ConcurrentHashMap**；List 认 **CopyOnWriteArrayList**（读多写少）；队列分 **CAS 无锁高性能（ConcurrentLinkedQueue）** 与 **阻塞协作（BlockingQueue）**。

## 四、可能被追问的点与预案

| 追问 | 应答案点 |
| :--- | :--- |
| 为什么不用 Hashtable/Vector？ | 整体加锁性能差；已被 ConcurrentHashMap / CopyOnWriteArrayList 等细粒度或高级机制替代 |
| ConcurrentHashMap 1.7 和 1.8 怎么保证线程安全？ | 1.7 Segment 分段锁；1.8 取消 Segment，`volatile`+CAS 写空槽、`synchronized` 锁桶头节点，锁粒度更细 |
| CAS 是什么？ | 无锁比较交换（Compare and Swap）：比较预期值若一致才更新，原子操作，避免加锁开销 |
| CopyOnWrite 什么时候用？ | **读多写少**；写操作需复制整个数组，代价高，不适合写频繁场景 |
| CopyOnWriteArrayList 读需要锁吗？ | 不需要，读直接返回，无修改竞争；只有写要 Lock 再复制（这也是一种读写分离） |
| BlockingQueue 和 ConcurrentLinkedQueue 区别？ | 前者面向**数据共享/阻塞协作**（满则写阻塞、空则读阻塞，生产者-消费者）；后者面向**高并发非阻塞**，CAS 无锁性能更优 |
| ConcurrentSkipListSet 和 ConcurrentSkipListMap 凭什么有序？ | 底层用**跳表**，元素按 key 排序；需要线程安全又要有序时用它 |
| CopyOnWriteArraySet 和 HashSet 底层一样吗？ | 不一样：都继承 `AbstractSet`，但 HashSet 用散列表、CopyOnWriteArraySet 用动态数组（CopyOnWriteArrayList） |
| 线程安全集合就一定快吗？ | 不一定，各有代价：Vector/Hashtable 整体加锁慢；CopyOnWrite 写复制贵；并发安全看场景权衡 |

## 五、相关页面

- [[wiki/编程/java集合/概念/说说java中的集合]] — 常见集合的底层实现与选型（线程安全集合的前提）
- [[wiki/编程/java并发编程/多线程/Java 多线程与 JMM]] — volatile / CAS / synchronized 的并发基础
- [[wiki/编程/java集合/概念/java数组和集合的使用场景]] — 集合整体选择（底层）<!-- 若相关 -->