---
title: Jakarta Validation 参数校验实战
tags:
  - Java
  - Jakarta Validation
  - Hibernate Validator
  - Spring Boot
  - 校验
  - 注解
created: 2026-08-22
updated: 2026-08-22
---

# Jakarta Validation 参数校验实战

> Jakarta Validation 是 Java 生态里的**数据校验标准规范**。核心是把参数规则写死在模型/注解上、错误返回集中处理，让业务代码少写重复的 `if` 判断。本文覆盖从常用注解、`@Valid`/`@Validated`、分组/级联/集合校验，到自定义注解、全局异常处理的完整链路。

## 一、这是什么

### 1. 概念与价值

在请求对象、实体对象、方法参数上加校验注解，接口入口处触发校验，请求参数不符合规则时 Spring 在进入业务方法前抛出校验异常。

```java
public record CreateUserRequest(
        @NotBlank(message = "用户名不能为空") String username,
        @Email(message = "邮箱格式不正确") String email,
        @Min(value = 18, message = "年龄不能小于18岁") Integer age
) {}

@PostMapping("/users")
public Long create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

**价值**：规则写在模型上、错误集中返回，少写重复 `if`。

### 2. 三个名字的关系

| 名称 | 角色 | 说明 |
| --- | --- | --- |
| Jakarta Validation | 规范 | 定义注解、API、校验模型 |
| Hibernate Validator | 实现 | Jakarta Validation 的参考实现 |
| Spring Boot | 集成方 | 自动配置 Validator，并接入 Web/Service 场景 |

一句话：**Jakarta Validation 定规则，Hibernate Validator 执行规则，Spring Boot 把校验接进流程。**

包名历史：Java EE / Bean Validation 老项目用 `javax.validation.*`；Jakarta EE / Spring Boot 3+ 用 `jakarta.validation.*`。

### 3. Maven 依赖

Spring Boot 项目直接引入 starter（自带 API + Hibernate Validator）：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

普通 Java 项目引入 `hibernate-validator`，部分 SE 场景还需 `org.glassfish.expressly`（消息插值）。Spring Boot 项目优先交给 Boot 依赖管理，不手写版本。

## 二、核心内容

### 1. 常用内置注解

| 注解 | 适用场景 | 说明 |
| --- | --- | --- |
| `@NotNull` | 任意对象 | 不能为 `null` |
| `@NotEmpty` | 字符串/集合/数组/Map | 不能 `null`，且长度/大小不能为 0 |
| `@NotBlank` | 字符串 | 不能 `null`，去空白后非空 |
| `@Size` | 字符串/集合/数组/Map | 限制长度或大小 |
| `@Min`/`@Max` | 整数等 | 最小/最大值 |
| `@DecimalMin`/`@DecimalMax` | `BigDecimal` | 适合金额、比例 |
| `@Positive`/`@PositiveOrZero` | 数字 | >0 / ≥0 |
| `@Negative` | 数字 | <0 |
| `@Digits` | 数字 | 限制整数位和小数位 |
| `@Email` | 字符串 | 邮箱格式 |
| `@Pattern` | 字符串 | 正则 |
| `@Past`/`@Future` | 日期时间 | 过去/未来（另有 `OrPresent` 变体） |
| `@AssertTrue`/`@AssertFalse` | 布尔 | 必须 true/false |

**三兄弟辨析**（`@NotNull`/`@NotEmpty`/`@NotBlank`）：

| 注解 | `null` | 空串 `""` | 空白串 `"   "` |
| --- | --- | --- | --- |
| `@NotNull` | 不通过 | 通过 | 通过 |
| `@NotEmpty` | 不通过 | 不通过 | 通过 |
| `@NotBlank` | 不通过 | 不通过 | 不通过 |

选型：字符串必填用 `@NotBlank`；集合必填用 `@NotEmpty`；数字/日期/对象必填用 `@NotNull`。

### 2. `@Valid` vs `@Validated`

| 注解 | 来源 | 常见用途 |
| --- | --- | --- |
| `@Valid` | Jakarta Validation | 触发对象校验、级联校验 |
| `@Validated` | Spring | 触发分组校验、方法参数校验 |

- JSON 请求体用 `@Valid`（配 `@RequestBody`）。
- 分组校验用 `@Validated(XxxGroup.class)`。
- 校验普通参数（`@RequestParam`/`@PathVariable`）时，**Controller 类或方法要加 `@Validated`**。

```java
@Validated @RestController
@RequestMapping("/api/users")
public class UserQueryController {
    @GetMapping("/{id}")
    public String getById(@PathVariable @Min(value=1, message="用户ID需要大于0") Long id) {
        return "user-" + id;
    }
}
```

### 3. 全局异常处理

用 `@RestControllerAdvice` 统一包装错误结果，避免默认错误响应直接暴露给前端。

核心是处理三类异常（一起覆盖，不同 Spring 版本/注解位置抛法不同）：

| 异常 | 常见来源 |
| --- | --- |
| `MethodArgumentNotValidException` | `@RequestBody` 对象校验失败 |
| `ConstraintViolationException` | Service 方法参数、部分普通参数校验失败 |
| `HandlerMethodValidationException` | Spring MVC 方法参数校验失败 |

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleRequest(MethodArgumentNotValidException ex) {
        List<FieldErrorItem> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new FieldErrorItem(e.getField(), e.getDefaultMessage())).toList();
        return new ApiErrorResponse("VALIDATION_FAILED", "参数校验失败", errors);
    }
    // ConstraintViolationException / HandlerMethodValidationException 类似
}
```

