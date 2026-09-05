---
title: Lambda 表达式基础
tags:
  - Java
  - Java 8
  - Lambda
  - 函数式接口
  - 函数式编程
created: 2026-08-22
updated: 2026-08-22
---
# Lambda 表达式基础

> Lambda 是 Java 8 引入的函数式编程写法：把"单方法接口（`FunctionalInterface`）的实例化匿名类"精简为 `(参数) -> 表达式`，参数与返回值类型由编译器自动推断，从而大幅简化代码。

## 一、背景：为什么需要 Lambda

函数式编程（Functional Programming）把**函数作为基本运算单元**：函数可以作为变量、可以接收函数、还可以返回函数。其理论源于 **Lambda 演算**，因此这种编码风格被称为 Lambda 表达式。

Java 程序里常见大量**单方法接口**（一个接口只定义了一个方法），例如 `Comparator`、`Runnable`、`Callable`。以 `Comparator` 为例，传统写法必须构造一个匿名类：

```java
String[] array = ...;
Arrays.sort(array, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return s1.compareTo(s2);
    }
});
```

这种写法非常繁琐。Java 8 起可用 Lambda 表达式替换单方法接口。

## 二、Lambda 表达式的基本写法

用 Lambda 改写上面的排序：

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String[] array = new String[] { "Apple", "Orange", "Banana", "Lemon" };
        Arrays.sort(array, (s1, s2) -> {
            return s1.compareTo(s2);
        });
        System.out.println(String.join(", ", array));
    }
}
```

- **参数** `(s1, s2)`：参数类型可以省略，因为编译器能自动推断为 `String`。
- **方法体** `-> { ... }`：所有代码写在内部。Lambda 没有 `class` 定义，非常简洁。

**单行 return 可进一步简化**（省略花括号和 `return`）：

```java
Arrays.sort(array, (s1, s2) -> s1.compareTo(s2));
```

返回值的类型也由编译器自动推断（这里推断为 `int`）。

> 一句话：Lambda 只需写出"方法定义"，类型统统交给编译器推断。

## 三、FunctionalInterface：Lambda 的载体

**只定义了一个抽象方法的接口**称为 `FunctionalInterface`，用注解 `@FunctionalInterface` 标记。
这个接口就是设计用来支持 Lambda 表达式或方法引用的”。这让代码的语义更清晰，避免后续维护者随意向接口中添加方法。

以 `Callable` 为例：

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}
```

`Comparator` 也是 `FunctionalInterface`：

```java
@FunctionalInterface
public interface Comparator<T> {
    int compare(T o1, T o2);          // 唯一的抽象方法
    boolean equals(Object obj);        // 来自 Object，不算接口方法
    default Comparator<T> reversed() {...}   // default 方法
    default Comparator<T> thenComparing(...) {...}
}
```

> 注意：`Comparator` 虽有很多方法，但抽象方法只有 `compare`；`equals(Object)` 是 `Object` 定义的方法不算；其余都是 `default`/`static` 方法。因此它仍是 `FunctionalInterface`，可用 Lambda 替换。

## 四、小结

- 单方法接口被称为 `FunctionalInterface`（用 `@FunctionalInterface` 标记）。
- 接收 `FunctionalInterface` 作为参数时，可把实例化的匿名类改写为 Lambda 表达式，大大简化代码。
- Lambda 表达式的参数和返回值均可由编译器**自动推断**。

## 五、相关页面

- [[Java 8 你知道有什么新特性？]] — Java 8 新特性总览
- [[方法引用]] — Lambda 的进一步简化（`类::方法`）
- [[四大函数式接口]] — 常见的四大函数式接口（Consumer/Supplier/Function/Predicate）