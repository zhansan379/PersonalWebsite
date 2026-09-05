---
title: JSON 序列化库对比：Gson、FastJson、Jackson
tags:
  - Java
  - JSON
  - 序列化
  - Gson
  - FastJson
  - Jackson
  - 对象转换
created: 2026-08-22
updated: 2026-08-22
---

# JSON 序列化库对比：Gson、FastJson、Jackson

> Java 三大主流 JSON 序列化库——Gson（Google，功能最全面）、FastJson（阿里，性能极致但复杂类型易出错）；而 **Jackson**（Spring MVC 默认解析器）是当前最流行、最均衡的选择：社区活跃、依赖少、大文件解析快、内存占用低、API 灵活。

## 一、这是什么

把 Java 对象与 JSON 字符串互转，是业务开发里最高频的序列化需求。主流第三方库有三家：

| 库 | 出品方 | 一句话定位 |
| :--- | :--- | :--- |
| **Gson** | Google | 功能最全的 JSON 解析"神器"，`toJson`/`fromJson` 两个函数即可转换 |
| **FastJson** | 阿里巴巴 | 高性能著称，解析速度快但复杂类型转换易出问题 |
| **Jackson** | FasterXML | 当前最流行，Spring MVC 默认 JSON 解析器，综合表现最均衡 |

三者都**无依赖、不需要额外 jar，直接跑在 JDK** 上。

## 二、核心内容

### 1. Gson（Google）

- **定位**：功能最全的 json 解析神器，由 Google 内部需求催生，2008 年 5 月发布第一版，后被广泛使用。
- **用法**：核心就 `toJson`（Java → JSON）与 `fromJson`（JSON → Java）两个转换函数。
- **特点**：**无需声明额外的 jar/标记**，能直接跑在 JDK 上；**用前需先建好对象的类型及成员**，才能把 JSON 成功转成对应对象。
- **优势**：**只要类里有 `get`/`set` 方法，Gson 就能实现复杂类型的 JSON ↔ Bean 互转**，是 JSON 解析的神器。

### 2. FastJson（阿里巴巴）

- **定位**：Java 语言编写的高性能 JSON 处理器，阿里巴巴开发。
- **特点**：无依赖、能直接跑在 JDK 上。
- **优势**：**采用独创算法将 parse 速度提升到极致，超过所有 json 库**。
- **劣势（关键坑）**：**在复杂类型的 Bean 转 JSON 时易出问题**，可能出现"引用类型"导致转换出错，**需要显式指定引用**。

### 3. Jackson（FasterXML）— 当前最流行

- **定位**：当前用得最广的 Java JSON 序列化/反序列化开源框架；**Spring MVC 的默认 JSON 解析器**就是它。
- **社区**：社区相对活跃，更新速度快；Github 统计显示是**最流行的 json 解析器之一**。
- **核心模块由三部分组成**：
  - `jackson-core`：**流模式解析**核心 API——`JsonParser`/`JsonGenerator`，Jackson 内部靠高性能流模式 API 生成与解析 JSON
  - `jackson-annotations`：标准注解功能
  - `jackson-databind`：**对象绑定**（`ObjectMapper`）+ **树模型**（`JsonNode`）解析 API，后者依赖前者（即 databind 依赖 core）

**优点清单：**

- 所依赖 jar 包较少，简单易用
- 解析大的 json 文件速度快
- 运行时占用内存比较低，性能好
- 有灵活的 API，容易扩展和定制

## 三、如何应用 / 面试怎么讲

**回答骨架（选型三步）：**

1. **点三雄定位**：Gson(全) / FastJson(快但有坑) / Jackson(最流行)。
2. **锁定 Jackson**：Spring 默认 + 综合均衡，日常推荐 Jackson。
3. **抛追问**：从"选哪个"引到"Jackson 三模块结构 / FastJson 复杂类型坑 / Gson 无依赖特性"。

**追问预案：**

| 追问 | 应答案点 |
| :--- | :--- |
| 日常项目用哪个？ | 默认选 **Jackson**（Spring 原理默认、社区活跃、均衡）；有内部个性化需求可选 Gson |
| FastJson 有什么坑？ | 复杂类型 Bean 转 JSON 时易出现"引用类型"出错，需显式指定引用 |
| Jackson 三模块干嘛的？ | core=流模式（JsonParser/Generator）、annotations=注解、databind=对象绑定(ObjectMapper)+树模型(JsonNode)，databind 依赖 core |
| 序列化效率怎么看？ | FastJson 解析速度极致，但追求稳定均衡选 Jackson；Gson 功能最全 |
| 都无依赖？ | 三家都无第三方依赖、能直接跑 JDK，省去引入额外 jar |

## 四、相关页面

- [[wiki/编程/java基础/序列化/将对象转为二进制字节流具体怎么实现？]] — Java 原生对象流序列化（与 JSON 库互补的两种序列化路径）
- [[序列化和反序列化]] — 序列化协议视角的实现方法论