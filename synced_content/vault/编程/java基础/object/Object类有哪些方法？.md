---
title: Object 类有哪些方法？
tags:
  - Java
  - Object
  - 面向对象
  - equals
  - hashCode
created: 2026-08-22
updated: 2026-08-22
---

# Object 类有哪些方法？

> Java `Object` 类是所有类的超类，默认提供 **11 个核心方法**，用于对象比较、哈希、字符串表示、线程同步与垃圾回收等。最常用的是 `equals`/`hashCode`/`toString` 三件套，多线程相关有 `wait`/`notify`/`notifyAll`。

## 一、概述

`Object` 是所有类的超类，提供 11 个核心方法，覆盖：

- **对象比较**：`equals`、`hashCode`
- **字符串表示**：`toString`
- **类型信息**：`getClass`
- **对象复制**：`clone`、`finalize`
- **线程同步**：`wait` ×3、`notify`、`notifyAll`

## 二、对象比较与字符串

### 1. `equals` — 内容比较

默认实现是**比较两个对象的内存地址**（与 `==` 效果相同）。实际开发中常需按**内容**比较，比如两个用户对象只要 `id` 相同就认为相等，此时需重写 `equals`：

```java
class User {
    private int id;
    private String name;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        User user = (User) obj;
        return id == user.id;
    }
}
```

### 2. `hashCode` — 哈希值（必须与 equals 配套）

重写 `equals` 时必须配套重写 `hashCode`，并遵循两条规定：

- **一致性（implies）**：若 `obj1.equals(obj2)` 返回 `true`，则 `obj1.hashCode()` **必须等于** `obj2.hashCode()`。
- **非一致性（does not imply）**：若 `obj1.hashCode() == obj2.hashCode()`，则 `obj1.equals(obj2)` **不一定为 true**。这种情况称为**哈希冲突**（允许发生）。

等价地表述：**若 `hashCode` 不相等，则 `equals` 一定返回 `false`。**

hashCode() 的核心作用就是为支持**哈希表**（如 HashMap、HashSet、Hashtable）提供快速查找的"索引"依据。你可以把它理解为对象在哈希结构中的"分区编号"。

> ⚠️ 只重写 `equals` 不重写 `hashCode`，会导致对象在 `HashMap`、`HashSet` 等集合中无法正确存储与查找。例如两个 `id` 相同的 `User` 对象 `equals` 为 true 但 `hashCode` 不同，会被当成两个不同元素存入集合。
> 如果未重写equal：两个不同Key也许会产生相同的hashCode()和equals()输出，HashMap将会认为它们是相同的，然后覆盖它们，而非把它们存储到不同的地方。？？
> 未重写hashcode：导致在hashmap等类中存储多个一模一样的对象


```java
@Override
public int hashCode() {
    return Integer.hashCode(id);
}
```

**一句话总结 hashCode 与 equals 的关系**：`hashCode` 与 `equals` 紧密相关 —— 重写 `equals` 时必须重写 `hashCode`，以保证在哈希表等数据结构中对象的相等性判断与存储/查找操作正常；重写 `hashCode` 时需确保**相等的对象具有相同的哈希码**，但**相同哈希码的对象不一定相等**（哈希冲突，详见 [[== 与 equals 有什么区别？]]）。

### 3. `toString` — 字符串表示

默认返回"类名 + `@` + 对象哈希码的十六进制"，如 `User@1b6d3586`，可读性差。实际开发中重写它以返回对象具体信息，方便日志打印和调试：

```java
@Override
public String toString() {
    return "User{id=" + id + ", name=" + name + "}";
}
```

## 三、类型、复制与回收

### 4. `getClass` — 运行时实际类型

返回对象**运行时**的实际类对象，可能与编译时类型不同，**不能重写**。常用于反射场景：

```java
Animal animal = new Dog();
Class<?> clazz = animal.getClass();
System.out.println(clazz.getName()); // 输出 Dog
```

> 父类引用指向子类对象时，`getClass()` 返回的是子类 `Dog`（对应于 [[01 继承 封装 多态]] 中的向上转型）。

### 5. `clone` — 浅拷贝

创建对象的**浅拷贝**，默认浅拷贝意味着对象若有引用类型属性，拷贝后与原对象**共享该引用属性**。使用需实现 `Cloneable` 接口，否则抛 `CloneNotSupportedException`：

```java
class Product implements Cloneable {
    private String name;
    private double price;

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

> 深拷贝相关见 [[wiki/编程/java基础/object/实现深拷贝的三种方法是什么？]]。

### 6. `finalize` — 垃圾回收前回调（不推荐）

对象被 GC 回收前会调用，默认空实现。**基本不推荐使用**：执行时机不确定（可能很久才执行甚至不执行）、可能导致对象复活、影响 GC 效率。Java 9 起标记为过时，替代方案是 `try-with-resources` 或 `PhantomReference`。

## 四、线程同步

### 7. `notify` / `notifyAll` — 唤醒等待线程

与 `synchronized` 配合使用，作用是**唤醒等待当前对象锁的线程**：

- `notify`：随机唤醒一个等待线程
- `notifyAll`：唤醒所有等待线程

典型场景是生产者消费者模式，生产者生产完调用 `notifyAll` 唤醒等待的消费者。

### 8. `wait` — 释放锁并等待

让当前持有对象锁的线程**释放锁并进入等待状态**，直到被 `notify`/`notifyAll` 唤醒或等待到期。有三个重载。**必须在 `synchronized` 同步块或方法中使用**，否则抛 `IllegalMonitorStateException`：

```java
synchronized (lockObj) {
    while (条件不满足) {
        lockObj.wait(1000); // 等待1秒，超时自动唤醒
    }
    // 执行业务逻辑
}
```

## 五、方法速查表

| 方法 | 用途 | 备注 |
| :--- | :--- | :--- |
| `equals` | 内容比较 | 默认比地址，常重写 |
| `hashCode` | 哈希值 | 必须与 equals 配套重写 |
| `toString` | 字符串表示 | 默认可读性差，常重写 |
| `getClass` | 运行时类型 | 不能重写，用于反射 |
| `clone` | 浅拷贝 | 需实现 `Cloneable` |
| `finalize` | GC 前回调 | 已过时，勿用 |
| `wait`(×3) | 释放锁等待 | 须在 synchronized 内 |
| `notify` | 唤醒一个线程 | 与 synchronized 配合 |
| `notifyAll` | 唤醒所有线程 | 与 synchronized 配合 |

## 六、相关页面

- [[01 继承 封装 多态]] — getClass 与运行时多态
- [[wiki/编程/java基础/object/实现深拷贝的三种方法是什么？]] — 与浅拷贝对比
- [[wiki/编程/java基础/object/反射在你平时写代码或者框架中的应用场景有哪些？]] — getClass/反射应用