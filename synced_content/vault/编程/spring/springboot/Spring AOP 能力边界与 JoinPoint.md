---
title: Spring AOP —— 能力边界与 JoinPoint
tags:
  - Java
  - Spring
  - Spring Boot
  - AOP
  - 切面
created: 2026-08-22
updated: 2026-08-22
---

# Spring AOP —— 能力边界与 JoinPoint

> AOP 的认知分两个层次：**Spring AOP（基于动态代理）只针对方法执行**，而完整的 **AspectJ（基于字节码织入）连构造方法、字段读写都能拦截**。同时要分清 `JoinPoint`（只读观察者）与 `ProceedingJoinPoint`（能控制执行流程）的区别。

## 一、Spring AOP 的能力边界：只针对方法

问题是"Spring AOP 是不是只针对方法？"——答案是**视情况而定**：

- **Spring AOP 本身**：`@Around`、`@Before` 等通知**只能拦截 Spring 容器中 Bean 的方法执行**。
- **AOP 全貌（AspectJ）**：通过修改字节码，能拦截几乎所有"程序执行点"（Join Point），不限于方法。

### 1. 为什么 Spring AOP 只能拦截方法

Spring AOP 底层基于**动态代理**（JDK Proxy 或 CGLib），本质是"创建一个代理对象，劫持对原对象方法的调用"。它**无法劫持**不通过代理对象触发的操作：

- 字段（属性）的读写
- 对象的构造（`new User()`）
- 静态代码块的执行

```java
@Component
public class UserService {
    private String name = "默认"; // Spring AOP 无法拦截字段赋值

    public UserService() { // Spring AOP 无法拦截构造方法执行
        System.out.println("构造方法");
    }

    @RagTraceNode // 只有这个方法能被 @Around 拦截
    public void doSomething() {
        System.out.println("业务方法");
    }
}
```

### 2. AspectJ 还能拦截什么

| 拦截类型 | 切入点表达式 | 说明 |
| :--- | :--- | :--- |
| **构造方法调用/执行** | `execution(*.new(..))` | 拦截 `new User()` 的执行过程 |
| **字段读取** | `get(* *)` | 拦截读取属性值（如 `user.name`） |
| **字段赋值** | `set(* *)` | 拦截给属性赋值（如 `user.name = "张三"`） |
| **类初始化** | `staticinitialization(*)` | 拦截类的静态代码块执行 |
| **异常处理** | `handler(*)` | 拦截 `catch` 语句块被执行时 |
| **对象预处理** | `preinitialization(*)` | 拦截构造方法执行前的准备工作 |

> **注意**：实际企业开发中 **99% 的场景只用到了"方法执行"拦截**，因为业务逻辑主要封装在方法里；而且 AspectJ 需要额外的编译插件或类加载器，配置比 Spring AOP 复杂。

### 3. Spring 为什么"阉割"AOP

- **易用性**：动态代理是纯 Java 实现，不需要编译期特殊处理，契合 Spring 的"非侵入"理念。
- **性能**：代理在运行时创建，启动更快，对现有代码侵入性低。
- **够用**：Web 开发（事务、日志、权限校验）只需在 Service/Controller 方法前后加逻辑。

### 4. 一个迷惑点：`@annotation` 只匹配方法

`@annotation(traceNode)` 虽是 AspectJ 语法，但在 Spring AOP 运行时**只会匹配带有该注解的方法**，无法匹配带注解的**类或字段**。若有此类极端需求，需回退到 AspectJ 编译期织入。

### 5. 总结一句话

- 在当前技术栈（**Spring AOP**）：**是，只针对方法**。
- 跳出 Spring 看 AOP 全貌（**AspectJ**）：**不是，连构造方法、字段读写都能切**。
- 现阶段记住：**把 Spring AOP 当作方法拦截器用就不会出错。微服务链路追踪（如 SkyWalking 探针）底层常用 AspectJ 字节码增强，那里才能真正体会到"无所不切"。

## 二、JoinPoint 与 ProceedingJoinPoint

两者关系可理解为 **"儿子"与"父亲"**：`ProceedingJoinPoint` 是 `JoinPoint` 的子接口，继承其全部能力，并额外增加**控制目标方法执行**的权限。

### 1. 核心本质区别
- **JoinPoint（旁观者）**：只能**"看"**，不能**"动"**。可获取方法名、参数、目标对象等信息，但无法干预方法执行流程。
- **ProceedingJoinPoint（掌控者）**：既能**"看"**也能**"动手"**。唯一拥有 `proceed()` 方法，可决定**是否执行**、**何时执行**目标方法，甚至**修改入参**和**改变返回值**。

