---
title: Spring Cloud 与 Spring Boot 的区别
tags:
  - Java
  - Spring
  - Spring Cloud
  - Spring Boot
  - 微服务
created: 2026-08-25
updated: 2026-08-25
---

# Spring Cloud 与 Spring Boot 的区别

> **Spring Boot 用于构建单个 Spring 应用，Spring Cloud 用于构建分布式系统的微服务架构**。两者是"零件与图纸"的关系：Boot 造每个微服务，Cloud 把这些服务编排成微服务体系的公共能力。核心主线：**Boot 是单体服务脚手架，Cloud 是微服务治理全家桶。**

## 一、这是什么

微服务面试的基础定位题。回答时先一句话划分**单体 vs 分布式**的职责，再讲如何**结合使用**。

## 二、核心内容

### 2.1 定位对比

| 维度 | Spring Boot | Spring Cloud |
| :--- | :--- | :--- |
| 定位 | 构建**单个** Spring 应用的框架 | 构建**分布式/微服务**架构的治理工具集 |
| 解决问题 | 快速搭建/配置单个服务 | 微服务之间的**注册发现、负载均衡、熔断、网关**等 |
| 关系 | 是 Spring Cloud 微服务的**基础件** | 建立在 Boot 之上的**微服务治理层** |

### 2.2 如何结合使用

> 两者不是替代，而是**分层配合**：用 **Spring Boot 构建微服务应用**，再用 **Spring Cloud 实现微服务架构中的各类功能**（服务注册与发现、负载均衡、断路器、网关等）。

- 每个微服务是一个 Boot 应用
- Spring Cloud 为这些 Boot 应用提供**公共的分布式能力**

### 2.3 一句话记忆

> **Spring Boot = 单机服务脚手架；Spring Cloud = 微服务全家桶（治理能力集）。Boot 造零件，Cloud 拼机器。**

## 三、可能追问

1. 「Spring Cloud 的核心组件有哪些？」→ 注册中心（Nacos/Eureka）、负载均衡（LoadBalancer）、服务通信（Feign/OpenFeign）、配置中心（Nacos/Config）、网关（Gateway）、熔断降级（Resilience4j/Sentinel，见 [[微服务核心组件（Spring Cloud 全家桶）]]）
2. 「Spring Cloud 建立在 Boot 上，为什么？」→ Boot 负责快速的单服务构建，Cloud 专注跨服务的治理
3. 「Spring Cloud 有哪些子项目？」→ Config、Gateway、OpenFeign、Sleuth、Bus 等
4. 「Netflix 那套（Eureka/Ribbon/Hystrix）现在还用吗？」→ 多数已停更/迁移（Hystrix→Resilience4j/Sentinel、Ribbon→Spring Cloud LoadBalancer）

## 四、相关页面

- [[wiki/编程/spring/springboot/Spring Boot 核心与自动装配]] — Boot 单服务能力
- [[微服务核心组件（Spring Cloud 全家桶）]] — Cloud 完整组件地图
- [[服务熔断与 Hystrix]]、[[服务降级]]、[[负载均衡算法与一致性哈希]]