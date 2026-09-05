---
title: 微服务核心组件（Spring Cloud 全家桶）
tags:
  - Java
  - Spring Cloud
  - 微服务
  - Nacos
  - Gateway
  - Sentinel
created: 2026-08-25
updated: 2026-08-25
---

# 微服务核心组件（Spring Cloud 全家桶）

> 微服务架构 = 一组**解决"跨服务协作难题"的公共组件**：注册中心、负载均衡、服务通信、配置中心、日志管理、链路追踪、服务保护。核心主线：**每个组件解决微服务一个特定痛点**。

## 一、这是什么

回答"用过哪些微服务组件"时，按**组件→解决什么问题→典型实现**梳理，体现你对微服务治理全景的了解。

## 二、核心内容：七大组件（各自解决什么问题）

| 组件 | 解决什么问题 | 典型实现 |
| :--- | :--- | :--- |
| **注册中心** | 如何发现新节点、检查节点运行状态 | Nacos / Eureka |
| **负载均衡** | 服务发现后从多个可用节点中选一个 | Spring Cloud LoadBalancer（原 Ribbon） |
| **服务通信** | 服务间如何消息通信（封装 REST 细节） | OpenFeign / RestTemplate / Dubbo |
| **配置中心** | 如何集中管理各节点配置文件 | Nacos Config / Spring Cloud Config |
| **集中式日志** | 如何收集各节点日志并统一管理 | ELK / EFK |
| **链路追踪** | 如何直观了解节点间调用链路 | Sleuth + Zipkin |
| **服务保护** | 如何链路保护、避免服务雪崩 | Sentinel / Resilience4j（原 Hystrix） |

### 2.1 各组件要点

1. **注册中心（最核心）**：节点启动时登记服务名/IP/端口，注册中心**定时检查运行状态**（**心跳机制**），解决"如何发现新节点并检查可用性"。
2. **负载均衡**：调用方先以**服务名**查注册中心、得到**可用节点列表（服务发现）**，再内置负载均衡器**选节点**发起请求。
3. **服务通信**：用轻量级协议（通常 HTTP RESTful）；因过于灵活需封装约束——Spring Cloud 用 **Feign/RestTemplate** 屏蔽底层细节，基于统一 SDK 开发利协作。
4. **配置中心**：把各节点配置文件从服务中**剥离、集中存到配置中心**，避免几十个节点逐个改；一般带 UI 便于集群调整。
5. **集中式日志**：应用日志默认分散在部署节点，搭建 ELK/EFK 按节点抓取增量日志做统计报表。
6. **链路追踪**：一个复杂流程可能连调多个微服务，用可视化链路图展现每个调用，帮助定位瓶颈和出错服务。
7. **服务保护**：某微服务高延迟/线程池满载/处理失败时，快速**降级**，避免级联雪崩（见 [[服务熔断与 Hystrix]]、[[服务降级]]）。

### 2.2 Spring Cloud Alibaba 各组件落地

| 组件 | Spring Cloud Alibaba 实现 |
| :--- | :--- |
| 注册中心 / 配置中心 | **Nacos**（动态服务发现 + 服务配置 + 元数据 + 流量管理；配置存储到指定数据库） |
| 负载均衡 | 早期 **Ribbon**，**2020.x+ 切换 Spring Cloud LoadBalancer**，可结合 Nacos 权重/健康元数据做加权 |
| 服务通信 | **OpenFeign**（社区维护分支，Netflix Feign 已停更）+ **Dubbo**（自家 RPC 框架备选） |
| API 网关 | **Spring Cloud Gateway**（与原生 SpringCloud 相同） |
| 日志管理 | ELK 之外可选**阿里云日志服务（LOG）** |
| 链路追踪 | **Sleuth / Zipkin Server**（与原生相同） |
| 服务保护 | **Sentinel**（功能比 Hystrix 更强更优雅、UI 更好） |

> 一句话：Alibaba 全家桶里 **Nacos 兼任注册中心与配置中心**、**Sentinel 接手服务保护**、**LoadBalancer 替代 Ribbon** 是"新旧对比"常考点。

## 三、可能追问

1. 「注册中心怎么保证已登记节点可用？」→ **心跳机制**定时检查，失活节点剔除
2. 「Ribbon 现在还用吗？替代？」→ 已停更，Spring Cloud LoadBalancer（Alibaba 2020.x+ 切换）
3. 「Feign 和 RestTemplate 区别？」→ 都是服务通信；Feign 声明式接口（配注解）、RestTemplate 编程式
4. 「Sentinel 和 Hystrix 选谁？」→ Sentinel 功能更强（熔断降级限流流量整形 + 更好 UI），Hystrix 已停更
5. 「网关（Gateway）的作用？」→ 统一入口：路由转发、鉴权、限流、聚合
6. 「Nacos 和 Eureka 区别？」→ Nacos 兼注册+配置中心、支持 CP/AP 切换、Ali；Eureka 仅注册中心（AP）
7. 「链路追踪原理？」→ Sleuth 生成 traceId/spanId 透传 + Zipkin 汇聚展示

## 四、相关页面

- [[Spring Cloud 与 Spring Boot 的区别]] — 微服务全家桶的定位
- [[服务熔断与 Hystrix]]、[[服务降级]] — 服务保护细节
- [[负载均衡算法与一致性哈希]] — 负载均衡算法
- [[wiki/编程/spring/springboot/Spring Boot 核心与自动装配]] — 单个微服务构建