### 2. 对应的通知类型

| 参数类型 | 适用通知注解 | 特点 |
| :--- | :--- | :--- |
| **JoinPoint** | `@Before`、`@After`、`@AfterReturning`、`@AfterThrowing` | 这些通知无法阻止方法运行，只需只读信息，用父接口即可 |
| **ProceedingJoinPoint** | **仅限 `@Around`** | 只有环绕通知需在方法前后插逻辑并手动触发执行，必须用子接口 |

> **注意**：在 `@Around` 里写 `JoinPoint` 参数，Spring 会直接报错，因为 `@Around` 必须接收子类才能调用 `proceed()`。

### 3. 通用方法（两者都有，继承自 JoinPoint）

```java
// 1. 获取目标对象（原始类的实例）
Object target = joinPoint.getTarget();

// 2. 获取方法签名（方法名、返回类型、参数类型等）
Signature signature = joinPoint.getSignature();
String methodName = signature.getName();

// 3. 获取传入目标方法的参数（Object数组）
Object[] args = joinPoint.getArgs();

// 4. 获取静态部分（如被代理的类）
JoinPoint.StaticPart staticPart = joinPoint.getStaticPart();
```

### 4. ProceedingJoinPoint 独有的方法（父类没有）

- **`Object proceed()`**：直接执行目标方法，使用原始参数。
- **`Object proceed(Object[] args)`**：**以新的参数数组**执行目标方法，是实现**参数篡改**的关键。

**例子（篡改参数）：**
```java
@Around("@annotation(traceNode)")
public Object aroundNode(ProceedingJoinPoint joinPoint, RagTraceNode traceNode) throws Throwable {
    // 1. 获取原始参数
    Object[] originalArgs = joinPoint.getArgs();

    // 2. 假设第一个参数是String类型，强行改掉它
    if (originalArgs.length > 0 && originalArgs[0] instanceof String) {
        originalArgs[0] = "已被切面篡改的数据";
    }

    // 3. 调用 proceed(Object[] args) 传入修改后的参数
    return joinPoint.proceed(originalArgs);
}
```

### 5. 异常处理的差异（易踩坑）

- **JoinPoint 的方法**：不抛出 `Throwable`，因为方法执行前后异常已由目标方法抛出，切面无需处理。
- **ProceedingJoinPoint 的 `proceed()`**：**必须抛出 `Throwable`**。因为 `proceed()` 是切面代码里**主动调用**的，原始方法可能抛任何异常（包括 Error），需显式处理或向上抛出。
- 这也是 `@Around` 方法签名常写 `throws Throwable`，而 `@Before` 通常不需写异常的原因。

### 6. 执行流程对比

- **`@Before` + `JoinPoint`**：
  ```
  1. 切面开始（JoinPoint记录日志）
  2. 目标方法 doWork() 强制自动执行（无法阻拦）
  3. 切面结束
  ```
- **`@Around` + `ProceedingJoinPoint`**：
  ```
  1. 切面开始（写日志、开事务）
  2. 是否调用 joinPoint.proceed()？
     - 调用：目标方法执行并返回结果
     - 不调用：目标方法被完全跳过（如权限校验失败，返回null或抛异常）
  3. 可获取 proceed() 返回值，修改后再返回给调用方
  ```

### 7. 什么时候用哪个

| 判断维度 | 推荐使用 | 理由 |
| :--- | :--- | :--- |
| 只需方法前记录日志、校验参数（不篡改） | `@Before` + **`JoinPoint`** | 够用且更轻量，语义清晰 |
| 需要精准统计方法耗时 | `@Around` + **`ProceedingJoinPoint`** | 前后都要加时间戳，必须手动 `proceed()` |
| 需要阻止方法执行（如缓存命中直接返回） | `@Around` + **`ProceedingJoinPoint`** | 不调用 `proceed()` 即可跳过 |
| 需要修改返回值或修改入参 | `@Around` + **`ProceedingJoinPoint`** | 只有它能通过 `proceed(args)` 改入参、通过返回值改出参 |

**记忆口诀**：
>  `JoinPoint` 看家，`ProceedingJoinPoint` 当家。前者只读不干预，后者 `proceed` 定生死。

## 三、相关页面

- [[wiki/编程/spring/springboot/RagTraceAspect]] <!-- 若存在 -->
- [[反射在你平时写代码或者框架中的应用场景有哪些？]]