---
title: MyBatis 与 JDBC 对比及优点
tags:
  - Java
  - MyBatis
  - JDBC
  - ORM
created: 2026-08-25
updated: 2026-08-25
---

# MyBatis 与 JDBC 对比及优点

> 相比原生 JDBC，MyBatis 的核心优势是**基于 SQL 编程、代码量大幅减少、解耦、兼容所有 JDBC 数据库、易与 Spring 集成、提供 ORM 映射**。核心主线：**把 JDBC 的繁琐样板代码交给框架，SQL 留给你掌握。**

## 一、这是什么

回答"与传统 JDBC 相比 MyBatis 优点"时，抓住"**少写代码 + SQL 可控 + 解耦 + 集成**"几个维度，可顺带点出 JDBC 的痛点作对比。

## 二、核心内容：MyBatis 相对 JDBC 的五大优点

1. **基于 SQL 编程，灵活、无影响**：直接用 SQL，不对应用程序或数据库现有设计造成影响；SQL 写在 XML 中，解除 SQL 与程序代码的耦合，便于统一管理；提供 XML 标签支持动态 SQL，可重用。
```xml
<select id="findById" resultType="User">
    SELECT * FROM user WHERE id = #{id}
</select>
```

2. **代码量减少 50% 以上**：消除了 JDBC 大量冗余样板代码（注册驱动、建连接、拼语句、处理结果集、关闭资源等），**不需要手动开关连接**（由框架管理）。

3. **数据库兼容性好**：MyBatis 底层使用 JDBC 连接数据库，因此 **只要 JDBC 支持的数据库，MyBatis 都支持**；同一套映射/SQL 可跨数据库（个别方言差异需处理）。

4. **与 Spring 无缝集成**：配合 Spring 事务管理、`@MapperScan` 扫描 Mapper，开发效率高。

5. **提供 ORM 映射**：映射标签支持对象与数据库字段（表列）的 ORM 关联；对象关系映射标签支持**关联关系（一对一/一对多/多对多）**维护。

### 对照：JDBC 的痛点（反衬 MyBatis 价值）
| JDBC 痛点 | MyBatis 解决 |
| :--- | :--- |
| 大量样板代码（连接/PreparedStatement/ResultSet/释放） | 框架封装，代码量 -50%+ |
| SQL 与 Java 代码耦合、难维护 | SQL 抽到 XML，集中管理 |
| 结果集手工逐字段 get/映射 | 自动/`resultMap` 映射 |
| 无动态 SQL 支持 | XML 标签动态拼 |
| 连接管理繁琐 | SqlSessionFactory 统一管理 |

## 三、可能追问

1. 「MyBatis 底层还是 JDBC 吗？」→ 是，MyBatis 是对 JDBC 的封装，最终仍走 JDBC
2. 「代码量减少在哪？」→ 连接管理/结果集映射/资源关闭等样板代码由框架接管
3. 「怎么做到跨数据库兼容？」→ 底层用 JDBC；个别方言差异通过 `databaseId` 区分
4. 「SqlSession 是什么？和 JDBC Connection 关系？」→ SqlSession 封装了对 JDBC 连接的操作，工厂 `SqlSessionFactory` 创建
5. 「MyBatis 凭什么不用手动开关连接？」→ SqlSession 生命周期由框架/Spring 管理
6. 「一级/二级缓存了解吗？」→ 见 MyBatis 缓存扩展（本地 SqlSession 缓存 / 全局二级缓存）

## 四、相关页面

- [[MyBatis 的优势与特性]] — 比 ORM 更贴 SQL 的开发体验
- [[MyBatis 的占位符区别]] — 相对 JDBC 的参数占位方式
- [[MyBatis 与 MyBatis-Plus 的区别]] — 增强工具
- [[wiki/编程/spring/springboot/Spring Boot 核心与自动装配]] — mybatis-spring-boot-starter 自动配置