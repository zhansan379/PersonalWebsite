---
title: Spring 核心特性
tags:
  - Java
  - Spring
  - IoC
  - AOP
  - 事务
  - MVC
created: 2026-08-25
updated: 2026-08-25
---
![[Pasted image 20260825164317.png]]
# Spring 核心特性

> 对 "Spring 是什么" 的整体回答。Spring 的核心是一套 **IoC 容器 + 在其上构建的 AOP、事务、MVC 等能力**，核心主线是"把对象的控制权交给容器"。

## 一、这是什么

回答"说一下你对 Spring 的理解"时，用四大核心特性做骨架，突出 **IoC 是地基、AOP 是关键扩展**——两者构成了 Spring 大部分能力的来源。

## 二、核心内容：四大核心特性

| 特性 | 一句话定位 | 关键点 |
| :--- | :--- | :--- |
| **IoC 容器** | 通过控制反转实现对象的创建和对象间依赖关系管理 | 开发者只需定义 Bean 及依赖，容器负责创建与组装 |
| **AOP** | 面向切面编程，模块化横切关注点 | 事务、安全控制等独立于业务逻辑；提高可维护性和可重用性 |
| **事务管理** | 一致的事务管理接口 | 支持声明式和编程式事务；屏蔽具体事务 API |
| **MVC 模块** | 基于 Servlet 的 Web 框架 | 模型-视图-控制器架构；灵活的 URL→Controller 映射；支持多视图技术 |

### 回答逻辑（30 秒版）
> "Spring 的核心是 **IoC 容器**——把对象的创建、组装、生命周期交给容器，从而解耦；在这个容器之上，通过 **AOP** 提供了事务、日志、安全等横切能力的注入。MVC 只是它面向 Web 的一个模块，不是 Spring 的全部。"

**加分表达**：
- 强调 IoC/AOP 是"框架核心"，MVC 是"附带 web 模块"，体现分层认知。
- 可顺带一句演进：Spring Boot 是约定大于配置的自动装配、Spring Cloud 是分布式生态。

## 三、可能追问

1. 「IoC 和 AOP 是怎么实现的？」→ [[IoC 与 AOP 的实现机制]]
2. 「Spring 与 Spring Boot 的关系？」→ Spring Boot 提供自动配置、起步依赖、约定大于配置
3. 「Spring IoC 容器有哪些？BeanFactory 和 ApplicationContext 区别？」→ ApplicationContext 是 BeanFactory 的企业级扩展
4. 「Spring 事务和 JDBC 事务差异？」→ [[Spring 事务失效场景]]

## 四、相关页面

- [[IoC 控制反转与依赖注入]] — 深入 IoC 原理与依赖注入方式
- [[IoC 与 AOP 的实现机制]] — IoC/AOP 底层实现机制
- [[Spring AOP]]
- [[Spring 事务失效场景]]
- [[Spring 常用注解]]