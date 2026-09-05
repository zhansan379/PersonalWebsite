---
title: Spring Boot 过滤器与拦截器
tags:
  - Java
  - Spring
  - Spring Boot
  - Filter
  - Interceptor
created: 2026-08-25
updated: 2026-08-25
---

# Spring Boot 过滤器与拦截器

> 过滤器（Filter）和拦截器（Interceptor）都是处理请求的处理机制，但**所属规范不同**：Filter 是 Java Servlet 规范（对所有请求、含静态资源），Interceptor 是 Spring MVC 机制（只拦 Controller 请求）。核心主线：**Filter 在 Servlet 前，Interceptor 在 Controller 前后**。

## 一、这是什么

回答"过滤器与拦截器"时，先用一张鼎分层（规范/范围/时机），再讲完整执行链路，最后从应用场景收尾。

## 二、核心内容

### 2.1 对比表

| 维度 | 过滤器（Filter） | 拦截器（Interceptor） |
| :--- | :--- | :--- |
| 规范/框架 | Servlet 规范（2.x `javax.servlet.Filter`，**3.x 起 `jakarta.servlet.Filter`**） | Spring MVC（`HandlerInterceptor`） |
| 作用范围 | 全局（所有请求、含静态资源） | Controller 层（仅 Spring 管理的请求） |
| 执行顺序 | Servlet 之前执行 | DispatcherServlet 之后、Controller 方法前后 |
| DI 支持 | 无法直接注入 Spring Bean（需间接获取） | 支持自动注入 Spring Bean |
| 触发时机 | `doFilter()` 请求前/响应后 | `preHandle`/`postHandle`/`afterCompletion` 分阶段 |
| 适用场景 | 全局处理（编码、日志、安全） | 业务逻辑（权限、参数校验） |

### 2.2 各自机制

- **过滤器**：实现 `Filter` 接口，重写 `init`/`doFilter`/`destroy`。请求进入容器按顺序经过过滤器，再到达目标 Servlet/Controller；响应返回按相反顺序再经过一次。
- **拦截器**：实现 `HandlerInterceptor`，重写 `preHandle`/`postHandle`/`afterCompletion`。`preHandle` 返回 `true` 继续执行 Controller 和其他拦截器；Controller 执行后调 `postHandle`；请求处理完成后调 `afterCompletion`。

### 2.3 完整执行链路（必背）

> **Filter → DispatcherServlet → Interceptor.preHandle → Controller → Interceptor.postHandle → View → Interceptor.afterCompletion → Filter（后置）**

### 2.4 核心区别（三点）

1. **所属规范**：Filter 是 Servlet 规范，Interceptor 是 Spring 框架机制
2. **执行顺序**：Filter 在到达 DispatcherServlet 前执行；Interceptor 在进入 DispatcherServlet 之后、Controller 方法前（`preHandle`）/方法后视图渲染前（`postHandle`）/视图渲染后（`afterCompletion`）
3. **使用范围**：Filter 拦截所有请求（含静态资源）；Interceptor 只拦 Spring MVC Controller 请求
4. **功能特性**：Filter 做请求/响应预处理后处理（编码、日志）；Interceptor 更细粒度控制 Controller 方法（权限、性能监控）

## 三、可能追问

1. 「Filter 能不能拿到 Spring Bean？」→ 不能直接注入，需通过 `ApplicationContext` 等间接获取；Interceptor 可以
2. 「多个 Filter / Interceptor 的顺序怎么定义？」→ Filter 用 `@Order` 或注册 Bean 顺序；Interceptor 按注册顺序
3. 「什么时候用 Filter 什么时候用 Interceptor？」→ 全局通用（编码/跨域/安全）用 Filter；跟业务/Controller 相关的细粒度处理用 Interceptor
4. 「共同点和能否共存？」→ 都做横切处理；实际请求两者可共存、分层协作（Filter 更外层、Interceptor 更内层贴近业务）
5. 「Filter 能拦静态资源吗？Interceptor 呢？」→ Filter 能，Interceptor 不能
6. 「Spring Boot 3.x 与 2.x 的 Filter 包名差异？」→ `javax.servlet` → `jakarta.servlet`

## 四、相关页面

- [[Spring Boot 核心与自动装配]] — Spring MVC 自动配置（DispatcherServlet 等）
- [[Spring Boot 常用注解]] — `@Controller`/`@RestController` 请求层注解
- [[wiki/编程/spring/spring/Spring 核心特性]] — Spring MVC 模块