### 4. 分组校验

新增/修改规则不同（如新增无 `id`、修改需 `id`）时用分组接口标记：

```java
public interface CreateGroup {}   // 新增组
public interface UpdateGroup {}   // 修改组

public record UserRequest(
        @NotNull(message = "用户ID不能为空", groups = UpdateGroup.class) Long id,
        @NotBlank(message = "用户名不能为空", groups = {CreateGroup.class, UpdateGroup.class}) String username
) {}

@PostMapping public String create(@Validated(CreateGroup.class) @RequestBody UserRequest r) {...}
@PutMapping  public String update(@Validated(UpdateGroup.class) @RequestBody UserRequest r) {...}
```

> 规则差异小用分组；**字段差异大时拆成 `CreateUserRequest`/`UpdateUserRequest` 两个 DTO 更清楚**。

### 5. 级联校验

对象嵌套对象时，嵌套字段必须加 `@Valid` 才会继续深入校验：

```java
public record CreateOrderRequest(
        @NotBlank(message = "订单号不能为空") String orderNo,
        @Valid @NotNull(message = "收货地址不能为空") AddressRequest address  // 没 @Valid 则不会校验 province/city/detail
) {}
```

### 6. 集合和泛型元素校验

```java
public record SubmitOrderRequest(
        @NotEmpty(message = "订单明细不能为空") List<@Valid OrderItemRequest> items,  // 列表非空 + 校验每个对象
        List<@NotNull(message = "优惠券ID不能为空") Long> couponIds                   // 校验每个元素非 null
) {}
```

| 写法 | 含义 |
| --- | --- |
| `@NotEmpty List<X> items` | 列表本身非空且至少一个元素 |
| `List<@Valid X> items` | 校验列表里每个对象 |
| `List<@NotNull Long> ids` | 校验列表里每个元素不能 null |

### 7. Service 方法参数校验

Service 类加 `@Validated`，Spring 通过代理触发方法参数校验（适合内部服务、定时任务、消息消费入口）：

```java
@Validated @Service
public class UserQueryService {
    public String getUsername(@Min(value = 1, message = "用户ID需要大于0") Long userId) {...}
}
```

> ⚠️ **同一个类内部直接调用本类方法会绕过代理，校验不触发**。需把被校验方法放到另一个 Bean 或通过代理对象调用。（这与 Spring AOP 内部方法失效是同一机制，见 [[wiki/编程/spring/springboot/Spring AOP 能力边界与 JoinPoint]]）

### 8. 自定义校验注解

内置注解覆盖不了的业务规则（如手机号格式）可封装成自定义约束：

```java
@Documented
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface PhoneNumber {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;                    // null 当通过
        return PHONE_PATTERN.matcher(value).matches();
    }
}
```

> **关键设计**：自定义校验器通常把 `null` 当通过——必填与否交给 `@NotNull`/`@NotBlank` 表达。这样同一个 `@PhoneNumber` 既能用于必填手机号也能用于非必填。

### 9. 类级别校验（跨字段规则）

规则需同时看多个字段（如开始时间 ≤ 结束时间）时，在**类**上加自定义注解：

```java
@Target(ElementType.TYPE) @Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DateRangeValidator.class)
public @interface ValidDateRange {...}

@ValidDateRange
public record ActivityRequest(LocalDateTime startTime, LocalDateTime endTime) {}

public class DateRangeValidator implements ConstraintValidator<ValidDateRange, ActivityRequest> {
    public boolean isValid(ActivityRequest v, ConstraintValidatorContext c) {
        if (v == null || v.startTime() == null || v.endTime() == null) return true;
        return !v.startTime().isAfter(v.endTime());
    }
}
```

