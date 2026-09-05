---
title: Spring Bean 生命周期与作用域
tags:
  - Java
  - Spring
  - Bean
  - 生命周期
  - 作用域
created: 2026-08-25
updated: 2026-08-25
---

# Spring Bean 生命周期与作用域

> Spring Bean 的生命周期**完全由 IoC 容器控制**：从实例化 → 属性注入 → Aware 回调 → 初始化 → 就绪 → 销毁，每一步都有可介入的钩子。**作用域决定 Bean 的存活范围与创建时机**；关键区别是 Spring 只管理单例 Bean 的完整生命周期（含销毁），prototype 交给调用者。

## 一、这是什么

回答"Bean 生命周期"或"Bean 作用域"时，一个讲**容器怎么走完一生**，一个讲**Bean 活多久/有几个**。两者都指向同一个本质：生命周期的控制权掌握在容器手里。

## 二、核心内容

### 2.1 Bean 生命周期（九步流程）

1. **启动加载与实例化**：Spring 查找并加载需要被管理的 Bean，进行实例化
2. **属性注入**：把依赖的引用和值注入到 Bean 的属性中
3. **BeanNameAware**：若 Bean 实现 `BeanNameAware`，Spring 把 Bean 的 Id 传给 `setBeanName()`
4. **BeanFactoryAware**：若实现 `BeanFactoryAware`，调用 `setBeanFactory()` 传入容器实例
5. **BeanPostProcessor#postProcessBeforeInitialization**：Spring 调用所有 `BeanPostProcessor` 的 `postProcessBeforeInitialization()`。这一步内部包含两个子动作：
	1. 若实现 `ApplicationContextAware`，其 `setApplicationContext()` 由内置的 `ApplicationContextAwareProcessor` 完成调用（探测到这个 Aware 才会触发）
	2. 若标注 `@PostConstruct`，由 `CommonAnnotationBeanPostProcessor` 调用该初始化方法（**早于 afterPropertiesSet**）
6. **InitializingBean#afterPropertiesSet / init-method**：若实现 `InitializingBean`，Spring 调用其 `afterPropertiesSet()`；类似地，若 bean 用 `init-method` 声明了初始化方法，该方法也会被调用
7. **BeanPostProcessor#postProcessAfterInitialization**：Spring 调用所有 `BeanPostProcessor` 的 `postProcessAfterInitialization()`，初始化完成后再做一轮增强（**AOP 代理就是在这个阶段产生的**）
8. **就绪使用**：Bean 已准备就绪，可以被应用程序使用，一直驻留在应用上下文中直到上下文被销毁
9. **销毁**（容器关闭时）：先调用 `@PreDestroy` 标注的方法（**同样由 `CommonAnnotationBeanPostProcessor` 触发**）→ 再若实现 `DisposableBean` 则调用其 `destroy()` → 最后若用 `destroy-method` 声明销毁方法也会被调用

> 记忆主线：**实例化 → 注入 → Aware → 前处理 → 初始化 → 后处理 → 使用 → 销毁**。`BeanPostProcessor` 的 before/after 像两张"插槽"，`@PostConstruct`/`@PreDestroy` 就挂在它们之间。

### 2.2 在 Bean 加载/销毁前后插入逻辑的四种方式

| 方式 | 初始化钩子 | 销毁钩子 | 说明 |
| :--- | :--- | :--- | :--- |
| **XML 属性** | `init-method` | `destroy-method` | `<bean init-method="init" destroy-method="destroy"/>` |
| **接口** | `InitializingBean#afterPropertiesSet` | `DisposableBean#destroy` | 实现 `org.springframework.beans.factory...` |
| **注解** | `@PostConstruct` | `@PreDestroy` | `javax.annotation.*`，最常用 |
| **@Bean 属性** | `@Bean(initMethod=...)` | `@Bean(destroyMethod=...)` | Java 配置方式 |

**初始化方法的执行顺序**：`@PostConstruct` → `afterPropertiesSet` → `init-method`。
**销毁方法执行顺序**：`@PreDestroy` → `destroy()` → `destroy-method`。

### 2.3 InitializingBean（个体初始化） vs BeanPostProcessor（全局增强）

这一个"针对单个 Bean"，一个"针对所有 Bean"：**个体初始化**是 Bean 用完属性之后，执行**自己独有的、内部的**检查或启动逻辑（例如检查必要字段是否为 null、开启内部定时任务）；**全局增强**是 Spring 容器留给开发者介入 Bean 创建过程的"后门"，对所有 Bean 统一作用。

