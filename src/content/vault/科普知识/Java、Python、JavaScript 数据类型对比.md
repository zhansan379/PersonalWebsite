---
title: Java、Python、JavaScript 数据类型对比：基本类型、原始类型与「一切皆对象」
sort:
tags:
  - 科普
  - Java
  - Python
  - JavaScript
  - 数据类型
  - 编程语言
created: 2026-10-04
updated: 2026-10-04
---

> 一句话概述：三门语言代表了三种类型系统设计——**Java 静态强类型**（基本类型 + 引用类型，编译期检查）、**Python 动态强类型**（一切皆对象，变量只是名字绑定，运行时检查）、**JavaScript 动态弱类型**（原始类型 + 对象类型，隐式转换多）。核心记忆点：Java 8 种基本类型、Python 六大标准类型、JS 七种原始类型 + 一种对象类型。

## 一、总体对比

### 1. 一句话总结

| 语言 | 类型系统 | 核心特点 |
|---|---|---|
| Java | 静态、强类型 | 分基本类型和引用类型，编译期检查 |
| Python | 动态、强类型 | 一切皆对象，变量是名字绑定，运行时检查 |
| JavaScript | 动态、弱类型 | 分原始类型和对象类型，隐式转换多 |

> “强/弱类型”没有绝对标准，通常指**是否允许大量隐式跨类型转换**。JavaScript 中 `"1" == 1` 为 `true`，所以常被称为弱类型。

### 2. 类型系统总览

| 维度 | Java | Python | JavaScript |
|---|---|---|---|
| 类型声明 | 必须声明，`var` 只是局部推断 | 不需要，可选类型注解 | `let/const/var` 不指定类型 |
| 类型检查 | 编译期为主 | 运行时 | 运行时 |
| 类型分类 | 基本类型 + 引用类型 | 一切皆对象 | 原始类型 + 对象类型 |
| 变量本质 | 基本类型存值，引用类型存引用 | 名字绑定到对象 | 原始值存值，对象存引用 |
| 整数 | `byte/short/int/long/BigInteger` | `int` 任意精度 | `number` 双精度浮点，`bigint` 任意精度 |
| 浮点 | `float/double/BigDecimal` | `float` | `number` |
| 布尔 | `boolean` | `bool`（是 `int` 子类） | `boolean` |
| 字符/字符串 | `char` 基本类型；`String` 对象，不可变 | `str` 不可变 Unicode | `string` 原始类型，不可变 |
| 空值 | `null`（只能赋给引用类型） | `None`（单例对象） | `null`、`undefined` 两种 |
| 数组/列表 | 数组定长；`ArrayList` 可变 | `list` 可变；`tuple` 不可变 | `Array` 可变 |
| 字典/映射 | `HashMap/Map` | `dict` | `Object/Map` |
| 集合 | `HashSet/Set` | `set/frozenset` | `Set` |
| 函数 | 方法、lambda、函数式接口 | 函数是一等对象 | 函数是一等对象 |
| 自定义对象 | `class`、`interface`、`record` | `class` | `class`、对象字面量、函数构造 |
| 类型转换 | 显式强转 + 自动装箱/拆箱 | 显式转换，强类型 | 隐式转换多，`==` 与 `===` 区别大 |

## 二、关键差异（五个维度）

### 1. 静态 vs 动态

- **Java**：变量类型编译期确定，例如 `int a = 1;`
- **Python**：运行时确定，`a = 1`，之后可 `a = "x"`
- **JavaScript**：运行时确定，`let a = 1; a = "x";`

### 2. 基本类型/原始类型 vs 对象

- **Java**：有真正的基本类型（如 `int`），也有包装类 `Integer`
- **Python**：没有基本类型，`1` 也是对象
- **JavaScript**：有原始类型（`number`、`string`、`boolean` 等），也有包装对象

### 3. 可变性

