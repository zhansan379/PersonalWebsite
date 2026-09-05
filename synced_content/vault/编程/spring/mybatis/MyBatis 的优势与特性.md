---
title: MyBatis 的优势与特性
tags:
  - Java
  - MyBatis
  - ORM
  - SQL
  - 动态SQL
created: 2026-08-25
updated: 2026-08-25
---

# MyBatis 的优势与特性

> MyBatis 的强项集中在 **SQL 灵活性、动态 SQL 支持、结果集映射、插件扩展与 Spring 集成**，尤其适合重视 **SQL 可控性** 的项目。核心主线：**它是"半自动"ORM——SQL 由你掌控，映射交给框架。**

## 一、这是什么

回答"MyBatis 比其他 ORM 好在哪 / 优势特性"时，围绕"SQL 可控 + 灵活"这条线展开，并与**全自动 ORM（Hibernate）**作对比突显差异。

## 二、核心内容：五大优势

### 1. SQL 与代码解耦，灵活可控
- 可直接编写和优化 SQL，开发者明确知道每条 SQL 的执行逻辑，便于性能调优（对比 Hibernate 全自动，SQL 由框架生成、可控性差）。
```xml
<select id="findUserWithRole" resultMap="userRoleMap">
    SELECT u.*, r.role_name
    FROM user u
    LEFT JOIN user_role ur ON u.id = ur.user_id
    LEFT JOIN role r ON ur.role_id = r.id
    WHERE u.id = #{userId}
</select>
```

### 2. 动态 SQL 的强大支持
- 通过 `<if>`、`<choose>`、`<foreach>`、`<where>` 等标签动态拼 SQL，避免 Java 代码中繁琐的字符串拼接。
```xml
<select id="searchUsers" resultType="User">
    SELECT * FROM user
    <where>
        <if test="name != null">AND name LIKE #{name}</if>
        <if test="status != null">AND status = #{status}</if>
    </where>
</select>
```

### 3. 自动映射与自定义映射结合
- 自动将查询结果字段名与对象属性名匹配（如**驼峰转换**）；复杂关联用 `<resultMap>` 自定义（含 `<collection>` 处理一对多）。
```xml
<resultMap id="userRoleMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <collection property="roles" ofType="Role">
        <result property="roleName" column="role_name"/>
    </collection>
</resultMap>
```

### 4. 插件扩展机制
- 可编写插件拦截 SQL 执行过程（如 `Interceptor`），实现**分页、性能监控、SQL 改写**等通用逻辑。
```java
@Intercepts({
    @Signature(type = Executor.class, method = "query", args = {...})
})
public class PaginationPlugin implements Interceptor {
    // 实现分页逻辑
}
```

### 5. 与 Spring 生态无缝集成
- 通过 `@MapperScan` 快速扫描 Mapper 接口，结合 Spring 事务管理，配置简洁高效。
```java
@Configuration
@MapperScan("com.example.mapper")
public class MyBatisConfig {
    // 数据源和 SqlSessionFactory 配置
}
```

## 三、可能追问

1. 「MyBatis 和 Hibernate 怎么选？」→ 复杂 SQL/JDBC 优化场景用 MyBatis；对象模型简单、少写 SQL、重缓存场景用 Hibernate
2. 「MyBatis 是"半自动"ORM，体现在哪？」→ SQL 手动写、映射自动做
3. 「动态 SQL 常用标签有哪些？」→ `<if>`/`<choose>`/`<when>`/`<otherwise>`/`<foreach>`/`<where>`/`<set>`/`<trim>`
4. 「分页怎么做？有内置插件吗？」→ 手写 LIMIT 或加 PageHelper 分页插件（MyBatis-Plus 内置分页插件）
5. 「`<resultMap>` 和自动映射何时用哪个？」→ 字段名一致自动映射够用；关联/别名可自定义用 resultMap

## 四、相关页面

- [[MyBatis 与 JDBC 对比及优点]] — 相对 JDBC 的根本优势
- [[MyBatis 的占位符区别]] — SQL 参数安全问题
- [[MyBatis 与 MyBatis-Plus 的区别]] — 增强工具
- [[wiki/编程/spring/springboot/Spring Boot 核心与自动装配]] — `@MapperScan` 与 Starter 自动配置