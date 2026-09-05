---
title: Spring 事务失效场景
tags:
  - Java
  - Spring
  - 事务
  - Transactional
created: 2026-08-25
updated: 2026-08-25
---

# Spring 事务失效场景

> `@Transactional` 失效的种种情形，**根本归因都是"代理没有被正确触发"**——要么绕过代理（this 调用）、要么代理感知不到异常（try-catch/受检异常）、要么条件不满足（非 public）。核心考点：**this 内部调用为什么不生效。**

## 一、这是什么

Spring 声明式事务基于 AOP 代理实现。只要"方法调用没走代理对象"，事务注解就失效。掌握失效场景，既回答正确、又能反推出事务的实现原理。

## 二、核心内容

### 2.1 事务失效的六种常见情况

| 失效场景 | 原因 | 对策 |
| :--- | :--- | :--- |
| **① try-catch 吞掉异常** | 代理感知不到异常 → 事务正常提交，回滚失效 | 手动 `rollback` 或重新抛出 |
| **② 抛出受检异常（Checked）** | Spring 默认只回滚 `RuntimeException` 及 `Error` | `@Transactional(rollbackFor = Exception.class)` 显式声明 |
| **③ 同类内部方法调用（this 调用）** | 绕过代理对象，注解失效 | 注入自身 / 拆类 / 用 `TransactionTemplate` |
| **④ 非 public 方法** | 代理基于 public 方法（接口实现/子类继承） | 改成 public |
| **⑤ 事务传播属性设置不当** | 嵌套事务传播级别错误（如内部 `REQUIRES_NEW` 独立提交） | 检查 `propagation` |
| **⑥ 多数据源事务配置不当** | 没有给对应数据源正确配置事务管理器 | 配置 `DataSourceTransactionManager` 按数据源绑定 |

### 2.2 「使用 this 调用是否生效？」——必背结论题

**不能生效。**

> "Spring 事务是靠**代理对象**控制的，只有**通过代理的方法调用**才会应用事务管理规则。用 `this` 直接调用时绕过了 Spring 的代理机制，因此不会应用事务设置。"

这是 AOP 同源问题——`this` 调用、同类内部 AOP 不生效，都是因为没走代理对象（理解见 [[Spring AOP]]）。

## 三、可能追问

1. 「默认回滚哪些异常？」→ `RuntimeException` 和 `Error`；受检异常默认不回滚
2. 「`@Transactional` 和 `@Transactional(rollbackFor=...)` 区别？」→ 后者让受检异常也能回滚
3. 「事务传播行为有哪些？REQUIRED 和 REQUIRES_NEW？」→ 7 种；REQUIRED 复用外层事务、REQUIRES_NEW 新开独立事务
4. 「事务失效如何排查？」→ 从小到大：是否走代理调用 / 异常类型 / 传播设置 / 事务管理器绑定
5. 「隔离级别了解吗？」→ READ_UNCOMMITTED / READ_COMMITTED / REPEATABLE_READ / SERIALIZABLE（关联 [[编程/数据库/mysql/事务/事务的特性是什么？如何实现的？]]）
6. 「事务在哪里开启/提交/回滚？」→ 代理的 `@Around` 在方法前开启、方法后按异常提交/回滚

## 四、相关页面

- [[编程/数据库/mysql/事务/事务的特性是什么？如何实现的？]] — 事务 ACID、隔离级别、MVCC
- [[Spring AOP]] — 事务基于代理的实现原理
- [[Spring 核心特性]] — 声明式事务是四大特性之一
- [[Spring 循环依赖与三级缓存]] — AOP 代理与 Bean 创建协同