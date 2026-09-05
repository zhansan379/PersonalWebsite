---
title: IoC 与 AOP 的实现机制
tags:
  - Java
  - Spring
  - IoC
  - AOP
  - 反射
  - 动态代理
created: 2026-08-25
updated: 2026-08-25
---

# IoC 与 AOP 的实现机制

> 回答 "IoC 和 AOP 是通过什么机制实现的？"——**IoC 靠反射 + 依赖注入 + 工厂模式 + 容器**；**AOP 靠动态代理**（JDK 动态代理 / CGLIB 子类）。

## 一、这是什么

这道题考察对 Spring 两大核心"底层怎么跑起来"的认知，不涉及应用层注解，而是机制层原理。分两条线回答：容器怎么管对象（IoC），方法怎么被增强（AOP）。

## 二、核心内容

### 2.1 Spring IoC 实现机制（四点）

1. **反射**：Io C 容器利用 Java 反射动态加载类、创建对象实例、调用方法。反射允许运行时检查类、方法、属性信息 → 实现灵活的对象实例化与管理。
2. **依赖注入**：IoC 的核心是 DI，容器负责管理组件间依赖关系。通过构造函数注入、属性注入或方法注入，把依赖关系描述在配置文件或注解中。
3. **设计模式 — 工厂模式**：容器作为工厂负责实例化 Bean 并管理其生命周期。
4. **容器实现**：`BeanFactory`（IoC 容器基本形式，提供基础功能）/ `ApplicationContext`（BeanFactory 扩展，提供更多企业级功能）。

### 2.2 Spring AOP 实现机制

- **动态代理**：运行时动态生成代理对象，而非编译期；允许在运行时指定要代理的接口和行为，在不改源码的情况下增强方法。
- 两种：
  - **JDK 动态代理**：`Proxy` + `InvocationHandler`，需代理类实现接口。
  - **CGLIB 动态代理**：第三方代码生成库，生成目标类子类，不需实现接口。

> 详细代理机制见 [[Spring AOP]] 2.4；AOP 应用到事务的失效边界见 [[Spring 事务失效场景]]。

## 三、可能追问

1. 「反射的性能代价？Spring 如何优化？」→ 反射比直接调用慢，Spring 有缓存机制（如 `ReflectiveMethodInvocation`、缓存 Method/Field）
2. 「BeanFactory 和 ApplicationContext 区别？」→ 后者继承前者，增加 AOP、事件监听、国际化、资源加载等企业能力
3. 「为什么不直接用 AspectJ 做 AOP？」→ Spring AOP 运行期织入、无编译期依赖、够用（见 [[Spring AOP]]）
4. 「容器怎么从配置/注解知道要创建哪些 Bean？」→ BeanDefinition 解析 + 扫描路径
5. 「单例 Bean 是线程安全的吗？」→ 单例 Bean 被多线程共享，有状态要加锁/用 ThreadLocal

## 四、相关页面

- [[IoC 控制反转与依赖注入]] — IoC 思想与 DI 实现方式
- [[Spring AOP]] — AOP 原理、动态代理、应用场景
- [[Spring 核心特性]]
- [[Spring 循环依赖与三级缓存]] — 容器如何管理 Bean 创建过程