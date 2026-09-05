---
title: Spring Boot 常用注解
tags:
  - Java
  - Spring
  - Spring Boot
  - 注解
created: 2026-08-25
updated: 2026-08-25
---

# Spring Boot 常用注解

> Spring Boot 注解 = 组合入口（`@SpringBootApplication`）+ 分层注解（`@Controller`/`@RestController`/`@Service` 等）+ 装配（`@Autowired`）+ 配置（`@Configuration`/`@Bean`/`@Value`）+ 请求映射（`@RequestMapping` 一族）。

## 一、这是什么

回答"Spring Boot 有哪些重要注解？"时，按**用途分组**说，比零散背更显条理。重点：`@SpringBootApplication` 是组合注解（入口 + 自动配置 + 扫描）。

## 二、核心内容

### 2.1 重要注解分组

**① 入口 / 组合注解**
| 注解 | 作用 |
| :--- | :--- |
| `@SpringBootApplication` | 标注主程序类，应用入口；同时启用自动配置和组件扫描（= `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`） |

**② 分层组件注解**
| 注解 | 作用 |
| :--- | :--- |
| `@Controller` | 控制器类，处理 HTTP 请求 |
| `@RestController` | `@Controller` + `@ResponseBody` 组合，返回 RESTful 数据 |
| `@Service` | 业务逻辑层 |
| `@Repository` | 数据访问层 |
| `@Component` | 通用 Spring 组件 |

**③ 装配注解**
| 注解 | 作用 |
| :--- | :--- |
| `@Autowired` | 自动装配 Spring Bean |
| `@Value` | 注入配置属性值 |

**④ 请求映射注解**
| 注解 | 作用 |
| :--- | :--- |
| `@RequestMapping` | 映射 HTTP 请求路径到处理方法 |
| `@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping` | 简化 HTTP 方法专属映射 |

### 2.2 配置相关注解

| 注解 | 作用 |
| :--- | :--- |
| `@Configuration` | 指定类为配置类，其中 Bean 由容器管理 |
| `@Bean` | 声明一个 Bean 实例（通常与 `@Configuration` 配合，标注在方法上，方法返回值入容器） |

## 三、可能追问

1. 「`@SpringBootApplication` 由哪些注解组合？」→ 三者：配置 + 自动配置 + 组件扫描
2. 「`@Controller` 和 `@RestController` 区别？」→ RestController = Controller + ResponseBody，直接返回 JSON/Restful
3. 「`@Configuration` 和 `@Component` 的区别？」→ Configuration 是配置类容器、内部可用 `@Bean`；Component 是普通组件（详见 [[wiki/编程/spring/spring/Spring 常用注解]]）
4. 「`@Value` 和 `@ConfigurationProperties` 区别？」→ Value 注入单个属性；ConfigurationProperties 绑定一组配置到对象
5. 「`@Autowired` 找不到/多个 Bean 怎么办？」→ `@Primary`/`@Qualifier`

## 四、相关页面

- [[Spring Boot 核心与自动装配]] — `@EnableAutoConfiguration` 自动配置原理
- [[wiki/编程/spring/spring/Spring 常用注解]] — 上层 Spring 框架注解
- [[wiki/编程/spring/spring/Spring 核心特性]]