- **Java**：`String`、包装类不可变；数组、集合通常可变
- **Python**：`int/str/tuple/frozenset` 不可变；`list/dict/set` 可变
- **JavaScript**：原始类型不可变；对象可变——**`const` 只限制重新赋值，不限制修改属性**

### 4. 类型转换

- **Java**：强类型，通常需要显式强转；有自动装箱拆箱
- **Python**：强类型，`1 + "1"` 会报 `TypeError`
- **JavaScript**：弱类型，`"1" == 1` 为 `true`，**推荐用 `===`**

### 5. 空值

- **Java**：`null` 只能赋给引用类型
- **Python**：`None`，单例对象
- **JavaScript**：`null` 和 `undefined` 不同——`null == undefined` 为 `true`，但 `null === undefined` 为 `false`

## 三、各语言数据类型明细

### 1. Java：8 种基本类型，分四类

| 类别 | 类型 | 说明 |
|---|---|---|
| 整型 | `byte` | 8 位整数 |
| 整型 | `short` | 16 位整数 |
| 整型 | `int` | 32 位整数，最常用 |
| 整型 | `long` | 64 位整数 |
| 浮点型 | `float` | 32 位单精度浮点 |
| 浮点型 | `double` | 64 位双精度浮点，最常用 |
| 字符型 | `char` | 16 位 Unicode 字符 |
| 布尔型 | `boolean` | `true` / `false` |

注意：

- **`String` 不是基本类型**，它是引用类型；
- 对应的包装类：`Byte、Short、Integer、Long、Float、Double、Character、Boolean`。

### 2. Python：六大标准数据类型

Python 没有 Java 那种"基本类型 vs 引用类型"的划分，一切皆对象。通常教学里说六大标准数据类型：

| 类别 | 类型 | 示例 | 可变性 |
|---|---|---|---|
| 数字 | `int`、`float`、`bool`、`complex` | `1`、`1.2`、`True`、`1+2j` | 不可变 |
| 字符串 | `str` | `"hello"` | 不可变 |
| 列表 | `list` | `[1, 2, 3]` | 可变 |
| 元组 | `tuple` | `(1, 2, 3)` | 不可变 |
| 集合 | `set`、`frozenset` | `{1, 2, 3}` | `set` 可变，`frozenset` 不可变 |
| 字典 | `dict` | `{"name": "Tom"}` | 可变 |

其他常见内置类型（一般不放进"六大"）：`NoneType`（`None`）、`bytes`、`bytearray`、`range`、`object`。

### 3. JavaScript：7 种原始类型 + 1 种对象类型

七种原始类型：

| 类型 | 说明 | 示例 |
|---|---|---|
| `undefined` | 未定义 | `let a;` |
| `null` | 空值 | `let a = null;` |
| `boolean` | 布尔 | `true`、`false` |
| `number` | 数字，双精度浮点 | `1`、`1.5`、`NaN`、`Infinity` |
| `bigint` | 大整数，任意精度 | `10n` |
| `string` | 字符串 | `"hello"` |
| `symbol` | 唯一标识符 | `Symbol("id")` |

一种对象类型：`Object` 是引用类型，下面这些本质上都属于 `Object`——`Array`、`Function`、`Date`、`RegExp`、`Map`、`Set`、`Promise` 等等。所以按"八种数据类型"说就是：**7 种原始类型 + 1 种对象类型**。

注意点：

- `typeof null` 返回 `"object"`，这是**历史遗留问题**，但 `null` 本身是原始类型；
- `typeof function` 返回 `"function"`，但函数本质也是对象；
- `Array` 判断用 `Array.isArray()` 更准确。


## 四、为什么 Python 与 Java、JavaScript 不同

核心原因：**Python 从设计之初就选择了"一切皆对象"的统一模型**，而不是像 Java、JavaScript 那样区分"基本类型/原始类型"和"对象类型"。

### 1. Python 的设计哲学：一切皆对象

```python
a = 1
a = "hello"
```

