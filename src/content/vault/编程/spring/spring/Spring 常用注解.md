---
title: Spring 常用注解
tags:
  - Java
  - Spring
  - 注解
created: 2026-08-25
updated: 2026-08-25
---

# Spring 常用注解

> Spring 常用注解速查：核心是**分层注入**——`@Component` 是通用 Bean，`@Service`/`@Controller`/`@Repository` 是它的语义分层特例；`@Autowired` 负责自动装配；`@Configuration`+`@Bean` 负责显式声明配置 Bean。

## 一、这是什么

现场写代码或问"Spring 常用注解有哪些"时的背多分题。重点不是背全，而是掌握**每个注解的定位与搭配关系**（尤其 `@Component` 一族和 `@Autowired` 装配规则）。

## 二、核心内容

### 2.1 装配 / 分层注解

| 注解 | 作用 | 说明 |
| :--- | :--- | :--- |
| `@Component` | 标记一个类作为 Spring Bean | Spring 会实例化为 Bean 并加入容器 |
| `@Service` | 标记服务层组件 | **`@Component` 特例**，标记在业务 Service 实现类 |
| `@Controller` | 标记控制层组件 | **`@Component` 特例**，MVC 控制层 |
| `@Repository` | 标记数据访问层（DAO）组件 | **`@Component` 特例**；额外将持久层异常统一翻译为 Spring 的 `DataAccessException` 体系 |
| `@Autowired` | 自动装配 Bean | 容器中按类型匹配时自动注入（等同 new 对象） |
| `@Configuration` | 标记配置类 | 可含多个 `@Bean` 方法，作为全局配置 |
| `@Bean` | 标记方法为 Bean 工厂方法 | 方法返回值注册为 Bean；自定义配置时常用 |

### 2.2 代码示例

```java
// @Component → 被 @Autowired 自动装配
@Component
public class MyService {}

@Component
public class MyController {
    @Autowired
    private MyService myService;   // 自动注入，等同 new
}

// @Service / @Repository 是 @Component 的分层特例
@Service
public class MyServiceImpl {}

@Repository   // 额外提供持久层异常统一翻译
public class MyRepository {}

// @Configuration + @Bean 显式声明配置 Bean
@Configuration
public class MyConfiguration {
    @Bean
    public MyBean myBean() {
        return new MyBean();
    }
}
```

### 2.3 加分点

- **`@Repository` 的隐形能力**：会通过 `PersistenceExceptionTranslationPostProcessor` 把持久层抛出的异常统一转换为 Spring 的 `DataAccessException` 体系，忽略会丢失这层异常转换能力。
- 记忆：`@Service`/`@Controller`/`@Repository` 本质都是 `@Component`，只是加了语义分层。

## 三、可能追问

1. 「`@Component`/`@Service`/`@Controller`/`@Repository` 区别？」→ 核心都是 `@Component`，只是语义分层（+ `@Repository` 异常翻译）
2. 「`@Component` vs `@Bean`？」→ `@Component` 扫描类，`@Bean` 显式声明方法返回对象
3. 「`@Autowired` byType 找到多个怎么办？」→ `@Primary`/`@Qualifier`/`@Resource(name)`/`Map` 注入
4. 「`@Autowired` vs `@Resource`？」→ Autowired 按类型、Resource 按名称（JSR-250）
5. 「有个第三方类不能加 `@Component`，怎么装配？」→ `@Configuration` + `@Bean`
6. 「`@Qualifier` 和 `@Primary` 谁优先？」→ 同时存在时 `@Qualifier` 更优先（更明确）

## 四、相关页面

- [[IoC 控制反转与依赖注入]] — 依赖注入方式与装配原理
- [[Spring AOP]] — `@Aspect`/`@Pointcut` 等 AOP 注解
- [[Spring 事务失效场景]] — `@Transactional` 使用边界
- [[Spring 核心特性]]