- `postProcessBeforeInitialization`：在个体初始化**之前**执行，用于对 Bean 预处理（例如 `@PostConstruct`、`@Autowired` 的解析底层就依赖这个阶段）。
- `postProcessAfterInitialization`：在个体初始化**之后**执行，用于生成代理对象（例如 Spring AOP 的 `@Transactional` 就是在这一步把原始 Bean 替换为 CGLIB/JDK 代理对象的）。

| 维度       | InitializingBean                  | BeanPostProcessor                         |
| :------- | :-------------------------------- | :---------------------------------------- |
| **作用对象** | 针对单个 Bean（哪个 Bean 实现，就作用于哪个 Bean） | 针对所有 Bean（容器级的全局拦截器）                      |
| **触发主体** | 由特定的 Bean 实例**主动实现接口**回调          | 由 Spring 容器在 Bean 实例化过程中**被动调用**          |
| **核心目的** | 执行该 Bean 自身的自定义初始化逻辑（属性赋值后的补充处理）  | 对所有 Bean 进行通用的增强、代理包装、属性注入校验等（**AOP 基石**） |
| **耦合度**  | 侵入式强（Bean 需实现 Spring 专有接口）        | 同样是侵入式，但属于基础设施接口，通常用于框架级开发                |

### 2.4 Bean 作用域（Scope）

作用域定义 Bean 的**生命周期与可见性**，影响容器如何创建/销毁实例、是否可多用户共享。

| 作用域 | 每个作用域内实例数 | 生效范围 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **Singleton（默认）** | 整个应用 1 个 | 全应用 | 无状态 Bean（Service/DAO） |
| **Prototype** | 每次请求新建 | 全应用 | 状态瞬时、有状态 Bean |
| **Request** | 每个 HTTP 请求 1 个 | 仅 Web 应用 | Web 中需求局部性的 Bean |
| **Session** | 每个 Session 1 个 | 仅 Web 应用 | 与用户会话相关的 Bean |
| **Application** | 每个 ServletContext 1 个 | 仅 Web 应用 | 应用级共享 Bean |
| **WebSocket** | 每个 WebSocket 会话 1 个 | 仅支持 WebSocket 的应用 | WebSocket 会话内共享 |
| **自定义** | 由实现 `Scope` 接口决定 | 全应用 | 特殊场景 |

配置方式：
```xml
<bean id="myBean" class="com.example.MyBeanClass" scope="singleton"/>
```
```java
@Bean
@Scope("prototype")
public MyBeanClass myBean() { return new MyBeanClass(); }
```

### 2.5 单例 vs 非单例的生命周期差异

**结论**：不一样。Spring 只管理单例 Bean 的**完整**生命周期；prototype 的 Bean 创建好交给调用者后，Spring 不再管理后续生命周期。

| 维度 | Singleton（单例） | Prototype（多例） |
| :--- | :--- | :--- |
| 创建时机 | 容器启动时（或首次请求） | 每次请求创建新实例 |
| 初始化流程 | 完整执行（注入、Aware、初始化） | 每次新建都执行（仅到初始化完成） |
| 销毁时机 | 容器关闭时销毁（触发 DisposableBean/destroy-method） | **容器不管理销毁**，调用者自行释放 |
| 内存占用 | 单实例常驻，高效但注意线程安全 | 每次新实例，开销大，需手动释放 |
| 适用场景 | 无状态服务（Service/DAO） | 有状态对象（用户会话、临时计算） |

## 三、可能追问

1. 「`@PostConstruct`、`afterPropertiesSet`、`init-method` 的执行顺序？」→ 见 2.2
2. 「Aware 接口有什么用？」→ 让 Bean 获取容器（BeanFactory）、名字、上下文等能力
3. 「AOP 代理在生命周期哪一步产生？」→ BeanPostProcessor 的 `postProcessAfterInitialization`
4. 「单例 Bean 是线程安全的吗？」→ 单例被多线程共享，无状态安全、有状态需同步/ThreadLocal
5. 「为什么 prototype 的生命周期 Spring 不管销毁？」→ 容器不跟踪、不知道何时不再使用，只能由调用者管理（与线程池/连接需手动 close 同理）
6. 「@Component 和 @Bean 声明的 Bean 生命周期一样吗？」→ 一样，都由容器走完整生命周期
7. 「作用域如何与循环依赖关联？」→ 只有单例 setter/字段注入能解循环依赖（见 [[Spring 循环依赖与三级缓存]]）

## 四、相关页面

- [[IoC 控制反转与依赖注入]] — IoC 与 Bean 生命周期掌控
- [[IoC 与 AOP 的实现机制]] — 容器机制与 Bean 管理
- [[Spring 循环依赖与三级缓存]] — 单例 Bean 创建过程的进阶
- [[Spring 常用注解]] — `@Bean(initMethod/destroyMethod)` 等配置注解
- [[Spring 事务失效场景]] — 单例 Bean 与代理边界