`1` 是一个 `int` 对象，`"hello"` 是一个 `str` 对象。变量 `a` **不是"盒子"，而是名字/标签**——它只是绑定到某个对象上。甚至这些也都是对象：`1`（int 对象）、`"abc"`（str 对象）、`[1, 2]`（list 对象）、`def f():`（函数对象）、`class C:`（类对象）、`None`（NoneType 对象）。所以 Python 没有"基本类型"的说法，所有类型都是对象，只是**分可变和不可变**。

### 2. 为什么 Java 要有基本类型

Java 设计时受 C/C++ 影响，**为了性能**：

- `int`、`double` 等直接存在栈上，不经过堆分配；
- 不是对象，没有方法，不能为 `null`；
- 运算快，内存小。

但这也带来麻烦：泛型不能用 `int` 只能用 `Integer`；需要自动装箱/拆箱；`==` 对基本类型比值、对对象比引用；`Integer` 有缓存导致 `==` 行为不一致。Java 的 Valhalla 项目想统一这个模型，但很难。

### 3. 为什么 JavaScript 要有原始类型

JavaScript 同样分原始类型和对象类型。原始类型不是对象，但可以调用方法：

```js
"abc".length   // 3
```

因为 JavaScript 会**临时把原始字符串包装成 `String` 对象，用完就丢**——这也叫自动装箱。这样设计是为了简单、快速：原始值按值传递，对象按引用传递；但历史遗留问题多，比如 `typeof null === "object"`。

### 4. Python 为什么不用基本类型

Python 追求的是：

1. **一致性**：所有东西都是对象，都有类型、方法、属性，不需要区分"基本类型"和"包装类"；
2. **动态性**：变量可以随时绑定到任何对象——**类型是对象的属性，不是变量的属性**；
3. **灵活性**：函数、类、模块都是对象，可以动态修改、传递、元编程；
4. **实现简单**：CPython 中所有对象都继承自 `PyObject`，有引用计数和类型指针，统一模型让解释器实现更简单。

代价是：性能比 Java 基本类型慢、内存占用大——但 CPython 做了优化，比如**小整数缓存、字符串驻留**。

### 5. 三者对比

| 维度 | Java | JavaScript | Python |
|---|---|---|---|
| 类型划分 | 基本类型 + 引用类型 | 原始类型 + 对象类型 | 只有对象 |
| 变量本质 | 盒子，存值或引用 | 原始值按值，对象按引用 | 名字绑定对象 |
| 整数 | `int` 基本类型，`Integer` 包装类 | `number` 原始类型 | `int` 对象 |
| 字符串 | `String` 对象，`char` 基本类型 | `string` 原始类型 | `str` 对象 |
| 自动装箱 | 有 | 有 | 无，因为全是对象 |
| 性能 | 基本类型快 | 原始类型快 | 对象模型较慢 |
| 一致性 | 较差，有装箱拆箱 | 一般，有历史坑 | 很好，一切皆对象 |

## 五、总结

- **Java**：静态强类型，强调编译期安全，注意基本类型与包装类型、`null` 风险。基本数据类型共 **8 种**，分为整型、浮点型、字符型、布尔型四类；
- **Python**：动态强类型，**一切皆对象**，注意可变/不可变对象和运行时类型错误。常见标准类型为数字、字符串、列表、元组、集合、字典**六大类**；
- **JavaScript**：动态弱类型，原始类型与对象类型并存，注意 `null/undefined`、隐式转换，尽量使用 `===`。数据类型为 **7 种原始类型 + 1 种对象类型**；
- Python 不是"只有对象、没有基本类型"，而是**它把基本类型也做成了对象**。这是语言设计的选择：Java、JavaScript 为了性能保留了原始类型，牺牲了一致性；Python 为了简洁、统一、动态选择了"一切皆对象"，牺牲了一些性能；
- 如果 JavaScript 想要 Java 式静态类型，可用 TypeScript——但 **TypeScript 不是 JavaScript 本身**。