### 10. 手动校验（脱离 Spring）

```java
ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
Validator validator = factory.getValidator();
Set<ConstraintViolation<RegisterCommand>> violations = validator.validate(command);
// 遍历 violation.getPropertyPath() + violation.getMessage()
```

### 11. 错误消息与国际化

`message` 可写中文，也可写 key 并在 `src/main/resources/ValidationMessages.properties` 配置：

```java
@NotBlank(message = "{user.username.notBlank}")
```
```properties
user.username.notBlank=用户名不能为空
user.email.invalid=邮箱格式不正确
```

Spring Boot 还会结合应用的 `MessageSource` 解析消息，可与 `messages.properties`/`messages_zh_CN.properties` 统一管理。

### 12. Fail Fast（只返回第一个错误）

默认返回一个对象的所有错误；只想返回第一个错误时开启 Hibernate Validator 的 fail fast：

```java
@Bean
public ValidationConfigurationCustomizer validationConfigurationCustomizer() {
    return configuration -> {
        if (configuration instanceof HibernateValidatorConfiguration hc) {
            hc.failFast(true);
        }
    };
}
```

> 多错误返回适合表单场景一次展示全部问题；单错误适合移动端弹窗、命令式接口、对响应体大小敏感的场景。

### 13. 与 JPA 实体校验的关系

Jakarta Validation 可放 JPA 实体上，Hibernate ORM 在持久化生命周期也会触发校验。但 **Web 接口更推荐用专门的请求 DTO**：`CreateUserRequest` 管接口入参、`UserEntity` 管数据库映射。接口字段和数据库字段常不一致，把规则全堆实体上易被不同接口场景互相影响。

## 三、如何应用（常见问题避坑）

| 现象 | 原因/处理 |
| --- | --- |
| 引入注解但校验不生效 | 缺 starter；`@RequestBody` 前无 `@Valid`/`@Validated`；普通参数缺类级 `@Validated`；Service 内部调用本类方法；嵌套对象缺 `@Valid` |
| `int` 加 `@NotNull` 无效 | `int` 是基本类型，默认 `0` 永不 null；必填用包装类型 `Integer` |
| `@NotBlank` 用在 `Integer` 上报错 | `@NotBlank` 仅字符串；数字必填用 `@NotNull`，范围用 `@Min`/`@Positive` |
| 每个接口手动处理错误麻烦 | 用 `@RestControllerAdvice` 全局统一返回；`BindingResult` 仅适合少量特殊接口 |

**实践建议速查**：

| 场景 | 建议 |
| --- | --- |
| Web JSON 入参 | DTO 写约束，Controller 参数用 `@Valid` |
| 普通参数 | Controller 类或 Service 类用 `@Validated` |
| 增改规则差异小 | 分组校验 |
| 增改字段差异大 | 拆成不同请求 DTO |
| 嵌套对象 | 嵌套字段加 `@Valid` |
| 集合元素 | `List<@Valid Item>` 或 `List<@NotNull Long>` |
| 业务格式规则 | 封装自定义注解 |
| 错误返回 | `@RestControllerAdvice` 统一处理 |
| JPA 实体 | 避免把所有接口规则压到实体上 |

**运行时换算**：`@Validated`/AOP 中介模型 → Java 字节码/切面（见相关页面）。

## 四、小结与相关页面

核心是**声明式校验**：简单字段规则用内置注解 → 跨字段规则用类级别自定义注解 → 业务格式规则用自定义约束 → 接口错误返回交给全局异常处理。

Spring Boot 常见组合：`spring-boot-starter-validation` + DTO 约束注解 + Controller `@Valid`/`@Validated` + Service `@Validated` + `@RestControllerAdvice`。这样参数校验、业务逻辑、错误返回分得清楚，代码易维护。

### 相关页面

- [[wiki/编程/spring/springboot/Spring AOP 能力边界与 JoinPoint]] — Service 方法校验失效与 AOP 内部调用失效是同一代理机制
- [[反射在你平时写代码或者框架中的应用场景有哪些？]] — 自定义注解常配反射在切面读取
- [[raw/编程笔记/java/Java Jakarta Validation 实战指南：从参数校验到分组、自定义注解和全局异常处理]] — 原始文章