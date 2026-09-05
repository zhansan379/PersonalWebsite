---
title: Spring Boot 核心与自动装配
tags:
  - Java
  - Spring
  - Spring Boot
  - 自动配置
  - 起步依赖
  - 约定大于配置
created: 2026-08-25
updated: 2026-08-25
---

# Spring Boot 核心与自动装配

> Spring Boot 的核心价值是**把繁琐的配置变成"约定"**：通过**起步依赖**打包依赖、**自动装配**按类路径条件一键生成 Bean、**条件注解**控制加载，做到"导入依赖即可用"。核心主线：**约定大于配置（Convention over Configuration）。**

## 一、这是什么

回答"为什么用 Spring Boot / 比 Spring 好在哪里 / 约定大于配置 / 自动装配原理 / 怎么做到导入即用"等问题时，都指向同一套机制：起步依赖 + 自动装配 + 条件注解。

## 二、核心内容

### 2.1 为什么用 Spring Boot（比 Spring 好在哪）

| 优势 | 说明 |
| :--- | :--- |
| **简化开发** | 开箱即用的组件 + 自动配置，专注业务逻辑，少写繁琐配置 |
| **快速启动** | 内嵌 Tomcat/Jetty/Undertow，打包成可执行 JAR，无需额外部署 |
| **自动化配置** | 根据依赖与约定俗成规则自动配置，减少配置复杂性，贴合最佳实践 |
| **快速集成** | 通过 Starter 引入，快速集成数据库、消息队列、Web 等常用框架 |

### 2.2 约定大于配置（Convention over Configuration）

Spring Boot 核心设计理念：**预设合理的默认行为与项目规范，减少手动配置**。

- **自动化配置**：根据依赖和环境自动配置。如引入 `spring-boot-starter-web` 自动配内嵌 Tomcat 和 Spring MVC，无需手写 XML。
- **默认配置**：数据库连接、Web 服务器、日志等大量默认值已配好。
- **约定的项目结构**：主类置于根包，controller/service/dao 分到对应子包，方便团队定位、新成员上手。

### 2.3 自动装配原理（必考重点）

**什么是自动装配**：通过注解或简单配置就能开启/配置各种功能（数据库、Web 等）。

**原理核心**：`@SpringBootApplication` = `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`。

| 组成注解 | 作用 |
| :--- | :--- |
| `@SpringBootConfiguration` | 表明这是 Spring Boot 配置类（本质同 `@Configuration`） |
| `@EnableAutoConfiguration` | **自动装配的核心**：启用自动配置机制 |
| `@ComponentScan` | 扫描指定包及子包的组件（含 `excludeFilters` 排除过滤器） |

**`@EnableAutoConfiguration` 往下走两步**：
1. `@AutoConfigurationPackage`：记录主启动类所在包路径（注册 `AutoConfigurationPackagesBean`），供 JPA `@EntityScan`、MyBatis `@MapperScan` 等知道默认扫哪个包。
2. `@Import(AutoConfigurationImportSelector.class)`：**自动装配的核心**。

**`AutoConfigurationImportSelector`（实现 `ImportSelector`）的三大工作**：
1. **扫描类路径**：读元数据文件（**2.7 前 `META-INF/spring.factories`，2.7+ `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`**），找出 `EnableAutoConfiguration` 键下登记的自动配置类全限定名（`getCandidateConfigurations`）
2. **条件判断**：用 `@ConditionalOnXxx` 判断是否满足导入条件（配置属性存在、类是否存在、Bean 是否存在）：`filter`
3. **排序并导入**：按 `@AutoConfigureOrder`/`@AutoConfigureAfter`/`@AutoConfigureBefore` 排序，满足条件的导入容器（`sort`）

> ⚠️ **版本坑（常考）**：Spring Boot 2.7 起官方改用 `AutoConfiguration.imports` 注册自动配置类并新增 `@AutoConfiguration` 注解；`spring.factories` 中自动配置条目 2.7 起 `@Deprecated`、**3.0 完全移除**（spring.factories 只保留其他类型扩展点）。

### 2.4 为什么"导入依赖就可以直接用"

靠三大特性组合：
1. **起步依赖（Starter）**：打包一组关联依赖。引一个 `spring-boot-starter-web` 就自带 Spring MVC + Tomcat。
2. **自动配置**：按类路径依赖选装自动配置类（如含 web 依赖就加载 `WebMvcAutoConfiguration` 配置 DispatcherServlet、视图解析器等）。开发者可用 `application.properties/yml` 或同名 Bean 覆盖默认行为。
3. **条件注解**：控制 Bean 创建（如 `@ConditionalOnClass` 只有类路径存在指定类才加载）。

### 2.5 常见 Starter

| Starter | 用途 |
| :--- | :--- |
| `spring-boot-starter-web` | Spring MVC + 内嵌 Tomcat，构建 Web 应用 |
| `spring-boot-starter-security` | Spring Security 认证/授权 |
| `mybatis-spring-boot-starter` | MyBatis（`SqlSessionFactory`、`MapperScannerConfigurer` 自动配置） |
| `spring-boot-starter-data-jpa` | JPA（Hibernate）+ Spring Data JPA + HikariCP；**不含具体 JDBC 驱动**（连 MySQL 需另引 `mysql-connector-j`） |
| `spring-boot-starter-jdbc` | 直接 JDBC 支持 |
| `spring-boot-starter-data-redis` | Redis；**2.0 起默认 Lettuce 客户端**（Netty 实现、线程安全、支持响应式），用 Jedis 需排除 lettuce-core 引入 jedis |
| `spring-boot-starter-test` | JUnit、Spring Test、AssertJ 等 |

## 三、可能追问

1. 「`@SpringBootApplication` 由哪几个注解组成，各自作用？」→ 见 2.3
2. 「自动配置核心类是什么？做了哪三件事？」→ `AutoConfigurationImportSelector`：扫描→条件判断→排序导入
3. 「怎么覆盖自动配置？」→ `application.properties/yml` 改配置、定义同名 Bean、用 `@ConditionalOnMissingBean` 兜底、排除指定自动配置类
4. 「`spring.factories` 和 `AutoConfiguration.imports` 的关系与版本？」→ 2.7 前用前者、2.7+ 用后者、3.0 移除前者自动配置条目
5. 「条件注解有哪些？`@ConditionalOnClass` vs `@ConditionalOnMissingBean`？」→ 前者按类是否在路径、后者按 Bean 是否已存在
6. 「一个自定义 Starter 怎么写？」→ 新建 `auto-config` 模块 + `AutoConfiguration.imports` + 自动配置类 + `@ConditionalOnXxx` + 配置属性类
7. 「为什么能直接 run 一个 JAR 不用部署？内嵌 Tomcat 怎么实现的？」→ 内嵌服务器以依赖方式打进可执行 JAR

## 四、相关页面

- [[Spring Boot 常用注解]] — `@SpringBootApplication` 等组合注解
- [[Spring Boot 事务]] — 事务自动配置（`TransactionAutoConfiguration`）
- [[Spring Boot 过滤器与拦截器]] — MVC 请求链路
- [[wiki/编程/spring/spring/Spring 核心特性]] — 上层 Spring 框架
- [[wiki/编程/spring/spring/Spring 常用注解]]