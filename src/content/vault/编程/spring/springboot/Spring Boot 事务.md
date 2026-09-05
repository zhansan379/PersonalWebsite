---
title: Spring Boot 事务
tags:
  - Java
  - Spring
  - Spring Boot
  - 事务
  - Transactional
created: 2026-08-25
updated: 2026-08-25
---

# Spring Boot 事务

> Spring Boot 开启事务极简：在方法上加 `@Transactional` 即可，Spring 已通过 `TransactionAutoConfiguration` 自动启用事务管理。核心考点仍落在**回滚规则**（默认只回滚 `RuntimeException`/`Error`）与**失效边界**。

## 一、这是什么

Spring Boot 内置了事务自动配置，省去手动 `@EnableTransactionManagement`。回答要点：怎么开启 → 默认回滚规则 → 如何覆盖默认。

## 二、核心内容

### 2.1 怎么开启事务

在**服务层方法**上加 `@Transactional` 注解：

```java
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void saveUser(User user) {
        userRepository.save(user);
    }
}
```

- 方法执行成功 **自动提交**；抛 `RuntimeException` 或 `Error` **自动回滚**。
- **Spring Boot 已自动启用事务管理**（`TransactionAutoConfiguration`），无需手动加 `@EnableTransactionManagement`。
- 依赖：通过 `spring-boot-starter-jdbc` 或 `spring-boot-starter-data-jpa` 引入（带入 `PlatformTransactionManager`）。

### 2.2 回滚规则（关键考点）

| 情况 | 是否回滚 | 说明 |
| :--- | :--- | :--- |
| 抛 `RuntimeException` / `Error` | ✅ 回滚 | 默认行为 |
| 抛受检异常（如 `IOException`） | ❌ 不回滚（默认） | 需显式声明 |

```java
@Transactional(rollbackFor = Exception.class)  // 让受检异常也回滚
```

## 三、可能追问

1. 「`@Transactional` 默认回滚哪些异常？」→ `RuntimeException` 和 `Error`，受检异常默认不回滚
2. 「怎么让受检异常也回滚？」→ `rollbackFor = Exception.class`
3. 「为什么 Spring Boot 不用加 `@EnableTransactionManagement`？」→ `TransactionAutoConfiguration` 自动开启
4. 「事务生效依赖什么？」→ AOP 代理（同类 this 调用失效，详见 [[wiki/编程/spring/spring/Spring 事务失效场景]]）

## 四、相关页面

- [[wiki/编程/spring/spring/Spring 事务失效场景]] — 事务失效与 this 调用（与 Boot 同源）
- [[Spring Boot 核心与自动装配]] — Starter 与事务相关自动配置