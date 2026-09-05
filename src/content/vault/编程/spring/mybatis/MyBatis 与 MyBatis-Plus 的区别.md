---
title: MyBatis 与 MyBatis-Plus 的区别
tags:
  - Java
  - MyBatis
  - MyBatis-Plus
  - ORM
created: 2026-08-25
updated: 2026-08-25
---

# MyBatis 与 MyBatis-Plus 的区别

> **MyBatis-Plus（MP）是基于 MyBatis 的增强工具库**，只做增强、不做改变：保留 MyBatis 的全部能力，额外简化开发、提高效率。核心主线：**MyBatis 是地基，MP 是脚手架。**

## 一、这是什么

回答"MP 和 MyBatis 的区别"时，先一句话点定位（增强工具，非替代），再列 MP 多出来的能力。

## 二、核心内容：MP 相对 MyBatis 新增/增强的能力

| 能力 | 说明 | 传统 MyBatis 对比 |
| :--- | :--- | :--- |
| **CRUD 操作** | 继承 `BaseMapper` 即得内置快捷方法 | 需手写 CRUD SQL |
| **代码生成器** | 按表结构自动生成实体、Mapper、MapperXML | 手动建文件 |
| **通用方法封装** | 条件构造器、排序、分页查询等 | 自己实现 |
| **分页插件** | 内置分页插件，支持多数据库分页 | 需手动实现分页逻辑 |
| **多租户支持** | 内置多租户数据隔离 | 自行设计 |
| **注解支持** | 更丰富注解配置实体↔表映射 | 多依赖 XML 配置 |

**详解各点**：
1. **CrudProvider 内置 CRUD**：`BaseMapper<T>` 提供 `selectById`、`insert`、`updateById` 等，无需写重复 SQL。
2. **代码生成器**：根据数据库表结构自动生成实体类、Mapper 接口及 XML 映射文件，减少手写量。
3. **Wrapper 条件构造器**：用 `LambdaQueryWrapper`/`QueryWrapper` 链式构建条件，支持排序、分页，避免手写动态 SQL。
4. **分页插件**：注册 `MybatisPlusInterceptor` + `PaginationInnerInterceptor`，一句 `selectPage` 即可分页（MyBatis 需手动拼 LIMIT 或引 PageHelper）。
5. **多租户**：通过 `TenantLineInnerInterceptor` 自动在 SQL 追加租户条件。
6. **注解映射**：`@TableName`、`@TableId`、`@TableField` 等注解配置实体与表映射，减少 XML。

> 一句话：**MP = MyBatis 的"全家桶"增强**，不改变 MyBatis 本身，SQL / 动态 SQL / resultMap 等原生能力照常可用。

## 三、可能追问

1. 「MP 会改变 MyBatis 原有的特性吗？」→ 不会，只做增强（如动态 SQL、resultMap 仍可用）
2. 「BaseMapper 提供哪些方法？」→ selectById/selectList/insert/updateById/deleteById 等
3. 「MP 分页怎么配？」→ `MybatisPlusInterceptor` + `PaginationInnerInterceptor`，用 `selectPage`
4. 「MP 多租户怎么实现？」→ `TenantLineInnerInterceptor` 会在 SQL 自动加租户条件
5. 「MP 有什么缺点？」→ 复杂查询仍要写 SQL；过度依赖内置方法时 SQL 不可控（对比 MyBatis 的 SQL 灵活性）
6. 「什么时候用 MP 什么时候用原生 MyBatis？」→ 快速 CRUD/简单场景用 MP；复杂 SQL 优化、SQL 全可控需求可用原生

## 四、相关页面

- [[MyBatis 的优势与特性]] — MyBatis 原生能力
- [[MyBatis 与 JDBC 对比及优点]]
- [[MyBatis 的占位符区别]]