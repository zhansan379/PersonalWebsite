---
title: 线程安全的 List， CopyonWriteArraylist 是如何实现线程安全的
tags:
  - Java
  - 集合
  - CopyOnWriteArrayList
  - 线程安全
  - 写时复制
  - ReentrantLock
  - volatile
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# 线程安全的 List， CopyOnWriteArrayList 是如何实现线程安全的

> `CopyOnWriteArrayList` 靠**写时复制**：底层 `volatile Object[] array` 保证引用可见，写操作加 `ReentrantLock` 把旧数组复制一份再改、替换引用，读操作**不加锁**直接读——读线程永远读到"有效数据"，实现读多写少下的高效线程安全。

## 一、这是什么

"CopyOnWrite"= **写时复制**。每次写都基于旧数据复制一份新数组，改完用新数组替换旧数组；读操作始终不加锁。核心目标：**读多写少场景下，让读不被写阻塞**。

## 二、核心内容：三块机制

### 1. 底层数组用 `volatile` 保证可见性

```java
private transient volatile Object[] array;
```

`volatile` 保证当前线程对数组引用重新赋值（`setArray`）后，**其他线程能及时感知到新引用**。

### 2. 写操作：加锁 + 复制 + 替换

```java
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();        // 取当前数组
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);  // 复制一份且长度+1
        newElements[len] = e;                  // 新元素放最后
        setArray(newElements);                 // 替换引用指向新数组
        return true;
    } finally {
        lock.unlock();
    }
}
```

**写流程**：取旧数组 → `Arrays.copyOf` 复制并扩一 → 新元素放末尾 → `setArray` 替换引用。**复制 + 新增（改）都在新副本上完成。**

### 3. 读操作：不加锁，一直可读

```java
public E get(int index) {
    return get(getArray(), index);
}
```

读只用 `getArray()` 拿引用，**不加锁**。

## 三、如何应用 / 面试怎么讲

**关键洞察（为什么这样快）：**

- 在**替换地址之前**读的是老数组（有效数据）；**替换之后**读的是新数组（也是有效数据）——读永远拿得到有效数据。
- 因此**读写无需都加锁**，比"读写都加锁"更高效，是读写分离的典型实现。

**回答骨架**：定调"写时复制 + 读无锁" → 三个组件（volatile 数组 / ReentrantLock 写锁 / 复制替换）→ 读线程为何不变 → 适用场景与代价。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| volatile 在这里起什么作用？ | 保证数组引用替换后其他线程可见（可见性） |
| 为什么读不用加锁？ | 读只取引用，无论替换前后都是完整有效数组 |
| 写为什么会慢/代价高？ | 每次写都 `copyOf` 整数组，元素多时开销大，**适合读多写少** |
| 可能读到旧数据吗？ | 可能：一个线程正在写（改的是新副本），另一个线程可能读到的是替换前的旧数组 |
| 为什么加 ReentrantLock 而非 synchronized？ | 可重入且只保护写操作；其实用 synchronized 也可，ReentrantLock 在此保证多写线程互斥 |

## 四、相关页面

- [[wiki/编程/java集合/List/为什么ArrayList不是线程安全的，具体来说是哪里不安全？]] — 对比理解"非原子 add"问题如何被写时复制解决
- [[wiki/编程/java集合/List/ArrayList线程安全吗？把ArrayList变成线程安全有哪些方法？]] — 选择 CopyOnWrite 的理由
- [[wiki/编程/java并发编程/多线程/Java 多线程与 JMM]] — volatile / 锁的并发基础 <!-- 若存在 -->