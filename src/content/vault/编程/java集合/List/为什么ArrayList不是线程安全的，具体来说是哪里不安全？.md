---
title: 为什么 ArrayList 不是线程安全的，具体来说是哪里不安全？
tags:
  - Java
  - 集合
  - ArrayList
  - 线程安全
  - 并发
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# 为什么 ArrayList 不是线程安全的，具体来说是哪里不安全？

> 高并发 `add` 下 ArrayList 会暴露**三大问题**：部分值为 `null`、数组越界异常、`size` 与实际添加数量不符——根源在底层 `add` 的 `size++` 与元素写入**不是原子操作**，多线程竞争同一数组下标导致。

## 一、这是什么

`ArrayList.add` 底层是非原子的三步操作，多线程并发调用时互相干扰，就会产生数据错乱。具体不安全就藏在 `add` 的方法体里。

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);   // ① 判断是否需要扩容（必要时 grow）
    elementData[size++] = e;            // ② 在 size 位置写值 ③ size+1（非原子！）
    return true;
}
```

其中 `ensureCapacityInternal` 只负责"`size+1` 若超数组长度就扩容"，之后分三步：判断扩容、`size` 位置写值、`size` 自增。

## 二、核心内容：三大不安全的具体场景

### 1. 部分值为 null

两个线程并发，都判断"不用扩容" → 线程1 先给下标 9 写值、还没 `size++` → 线程2 又给下标 9 写了一次 → 两次 `size++` 后跳位，下标 10 就空了（`null`）。

### 2. 索引越界异常

两个线程都判断"不用扩容"（数组容量正好）→ 线程1 写值并 `size++` → 线程2 再进来 `size` 已是 10，而数组容量只有 10，写下标 10 就越界（下标从 0 起）。

### 3. size 与 add 数量不符（基本必现）

`size++` 本身非原子，可分"取值 → 加1 → 覆盖"三步。线程1、线程2 拿到同一个 size 各自 `+1` 再覆盖，就丢一次，导致 `size` 永远小于实际 `add` 次数。

## 三、如何应用 / 面试怎么讲

**回答骨架**：定调"非原子 add 三步" → 挨个讲 null / 越界 / size 不符三种并发竞态 → 归因 `size++` 非原子 → 引出线程安全方案（CopyOnWriteArrayList / synchronizedList）。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| 为什么会出现 null？ | 两线程并发写同一下标，先到先占、后到覆盖，空出下一格 |
| 为什么会越界？ | 并发时 size 与数组容量竞态，一个线程看到旧 size 写入，另一线程已使 size 达到容量上限 |
| size 为什么不准确？ | `size++` 是读-改-写三小步，非原子，并发会覆盖丢失 +1 |
| 根本原因是什么？ | 数组下标写值与 `size` 自增**非原子**，ArrayList 无同步保护 |

## 四、相关页面

- [[wiki/编程/java集合/List/ArrayList线程安全吗？把ArrayList变成线程安全有哪些方法？]] — 解决它的三种方案
- [[wiki/编程/java集合/List/线程安全的 List， CopyonWriteArraylist是如何实现线程安全的]] — 写时复制的正确做法
- [[wiki/编程/java集合/List/ArrayList的扩容机制说一下]] — ensureCapacityInternal/grow 的扩容动作