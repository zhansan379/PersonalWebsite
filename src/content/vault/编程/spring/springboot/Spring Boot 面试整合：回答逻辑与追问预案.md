---
title: Spring Boot 面试整合：回答逻辑与追问预案
tags:
  - Java
  - Spring
  - Spring Boot
  - 面试
created: 2026-08-25
updated: 2026-08-25
---

# Spring Boot 面试整合：回答逻辑与追问预案

> 这是 Spring Boot 面试的**整理文档**：分主题给「一句话定调 → 回答要点 → 追问预案」，完整细节见各独立页。核心主线：**Spring Boot = 在 Spring 之上用"约定大于配置"把繁琐配置自动化**，三大利器是**起步依赖、自动装配、条件注解**。

## 一、回答总策略：先给定位，再落机制

> "Spring Boot 不是一个新框架，而是对 Spring 的**再封装**——通过**约定大于配置**（起步依赖 + 自动装配 + 条件注解）把开发者的配置工作量降到最低，做到'导入依赖即可用'。"

**子主题地图（面试官问哪个进哪个）**：

| 主题 | 一句话定调 | 完整页 |
| :--- | :--- | :--- |
| **核心与自动装配** | 约定大于配置；`@EnableAutoConfiguration` 扫描元数据按条件导入 | [[Spring Boot 核心与自动装配]] |
| **常用注解** | 组合入口 + 分层注解 + 请求映射 | [[Spring Boot 常用注解]] |
| **事务** | `@Transactional` 即开；默认只回滚 RunException/Error | [[Spring Boot 事务]] |
| **过滤器/拦截器** | Filter=Servlet 规范（全局）、Interceptor=Spring MVC（Controller 前后） | [[Spring Boot 过滤器与拦截器]] |
| **AOP 能力边界** | Spring AOP 只拦方法；AspectJ 才能切构造/字段；JoinPoint vs ProceedingJoinPoint | [[Spring AOP 能力边界与 JoinPoint]] |

## 二、分主题：回答逻辑与追问预案

### 2.1 为什么用 Spring Boot / 比 Spring 好在哪
- **回答要点**：简化开发（自动配置）、快速启动（内嵌 Tomcat 打可执行 JAR）、快速集成（Starter）
- **可能追问**：「为什么能直接 run 一个 JAR？」→ 内嵌服务器打进 JAR；「和 Spring 的关系？」→ 再封装 + 约定大于配置

### 2.2 约定大于配置
- **回答要点**：自动化配置、默认配置、约定项目结构三层解释
- **可能追问**：「不满足约定怎么覆盖？」→ properties/yml、同名 Bean、排除自动配置类

### 2.3 自动装配原理（核心必考）
- **回答思路**（由表及里四层）：
  1. **入口**：`@SpringBootApplication` = `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`
  2. **核心注解**：`@EnableAutoConfiguration` → `@AutoConfigurationPackage`（记录启动包）+ `@Import(AutoConfigurationImportSelector)`
  3. **核心类**：`AutoConfigurationImportSelector` 干三件事——**扫描**元数据（`spring.factories` 2.7 前 / `AutoConfiguration.imports` 2.7+）→ **条件判断**（`@ConditionalOnXxx`）→ **排序导入**（`@AutoConfigureOrder`/`@AutoConfigureAfter`）
  4. **落地**：把满足条件的自动配置类导入容器，生成 Bean
- **可能追问**：
  - 「`spring.factories` 和 `AutoConfiguration.imports` 版本关系？」→ 2.7 分界，3.0 移除前者自动配置条目
  - 「自动配置类怎么被举定该加载哪些？」→ 条件注解
  - 「怎么覆盖自动配置？」→ properties/同名 Bean/排除
  - 「自定义一个 Starter 怎么写？」→ 自动配置模块 + imports 文件 + 条件注解 + 配置属性类

### 2.4 为什么"导入即可用"
- **回答要点**：起步依赖（Starter 打包依赖）+ 自动配置（按类路径选装）+ 条件注解（`@ConditionalOnClass` 等）
- **可能追问**：「`@ConditionalOnClass` vs `@ConditionalOnMissingBean` 区别？」→ 类在不在路径 vs Bean 存不存在

### 2.5 常用注解
- **回答逻辑**：入口（`@SpringBootApplication`）→ 分层（Controller/RestController/Service/Repository/Component）→ 装配（Autowired/Value）→ 配置（Configuration/Bean）→ 请求映射（RequestMapping 一族）
- **可能追问**：「Controller 与 RestController 区别？」→ 后者 = Controller + ResponseBody

### 2.6 事务
- **回答要点**：方法加 `@Transactional`；Boot 经 `TransactionAutoConfiguration` 自动开启；默认回滚 RunException/Error。
- **可能追问**：「受检异常为什么不回滚/怎么处理？」→ `rollbackFor=Exception.class`；「失效场景？」→ （跨页）[[wiki/编程/spring/spring/Spring 事务失效场景]]

### 2.7 过滤器与拦截器
- **回答逻辑**：先三连——所属规范（Servlet vs Spring MVC）、拦截范围（全局含静态资源 vs 仅 Controller）、触发时机（Servlet 前 vs Controller 前后），再背**完整链路**（Filter → DispatcherServlet → preHandle → Controller → postHandle → View → afterCompletion → Filter）
- **可能追问**：「Filter 能注入 Bean 吗？」→ 不能直接；「怎么共存/共用？」→ Filter 外层、Interceptor 内层分层协作

## 三、30 秒速答版（开场"电梯演讲"）

> "Spring Boot 是对 Spring 的**自动化封装**。三大机制：**起步依赖**（引一个 starter 打包所有依赖）、**自动装配**（`@SpringBootApplication` 里的 `@EnableAutoConfiguration` 触发 `AutoConfigurationImportSelector`，扫描 `AutoConfiguration.imports` 元数据，用条件注解筛选出本类路径需要的自动配置类导入容器）、**条件注解**（控制 Bean 按需创建）。这就是为什么'加个依赖就能直接用'——配置的复杂度被'约定大于配置'消化掉了。"

## 四、相关页面

- [[Spring Boot 核心与自动装配]]
- [[Spring Boot 常用注解]]
- [[Spring Boot 事务]]
- [[Spring Boot 过滤器与拦截器]]
- [[Spring AOP 能力边界与 JoinPoint]]
- [[wiki/编程/spring/spring/Spring 面试整合：回答逻辑与追问预案]] — 上层 Spring 框架面试整合