---
title: 知识库目录
tags:
  - meta
  - index
created: 2026-05-26
updated: 2026-09-02
---

# 知识库目录

> 这是 LLM Wiki 知识库的导航入口。每次新增或修改 wiki 页面时，本文件应同步更新。

## 📚 LLM Wiki 方法论

关于知识库本身的方法论和规范。

- [[笔记/LLM Wiki]] — LLM Wiki 方法论概述
- [[笔记/三层架构]] — raw / wiki / CLAUDE.md 三层架构详解
- [[笔记/知识提取原则]] — 从 raw 提取知识到 wiki 的原则与流程

## 🌱 日常

生活健康与日常知识。

- [[日常/睡眠对日常的影响]] — 不同睡眠时长（1~12h）对身体的逐级影响
- [[日常/戒色恢复方法论]] — 成瘾机制、身心症状、恢复公式与戒色十阶段（来源：戒为良药 0）
- [[日常/戒色每日计划]] — 一日时间表、应急方案与每日打卡（来源：戒色恢复方法论）

## 💻 编程

LLM 应用开发及源码分析相关的知识。

- [[编程/agent/Agent 系统设计的三维框架：Prompt-Context-Harness]] — 【总纲】Agent 设计的核心方法论：Prompt→Context→Harness 三层递进，OpenClaw/ClaudeCode/Hermes 三系统对比；含 Agent Loop 极简本质（while true + stop_reason，工程量都在 Harness）🎯含面试层
- [[编程/agent/MCP面试答题思路与追问]] — MCP 面试答题框架：本质定位（协议层/系统集成）为主线、知识点清单、MCP vs Function Calling/REST 两组高频对比、7 类可能追问与应对 🎯含面试层
- [[编程/agent/提示词工程/Claude Code System Prompt 工程]] — System Prompt 的 7 层递进结构、反模式接种、爆炸半径框架、工具偏好映射、CLAUDE.md 多级发现 🎯含面试层
- [[编程/agent/上下文与记忆/01 Agent 记忆机制]] — Agent 记忆机制的全局视角：要考虑的问题、设计决策框架 🎯含面试层
- [[编程/agent/上下文与记忆/02 多轮对话记忆设计]] — 五种记忆策略详解、RAG Token 预算分配与生产部署 🎯含面试层
- [[编程/agent/上下文与记忆/03 Claude Code 上下文工程]] — Claude Code 的上下文构建、五级压缩流水线与前缀缓存体系 🎯含面试层
- [[编程/agent/上下文与记忆/04 Token 预算管理]] — Token 预算的精确计算：有效窗口、压缩触发水位线、Autocompact 工程细节 🎯含面试层
- [[编程/agent/上下文与记忆/05 System Prompt 缓存与动态组装]] — 三阶段组装管道、string[] 缓存分块、三种分块模式、Boundary 标记、Section 注册表 ⚠️ 页面尚未创建
- [[编程/agent/评测/Harness 工程搭建式 Agent 评测]] — 用 Claude Code 搭建评测 Harness，将评测逻辑从代码升级为 Prompt 🎯含面试层
- [[编程/agent/评测/RAG 评测方案对比（RAGAS vs Harness 式）]] — RAGAS 代码级框架 vs Harness Prompt 级方法论：本质区别、适用场景、组合方案 🎯含面试层
- [[编程/agent/RAG 系统的 Prompt-Context-Harness 落地指南]] — 三维框架逐层映射到 RAG 工程实现：Prompt 动态组装、三层文档压缩、事实核查 Hook、自进化闭环 ⚠️ 页面尚未创建
- [[编程/agent/未解决的问题]] — 关于 Agent 机制中尚未完全理解的细节与待验证假设 ⚠️ 页面尚未创建
- [[编程/rag/Agentic RAG 综述]] — RAG 发展历程与七大 Agentic RAG 架构
- [[编程/rag/RAG 综述（2024 经典论文）]] — RAG 三代范式、三维核心剖析、评估体系与未来方向（同济&复旦综述）
- [[编程/ragent/RAG 评测初始化与新增文档流程]] — RAG 评测 init 数据流：文档知识库划分 → 评估集设计 → 初始化三步 → 新增文档增量维护 ⚠️ 页面尚未创建
- [[知识库文档分块接口（startChunk）]] — 分块接口异步链路：接口拆分、CAS 防重、RocketMQ 事务消息、跨表原子写、事务边界与 9 道面试题（来源：知识库文档开始分块接口）
- [[项目/ragent/知识库定时同步（scheduleCron 调度架构）]] — URL 文档定时同步调度系统（上篇·基础设施层）：两张表（任务主表+执行历史表）、五组件职责分离、**数据库租约锁**（lockOwner/lockUntil+CAS 抢锁+lockToken 防误释放+自动心跳续锁看门狗+关键阶段锁失效检测，为何选 DB 而非 Redis、租约锁本质）、两级变更检测（HEAD 的 ETag/Last-Modified 快速短路 + SHA-256 兜底 + AutoCloseable 临时文件管理）、两层并发控制（任务级租约锁+文档级 CAS 抢占）；含 10 道面试题与答题主线；下篇（调度引擎/执行流程/异常恢复）待补（来源：深度解析知识库定时同步的架构设计）
- [[编程/spring/spring/Spring 面试整合：回答逻辑与追问预案]] — Spring 面试**导航总览页**：30 秒速答版 + 分板块「一句定调」表 + 链接到五个独立主题页；核心主线=**IoC 容器把对象生命权交给容器 + AOP 动态代理实现事务/日志/权限的无侵入注入**
- [[编程/spring/spring/Spring 核心特性]] — 对 Spring 的整体理解：四大特性（IoC 容器是地基/AOP 是关键扩展/事务管理/MVC 模块），30 秒回答版 + 4 条追问
- [[编程/spring/spring/IoC 控制反转与依赖注入]] — IoC 思想（生命周期"创建/初始化/销毁"反转）与 DI 实现：**IoC=思想/DI=编码技巧/DIP=设计原则三者区别**、DI 三方式（构造器推荐/setter/字段不推荐）、设计一个 IoC 六要点 + 5 条追问
- [[编程/spring/spring/IoC 与 AOP 的实现机制]] — 两条线：IoC 靠**反射+DI+工厂模式+容器**（BeanFactory/ApplicationContext）；AOP 靠**动态代理**（JDK/ CGLIB）+ 5 条追问
- [[编程/spring/spring/Spring AOP]] — AOP 大合集：解决什么（**弱共性 vs 强共性、多继承不足的弥补**）、术语表、三大应用场景、原理（JDK vs CGLIB）、动态/静态代理对比（**静态代理三大硬伤**）、注解 + 8 条追问
- [[编程/spring/spring/Spring 循环依赖与三级缓存]] — 三类循环依赖**只有"单例+setter/字段注入"被解决**；三级缓存结构与五步走查；**为什么必须三级、二级不够（兼容 AOP 代理、避免破坏单例）** + 6 条追问
- [[编程/spring/spring/Spring 事务失效场景]] — 事务失效**根本归因=代理没被正确触发**；六大失效场景表（try-catch/受检异常/ this 内部调用/非 public/传播属性/多数据源）+ **this 调用不生效必背结论** + 6 条追问
- [[编程/spring/spring/Spring Bean 生命周期与作用域]] — 生命周期九步（实例化→注入→Aware→BeanPostProcessor 前后→初始化→就绪→销毁）+ 四种回调方式（XML/接口/`@PostConstruct`/`@Bean`）与执行顺序（`@PostConstruct`→`afterPropertiesSet`→`init-method`）；七种作用域表；**单例 vs 多例生命周期差异**（Spring 只管理单例完整生命周期含销毁、prototype 交给调用者）+ 7 条追问
- [[编程/spring/springboot/Spring Boot 面试整合：回答逻辑与追问预案]] — Spring Boot 面试**整理文档**：核心主线=**约定大于配置（起步依赖+自动装配+条件注解）**；分主题「一句话定调→回答要点→追问预案」+ 30 秒速答版；含自动装配四层（入口`@SpringBootApplication`→核心`@EnableAutoConfiguration`→`AutoConfigurationImportSelector` 扫描/条件/排序→导入）与版本坑（spring.factories vs AutoConfiguration.imports、3.0 移除）
- [[编程/spring/springboot/Spring Boot 核心与自动装配]] — 为什么用 Boot/比 Spring 好（自动配置+内嵌服务器+Starter）；约定大于配置；**自动装配原理**（`@SpringBootApplication` 三组合注解、`AutoConfigurationImportSelector` 三大步、元数据文件 2.7 版本分界）；为什么"导入即用"（Starter/自动配置/条件注解）；常见 Starter 表 + 7 条追问
- [[编程/spring/springboot/Spring Boot 常用注解]] — 按用途分五组：入口（`@SpringBootApplication`）/分层（Controller/RestController/Service/Repository/Component）/装配（Autowired/Value）/配置（Configuration/Bean）/请求映射（RequestMapping 一族）+ 5 条追问
- [[编程/spring/springboot/Spring Boot 事务]] — `@Transactional` 即开；`TransactionAutoConfiguration` 自动启用；**默认只回滚 Runtime/Error、受检异常需 `rollbackFor=Exception.class`** + 4 条追问
- [[编程/spring/springboot/Spring Boot 过滤器与拦截器]] — Filter=Servlet 规范（全局含静态资源、3.x 起 jakarta）vs Interceptor=Spring MVC（仅 Controller 前后、可注入 Bean）；**完整链路**（Filter→DispatcherServlet→preHandle→Controller→postHandle→View→afterCompletion→Filter）+ 6 条追问
- [[编程/spring/springboot/Spring AOP 能力边界与 JoinPoint]] — Spring AOP 只拦方法 vs AspectJ 连构造/字段都能切；`JoinPoint`（只读）vs `ProceedingJoinPoint`（`proceed()` 定生死）
- [[编程/spring/mybatis/MyBatis 的优势与特性]] — 五大优势：SQL 解耦可控、动态 SQL、自动/自定义映射、插件扩展（分页/监控/改写）、Spring 集成；一句话定位=**半自动 ORM（SQL 你掌握、映射交给框架）** + 5 条追问
- [[编程/spring/mybatis/MyBatis 与 JDBC 对比及优点]] — 五大优点：SQL 编程灵活、代码量 -50%+（免手动开关连接）、JDBC 兼容所有数据库、易与 Spring 集成、ORM 映射；附 **JDBC 痛点对比表**（样板代码/耦合/手写映射/无动态 SQL）+ 6 条追问
- [[编程/spring/mybatis/MyBatis 的占位符区别]] — `#{}`=**预编译占位符**（PreparedStatement，防 SQL 注入、效率高、适值参数）；`${}`=**字符串拼接**（有注入风险、适表名/列名/排序等结构）+ 何时用 #/何时用 $ 判断 + 5 条追问
- [[编程/spring/mybatis/MyBatis 与 MyBatis-Plus 的区别]] — MP=MyBatis 增强工具库、只增强不改：BaseMapper 内置 CRUD、代码生成器、Wrapper 条件构造器、内置分页插件、多租户、更丰富注解 + 6 条追问
- [[编程/spring/springcloud/Spring Cloud 与 Spring Boot 的区别]] — 单体 vs 分布式定位：**Boot=单机服务脚手架，Cloud=微服务治理全家桶**；Boot 造零件、Cloud 拼机器 + 4 条追问
- [[编程/spring/springcloud/微服务核心组件（Spring Cloud 全家桶）]] — 七大组件（**解决什么问题**为主线）注册中心/负载均衡/服务通信/配置中心/日志/链路追踪/服务保护；SpringCloud Alibaba 落地（Nacos、LoadBalancer 替代 Ribbon、Sentinel 替代 Hystrix）+ 7 条追问
- [[编程/spring/springcloud/服务熔断与 Hystrix]] — 雪崩效应背景 + 保险丝类比；**Hystrix 默认触发条件（10s 滚动窗口/20 次请求/50% 错误率）**；熔断器三态（Closed/Open/Half-Open）+ 5 条追问
- [[编程/spring/springcloud/服务降级]] — 动机=**资源有限 vs 请求无限、舍小保大**；做法=策略性舍弃非核心 + 返回 fallback；**熔断/降级/限流三者对比表** + 4 条追问
- [[编程/spring/springcloud/负载均衡算法与一致性哈希]] — 六种算法表（轮询/加权/随机/加权随机/一致性哈希/最小活跃数）；**如何"固定一个用户"→一致性哈希（客户端 IP/参数哈希取模 + 哈希环/虚拟节点）** + 5 条追问
- [[编程/数据库/mysql/性能调优/MySQL EXPLAIN 详解]] — 执行计划分析工具：关键字段（possible_keys/key/key_len/rows）；**type 扫描类型**（All→index→range→ref→eq_ref→const）与 `extra` 信号（Using filesort/temporary/index 覆盖索引）+ 6 条追问
- [[编程/数据库/mysql/性能调优/MySQL 慢查询排查与优化方案]] — 六层优化清单：EXPLAIN 定位→建/优化索引→避免失效→SQL 优化（避免 SELECT \*/覆盖索引/小表驱动大表）→深分页优化（`id>n`）→表结构拆分→Redis 缓存（旁路缓存/先更库再删缓存）+ 7 条追问
- [[编程/数据库/mysql/索引/MySQL 索引分类]] — 四把尺子：数据结构（B+Tree/Hash/Full-text）、物理存储（聚簇存数据/二级存主键→引出回表与覆盖索引）、字段特性（主键/唯一/普通/前缀）、字段个数（单列/联合）；InnoDB 选列规则；**最左匹配原则**（可匹配 vs 失效例示、范围查询截断）+ 7 条追问
- [[编程/spring/spring/Spring 常用注解]] — `@Component` 一族（@Service/@Controller/@Repository 分层特例）+ @Autowired/@Configuration/@Bean；**@Repository 异常翻译加分点** + 6 条追问
- [[Query 改写与子问题拆分]] — 原理 + 工程 + 面试整合篇：检索端失忆、五种改写策略、拆分的意图覆盖、术语归一化（Cache-Aside + 长词优先）、一次 LLM 调用双输出、四层 JSON 容错、三层兜底、子问题并行意图分类、面试五步答题框架与四类追问预案
- [[会话记忆与摘要压缩]] — 原理 + 工程 + 面试整合篇：大模型无记忆本质、Token 膨胀、五种记忆策略、混合策略、三层架构、load 并行拉取 + 两路降级 + 滑动窗口（normalizeHistory）、loadAndAppend 先 load 后 append、摘要压缩三道门槛 + 水位线 lastMessageId + 攒批 + Redis 分布式锁 + 摘要只记话题不记答案、Token 预算房间模型、面试五步答题框架与五类追问预案
- [[项目/ragent/线程池使用规范与设计思想]] — ragent 并发模型设计思想（非实现清单）：**四条核心约定**（集中配置+TTL 包装跨线程透传 trace / 统一 CompletableFuture 提交适配扇出-扇入 / 队列拒绝策略按失败语义分两派—结果必返可回落用 CallerRuns、不能阻塞须快败用 Abort+限流器兜底 / 统一优雅停机+协作式中断恢复 interrupt 标记）+ 各自 Why + 新场景 6 条约定；含"名字带 Executor 的类多是顺序执行器勿误判为并发"提醒；源文档 [[raw/编程笔记/ragent/并发编程/线程池使用规范与设计分析]]
- [[编程/LLM/温度和 Top-k 是什么？如何影响输出？]] — 解码策略面试答题逻辑：温度对 Logits 缩放控制分布锐度、Top-k 三步（截断/-inf 掩码/重归一化）、执行顺序与 Top-p 换序的差异、30 秒速答版、四类高频追问与六个陷阱题
- [[MinerU2.5-Pro]] — 纯数据工程驱动的文档解析 SOTA，不改架构提升 2.71 分（上海 AI 实验室）
- [[MinerU2.5-Pro 数据引擎]] — DDAS、CMCV、Judge-and-Refine：覆盖率/信息量/准确性三维协同优化
- [[OmniDocBench 评估体系]] — 文档解析评估基准 v1.5→v1.6：MGAM 匹配修正与 Hard 子集
- [[文档解析方法分类]] — 管道方法、端到端 VLM、解耦 VLM 三种范式对比
- [[编程/java基础/面向对象/01 继承 封装 多态]] — 面向对象三大特性；多态重点：静态（重载）/动态（重写·接口）两种、向上转型与向下转型（`ClassCastException`）、多态解决的五大问题；含 Spring 多实现注入落地（`NoUniqueBeanDefinitionException` 启动期报错、四步候选解析、`@Primary`/`@Qualifier`/`@ConditionalOnProperty`/`Map` 四种方式选型）与面试速答
- [[编程/java基础/其他/Java 进程是怎么跟操作系统交互的？]] — 面试整合篇：四步回答骨架（JVM 本身是 OS 进程 → 列五大交互面 → 系统调用 & 用户态/内核态切换 → 缓冲优化+跨平台适配收尾）；核心要点（内存 `mmap`/`brk` 系统调用申请、平台线程 `pthread_create` 一对一 OS 线程 vs 虚拟线程用户态挂载体线程、IO `read`/`write`/`socket` + NIO 的 epoll(Linux)/IOCP(Windows)、JNI 调 C/C++、`SIGTERM` 与关闭钩子）；追问预案（JVM-OS 关系、系统调用与切换开销、虚拟 vs 平台线程、`new` 内存来源、NIO 高性能原理、跨平台本质）
- [[编程/java基础/面向对象/02 访问修饰符]] — 四个修饰符（`private` < 缺省包私有 < `protected` < `public`，缺省无关键字）与对比表；五个高频坑：顶层类不能 private、`protected` 跨包必须用子类型引用、重写只能放宽权限、JDK9+ `exports` 让 public 不再全局、接口成员隐式权限；含面试速答
- [[编程/java基础/面向对象/03 抽象类与接口]] — 抽象类（「是一种」+ 状态 + 骨架）vs 接口（「能够」+ 无状态 + 契约），附「把句子念出来」的继承/组合判断法：抽象类与普通类只有两个真区别、抽象类有构造方法、匿名内部类不是实例化抽象类、接口成员隐式权限、Java 8 `default` 为接口演化而生与冲突三规则、`abstract` 与 `final`/`static`/`private` 互斥表、「接口 + 抽象骨架类 + 实现类」选型范式；含面试四步框架、12 得分点、7 加分点与四组追问预案
- [[04 接口与抽象类实例化，定义方法]] — 接口成员与抽象类实例化「三连问」面试整合篇：**三问同源（接口/抽象类都「不能 new」）**的四步骨架、接口可定义四类方法表（抽象/`default`/`static`/`private` 各自 JDK 版本与特点）、抽象类不能直接实例化但**构造器由子类 `super()` 调用**的关键纠正（被 new 的是子类对象不是抽象类本身）、接口不能有构造方法的原因链（不能 new→无实例可初始化→`Interfaces cannot have constructors`）、6 条易错陷阱、20+ 条追问预案（default 为何引入/Collection.stream、接口字段隐式 `public static final`、接口方法全隐式 public、多接口同名 default 冲突三规则、匿名内部类≠实例化接口抽象类、抽象类 vs 接口选型、抽象类是否会被淘汰）与 40 秒口述版
- [[05 内部类的三种形态]] — 内部类三种形态整理篇：三形态对比表（**Inner/Anonymous 必依附外部实例持 `Outer.this` 能碰 private vs Static Nested 独立只碰静态成员**）、Inner 特征（`outer.new Inner()`、持有外部引用、能访问 private、编译 `Outer$Inner.class`）、Anonymous 特征（定义即实例化、`new Runnable(){}` 是匿名实现类非接口本身、`Outer$1.class` 命名、可继承普通类 + 双花括号初始化）、Static Nested 特征（独立 `new`、不能访问实例成员、只碰静态、`Outer$StaticNested.class`）、5 条易错陷阱、14+ 条追问预案（为何用内部类、Inner vs Anonymous、内存泄漏=持外部引用、effectively final、静态内部类单例、双花括号坑）与 40 秒口述版
- [[static 与 final]] — static 与 final 面试整合篇：通用四步答题框架（本质→按修饰对象分类→原理→场景）、static 四种用法（变量共享一份/方法不能访问非静态成员/静态块在 `<clinit>` 只执行一次/静态内部类不持有外部引用）与父子类初始化顺序、final 三种用法（类不可继承/方法不可重写/变量只能赋值一次）与「引用不可变 ≠ 对象不可变」、20+ 条高频追问预案（静态方法能否重写、static 变量存哪、blank final、编译期常量内联、Lambda effectively final、final/finally/finalize）与两段 40 秒口述版
- [[编程/java基础/关键字/Java 中 static的作用是什么？]] — static 修饰变量/方法/代码块/内部类四种用法的原始笔记
- [[编程/java基础/关键字/Java 中 final 作用是什么？]] — final 修饰类/方法/变量三种作用的原始笔记
- [[编程/java基础/注解/Jakarta Validation 参数校验实战]] — 数据校验标准规范实战：常用内置注解（含 `@NotNull`/`@NotEmpty`/`@NotBlank` 三兄弟辨析表）、`@Valid`（Jakarta，对象/级联校验）vs `@Validated`（Spring，分组/方法参数校验）、全局异常处理三异常（`MethodArgumentNotValidException`/`ConstraintViolationException`/`HandlerMethodValidationException`）、分组/级联/集合泛型元素/Service 方法参数/返回值校验、自定义校验注解（`@Constraint` + `ConstraintValidator`，核心：null 当通过让必填交给 `@NotBlank` 表达）、类级别校验（跨字段规则）、手动校验、消息国际化、Fail Fast、与 JPA 实体关系；含常见问题避坑表与实践建议速查
- [[为什么需要泛型？]] — 为什么需要泛型整理篇：**两大核心原因——①代码复用（`<T extends Number>` 一份 add 顶三个重载，适用于多种数据类型执行相同代码）②类型安全（指定类型、编译期检查、免强制转换，避免取 Object 强转和 `ClassCastException`）**、复用/安全双维度对比表与正反代码示例，与包装类(Integer)、装箱拆箱、类型擦除联动；含 4 条相关页面
- [[编程/java集合/概念/java数组和集合的使用场景]] — 数组 vs 集合面试整合篇：四步回答骨架 + 六维对比表（长度固定 vs 动态/是否存基本类型/性能连续内 缓存友好/类型安全协变编译期 vs 泛型擦除仅编译期/API 丰富度/存储结构）；深入细节（数组协变 `ArrayStoreException` vs 泛型提前编译期、内存分配、O(1) 下标）；使用场景（数组：基本类型+长固定/极致性能/多维/变长参数；集合：个数不定/频繁增删/去重/键值/流式/接口返回值）；黄金建议与 `Arrays.asList` 固定长度视图陷阱、`toArray(new String[0])`；追问预案（谁更快、为何集合不能存基本类型、`ArrayStoreException`、ArrayList 为何不直接用数组、泛型类型擦除、何时非用数组不可）与一句话总结
- [[编程/java集合/概念/说说java中的集合]] — Java 三大集合接口 + 实现面试整合篇：四步回答骨架（List/Set/Map 三接口分层；`Map` 不继承 `Collection`）；核心要点（**ArrayList 数组实现扩容/随机快/中间增删搬移 vs LinkedList 双向链表及"插入快"误区澄清（持有引用才 O(1)、任意位置 O(n)+缓存不友好→默认优先 ArrayList）**、HashSet 走 HashMap 用 Key+`PRESENT` 常量去重、LinkedHash* 双向链表保序、TreeSet*/TreeMap* 红黑树有序、**HashMap 1.8 链表≥8 且数组≥64 转红黑树/否则只扩容**、ConcurrentHashMap 1.8 volatile+CAS+synchronized 锁桶）；追问预案（ArrayList vs LinkedList 选型、HashMap 树化条件、线程不安全原因、Hashtable vs HashMap、HashSet 去重依赖 equals/hashCode、Map 与 Collection 关系、数组<64 为何不树化）
- [[编程/java集合/概念/Java中的线程安全的集合是什么？]] — 线程安全集合面试整合篇：先分**老派 `java.util` 同步容器 vs 新派 `java.util.concurrent` 并发容器**两阵营；老派（Vector 同步数组、Hashtable 方法级 synchronized 锁整个对象、不支持 null、性能差已少用）；新派按类型（ConcurrentHashMap **1.7 Segment 分段锁 → 1.8 volatile+CAS 写空槽+synchronized 锁桶头节点**、ConcurrentSkipListMap 跳表有序、CopyOnWriteArrayList/ArraySet 写时复制数组**适读多写少**、ConcurrentSkipListSet 有序、ConcurrentLinkedQueue CAS 无锁高性能 vs BlockingQueue 阻塞协作生产者-消费者、LinkedBlockingDeque 无读写锁分离）；追问预案（为何弃 Hashtable/Vector、1.7 vs 1.8 锁粒度、CAS、CopyOnWrite 适用场景、并发集合各自代价）
- [[编程/java集合/概念/集合遍历的方法有哪些？]] — 集合遍历六法面试整合篇：四步回答骨架（普通 for/for-each/Iterator/ListIterator/forEach/Stream 分层）+ 对比表；核心要点（**for-each 是 Iterator 语法糖**、**遍历中删除唯一解 Iterator.remove()**、ListIterator 双向+set/add、普通 for 只适 List、LinkedList 用 get(i) 是 O(n²) 应避免）；加分表达与问题口决（读用 for/forEach、删用 Iterator、双向改用 ListIterator、过滤映射聚合用 Stream）；追问预案（遍历中删除为何抛 ConcurrentModificationException、for-each 与 Iterator 关系、ListIterator 多了什么、四法性能差异、非 List 如何遍历）
- [[编程/java集合/List/ArrayList的扩容机制说一下]] — ArrayList 扩容五步（算新容量 1.5 倍→建新数组→复制→换引用→完成）；**1.5 倍为何用移位 `oldCapacity >> 1`** 减少浮点/运算次数；代价是整数组复制+内存重分配，故初始化预分配容量可减扩容次数；含回答骨架与 grow/ArraysSupport.newLength 深水区
- [[编程/java集合/List/ArrayList线程安全吗？把ArrayList变成线程安全有哪些方法？]] — ArrayList 非线程安全，三种变安全方案（**Collections.synchronizedList 包装同步锁（迭代仍要手动同步）、CopyOnWriteArrayList 写时复制推荐（读多写少）、Vector 老派同步过时**）；追问预案（怎么选、CopyOnWrite vs synchronizedList 读写分离 vs 整体锁、为何弃 Vector）
- [[编程/java集合/List/为什么ArrayList不是线程安全的，具体来说是哪里不安全？]] — 并发 add 三大问题（**部分 null：两线程同写下标互覆盖空位、索引越界：size 与容量竞态打下标 10、size 不符：`size++` 读改写非原子必丢**）；归因 add 的 `elementData[size++]=e` 非原子三步；追问预案（null/越界/size 各自成因）
- [[编程/java集合/List/线程安全的 List， CopyonWriteArraylist是如何实现线程安全的]] — CopyOnWriteArrayList 写时复制原理：底层 `volatile Object[] array` 保可见性 + 写加 `ReentrantLock` 把旧数组 `copyOf` 复制再改替换引用（`setArray`）、**读不加锁**直接 `getArray`；关键洞察（替换前读旧数组/替换后读新数组都是有效数据→读写无需都加锁）；适用读多写少，可能读到旧数据；追问预案（volatile 作用、读为何无锁、写为何慢、ReentrantLock vs synchronized）
- [[编程/java集合/List/list如何快速删除某个指定下标的元素？]] — 三种 List 按下标删除复杂度对比（**ArrayList 删后向前搬移：末尾 O(1)/中间 O(n)；LinkedList 遍历到下标再改指针：一般 O(n)/已知头尾 O(1)；CopyOnWriteArrayList 写时整数组复制：通常 O(n) 但并发读不受影响**）；关键在**底层结构而非集合名**，工程上常 ArrayList 搬移最实用；追问预案（为何各 O(n)、哪个通常最快）
- [[编程/java集合/Map/如何对map进行快速遍历？]] — Map 遍历五法面试整合篇：Map 自身不 implements `Iterable`；四种手段（**需键值用 `entrySet` 一次拿 Entry（最常用/性能好）、只要 key 用 `keySet`、Java 8 推荐 `forEach((k,v)->)` 最简洁、要删用 `Iterator.remove()` 安全删、要筛选聚合用 Stream 链式 filter/map/collect**）；加分表达（entrySet 避免 keySet+get 二次哈希查表、区分 map.forEach 自带默认方法 vs Stream.forEach 链式）；追问预案（为何 entrySet 优先、Map 能否 for-each 直接遍历、遍历中删除、各实现遍历顺序、五法性能差异）
- [[编程/java集合/Map/ConcurrentHashMap怎么实现的？]] — CHM 实现面试整合篇（锁粒度演变主线）：1.7 **Segment 分段锁**（Segment=ReentrantLock 锁大段数组 + HashEntry 数组/链表，一段一锁实现真并发）；1.8 **volatile+CAS+synchronized 锁桶头节点**（空桶/初始化用 CAS 无锁写入，非空桶 synchronized 锁头遍历、粒度从"段"细到"桶"）、链表超阈值转红黑树查询 O(logn)；加分表达（锁粒度演变动机、CAS 乐观 vs synchronized 接管互补）；追问预案（为何 1.7 ReentrantLock 后改 synchronized、锁粒度、put 何时无需加锁、为何比 Hashtable 并发高、读是否加锁）
- [[编程/java集合/Map/hashmap的put过程介绍一下]] — HashMap put 流程八步面试整合篇：算下标→空位直放(growNode+modCount++)→判首节点同 key 更新→遍历链/树按 hash+equals 找/尾插→**链长≥8 且数组≥64 转红黑树(否则只扩容)**→负载因子 0.75 超阈值扩容→**1.8 扩容 2 倍按 `e.hash & oldCap` 分流原位/原位+oldCap 免重算 hash**；加分表达（树化条件、modCount 并发检测引出非线程安全）；追问预案（为何 2 倍/8 树化/数组<64 不树化/扩容元素如何定位/为何非线程安全/modCount 作用/默认初始容量与负载因子）
- [[Java 创建对象有几种方式？]] — 创建对象五种方式面试整合篇：**四步回答骨架**（定调五种→按"是否调用构造器"二分→逐类展开→抛话题引导追问）、五方式对照表（**`new`/反射调构造器，`clone`/反序列化不调用，工厂封装 `new`**）、两处加分点（**`Class.newInstance()` JDK9 已废弃改用 `Constructor.newInstance()`；`clone`/反序列化绕过构造器是单例被破坏的根源**）、8 条高频追问预案（何时不能 new、new vs 反射、反序列化为何不调构造器、reflection 破单例、`readResolve`/枚举单例防破坏、new 的对象内存分配）与 6 条易错陷阱、40 秒口述版
- [[深拷贝和浅拷贝的区别？]] — 深拷贝 vs 浅拷贝整理篇：**按"复制后原对象与副本是否共享内部引用类型字段"划分**、浅拷贝只复制对象本身+值字段而引用字段只复制地址（共享原对象）、深拷贝递归复制所有引用字段生成全新对象图、四维对比表、选择依据与判别口诀（改副本引用字段原对象会不会变→浅/深）
- [[实现深拷贝的三种方法是什么？]] — 深拷贝三种实现整理篇：**①`Cloneable`+递归重写`clone()`（`super.clone()`浅拷一层再对引用字段递归）②序列化/反序列化（对象→字节流→全新对象，靠`Serializable`通用但`transient`丢失、性能差）③手动递归复制（零依赖但嵌套深易漏拷）**、三法对比表与选型速查、各自优缺点与坑（`CloneNotSupportedException`、`serialVersionUID`/`InvalidClassException`、新增字段漏拷）
- [[编程/java基础/序列化/将对象转为二进制字节流具体怎么实现？]] — Java 序列化方法论：**序列化/反序列化是"协议 + 对象流"机制，与加密解密/TCP 粘包同源（协议定义字节流格式）**；用 `ObjectOutputStream.writeObject`(写)/`ObjectInputStream.readObject`(读)；前提是实现 `Serializable`/`Externalizable` 否则抛 `NotSerializableException`；`transient`/`static` 字段不参与默认序列化、成员类型自身也要 `Serializable`；四步回答骨架 + 追问预案（`serialVersionUID` 与 `InvalidClassException`、`transient`vs`static`、`Serializable`vs`Externalizable`、反序列化不调构造器/破坏单例与 `readResolve`、成员类型递归要求）
- [[编程/java基础/序列化/JSON 序列化库对比：Gson、FastJson、Jackson]] — Java 三大 JSON 序列化库对比：Gson(Google，功能最全、`toJson`/`fromJson`、只靠 get/set 即可转换复杂类型)、FastJson(阿里，解析速度极致但**复杂类型 Bean↔JSON 易"引用类型"出错需显式指定引用**)、Jackson(FasterXML，**当前最流行 & Spring MVC 默认解析器**：依赖少/大数据快/内存低/API 灵活，三模块 core 流模式 JsonParser&Generator / annotations 注解 / databind 对象绑定 ObjectMapper+树模型 JsonNode 且依赖 core)；三步选型骨架 + 追问预案
- [[序列化和反序列化]] — 序列化概念入门：**"序列"(Sequence)=按顺序排列的数据；序列化=对象→字节流，反序列化=字节流→对象，二者互为逆运算**；需要序列化的场景（持久化/网络传输/跨 JVM）；本质是"协议定义字节流格式"；含拆词式回答骨架与追问（哪些场景必须序列化、JSON 也是一种序列化）
- [[07 值传递与引用传递的区别]] — 值传递与引用传递面试整合篇：**结论先行「Java 只有值传递」**的五步回答骨架（定调→澄清定义→分类展开→关键二分→判别法收尾）、概念澄清表（值传递=副本 vs 引用传递=别名）、引用类型关键二分（`obj.字段=x` 能影响外面 vs `obj=new` 只改副本指向）、判别一句话法（方法内重新赋值外面实参会不会变）、10+ 条高频追问预案（**String 不可变陷阱专题**、数组 `arr[0]` 与 `arr=new` 区别、标准 swap 为什么换不了 + 三种替代方案、Java 为何不设计引用传递、`final` 形参语义、深拷贝关系、跨语言机制差异）与 40 秒口述版
- [[类型转换与互转陷阱]] — 类型转换面试整合篇：**四步回答骨架**（定调→澄清→分类展开→抛出问题）、两类转换对比表（小转大自动安全 vs 大转小强转必损）、**两大核心问题**（数据溢出=高位截断如 `300→byte` 得 44 / 精度损失=截断小数如 `3.14→int` 得 3）、**「int→float」自动转换也丢精度**的关键纠错、与对象向上/向下转型严格区分、五个易踩坑点、20+ 条高频追问预案（`byte+short` 运算提升为 `int`、`char`/`int` 互转方向、`byte b=300` 编译报错而 100 不报、浮点 != 精确、`Math.toIntExact` 溢出抛异常、金额用 BigDecimal、`NumberFormatException`、与运行时数据区/操作数栈关联）与 40 秒口述版
- [[为什么用BigDecimal不用double]] — BigDecimal vs double 面试整合篇：五步回答骨架（点破原因→底层原理→给复现→引出 BigDecimal→抛使用要点）、**double 丢精度机理**（二进制只能表示 `1/(2^n)` 的和、0.1 表示不了、`0.05+0.01=0.060000000000000005` 等四个必背复现例）、BigDecimal 是**「整数+scale」的十进制定点表示**与 double 对比表、**五个使用要点**（必须字符串构造 `new BigDecimal(0.1)` 反而放大误差、除法必须指定 scale+舍入否则抛 `ArithmeticException`、`compareTo` 而非 `equals`、`setScale(HALF_UP)`、不可变）、20+ 条高频追问预案（为什么 0.1 表示不了 / 哪些 double 精确、`new BigDecimal(0.1)` 为何仍错、数据库用 DECIMAL、金额用整数存分、性能权衡、与类型转换精度损失呼应、不可变与线程安全）与 40 秒口述版
- [[装箱和拆箱是什么]] — 装箱与拆箱面试整合篇：**四步回答骨架**（定调给例→揭示编译器语法糖本质→说清赋值/方法调用两时机→抛坑引导追问）、本质是编译器替换（装箱`valueOf`/拆箱`.intValue`）、**IntegerCache 缓存专题**（默认 -128~127、`-XX:AutoBoxCacheMax` 可调、范围内 `==` true 超范围 false、`new Integer(100)==new Integer(100)` 为 false、与 int 混合先拆箱比值、Float/Double 无缓存）、**拆箱 NPE 高危场景**（赋值/运算/三目运算符/ORM 字段映射）、**循环反复装箱性能问题**（`Integer sum+=i` 每次拆箱+装箱超缓存产生几千新对象）、6 个陷阱对比表、20+ 条追问预案（String↔int 的 `parseInt`/`valueOf` 与 `NumberFormatException`、JDK9 废弃 `new Integer(int)`、为何要包装类、与类型转换联动）与 40 秒口述版
- [[Java为什么要有Integer]] — 为什么需要包装类 Integer 面试整合篇：**四步回答骨架**（点本质→讲泛型刚需→讲集合/转换→抛工具方法+null 语义收尾）、核心四大刚需 + 两补充（**泛型 type 擦除后统一 Object 所以 int 不能当参数**、集合只存对象、**null 语义=DB 缺值 vs 基本类型永远有值**、数据+方法绑定）、int↔String 转换桥接、包装类 vs 基本类型对比表（何时必需何时该用基本类型）、4 条易错陷阱、20+ 条追问预案（为何泛型只认引用类型/类型擦除、8 种包装类命名规则、Integer vs int 内存差异、DB 字段映射 NPE、int↔String 各方法与 `NumberFormatException`、与装箱拆箱/IntegerCache 联动、Comparable、JDK 值类型 Valhalla 演进）与 40 秒口述版
- [[Integer与int的区别]] — Integer 与 int 区别与取舍面试整合篇：**四步回答骨架**（定调两种"世界观"→展开三层差异→转向为什么保留 int 讲性能→工程取舍）、三层核心区别（**内存布局：int 直接存值 4 字节 vs Integer 引用+堆对象**/ 空值：int 默认 0 永不 NPE vs Integer 默认 null 拆箱 NPE / 泛型集合能力：`List<int>` 不行）、**保留 int 的性能论据**（UTF-8 读写少一次解引用、64 位 JVM 开启引用压缩下 Integer 占 16 字节 ≈ int 4 字节的 4 倍、指针压缩 UseCompressedOops 原理）、工程取舍表、4 条易错陷阱、20+ 条追问预案（内存布局、为何 16 字节/引用压缩、包装类空值触发点与避免、`Integer 100==100` 与 `200==200`、与装箱缓存联动、`List<Integer>` vs `int[]`、JDK 值类型演进）与 40 秒口述版
- [[编程/java基础/代码块/00 面试整理-Java 代码块四种类型]] — 四种代码块整合篇：判别口诀（在方法里 → 局部/同步；在类里 → 看有无 `static`）与四维对比表；逐类要点（局部块限定作用域、构造块提取公共初始化、静态块一次性类级配置、同步块细化锁粒度）；**执行顺序**「父静态 → 子静态 → 父构造块 → 父构造方法 → 子构造块 → 子构造方法」与口诀「静态优先，父类优先，构造代码块先于构造方法」；**字节码本质**（静态块进 `<clinit>`、构造块进 `<init>` 且位于 `super()` 之后、局部块只影响 slot 作用域、同步块编译为 `monitorenter`/`monitorexit`）——顺序由此可推导而非死背；**两处必须说准的表述**（静态块在「初始化阶段」而非「加载阶段」；局部变量是 slot 复用而非立即释放）；含 30 秒速答版与 32 条追问预案（静态块线程安全是静态内部类单例之根、`ExceptionInInitializerError`、`ClassLoader.loadClass` 不触发、`synchronized` 方法靠 `ACC_SYNCHRONIZED` 标志、锁对象四个坑、锁粒度并非越细越好、blank final 赋值时机）
- [[Lambda 表达式基础]] — 函数式编程的 Lambda 写法：把单方法接口（`FunctionalInterface`）的匿名类精简为 `(参数) -> 表达式`、参数与返回值类型由编译器自动推断、`@FunctionalInterface` 标记单抽象方法接口（含 Comparator 特例：Object 方法/默认方法不算）；延伸 `Arrays.sort(array, (s1,s2) -> s1.compareTo(s2))`
- [[方法引用]] — Lambda 的进一步简化：方法签名只看参数类型与返回类型（不看方法名/继承关系）；三种引用——静态方法（`类名::方法`）、实例方法（隐含 `this` 参数看作第一个参数，如 `String::compareTo`）、构造方法（`类名::new` 隐式返回 this）；FunctionalInterface 可传入的种形式
- [[编程/java基础/java新特性/Java 8 你知道有什么新特性？]] — Java 8 里程碑式新特性速查：Lambda、函数式接口、Stream、Optional、方法引用、接口默认/静态方法、并行数组排序、重复注解、类型注解、CompletableFuture
- [[编程/java基础/java新特性/Optional 使用指南]] — Java 8 空安全容器类：显式声明"值可能不存在"替代裸 `null`；创建（of/ofNullable/empty）、检查（isPresent/isEmpty）、取值（orElse/orElseGet 惰性/orElseThrow）、处理（map/flatMap/filter/ifPresentOrElse）；三大应用（返回值契约、替代 null 检查、reduce 嵌套）；四条最佳实践（返回值用 Optional、勿作字段用、避免 get()、不过度使用）
- [[编程/java基础/java新特性/Java 21 新特性知道哪些？]] — Java 21 (LTS) 新特性：语言侧模式匹配三件套（Switch 模式匹配 JEP441 / 记录模式解构 JEP440 均正式；字符串模板 JEP430 为预览**且 JDK23 已撤回**）、并发侧**虚拟线程**（栈在堆上、挂到载体线程 carrier、I/O 密集受益/CPU 密集无益、三种创建方式）与 Scoped Values**（比 ThreadLocal 更安全：不可变+作用域界定+不泄漏）；三步回答骨架 + 追问预案（虚拟线程 vs 线程池/适用场景、Scoped Values vs ThreadLocal、字符串模板撤回原因、稳定 vs 预览区分）
- [[四大函数式接口]] — Consumer / Supplier / Function / Predicate：只看参数与返回值，对应"吃进去、凭空造、加工厂、质检员"
- [[00 Stream 是什么]] — Stream 概念总纲：与 `java.io`/`List` 的三大区分、可"存储"有限/无限元素、可转换不修改原 Stream、**惰性计算**原理（转换只存规则不计算，聚合才触发）；含全体自然数示例与链式操作
- [[01 Stream 创建]] — 创建 Stream 的四种方式：`Stream.of()`、基于数组/`Collection`（`Arrays.stream`/`.stream()`）、基于 `Supplier`（`Stream.generate` 表示无限序列，须 `limit` 转有限）、API 直接提供（`Files.lines`/`Pattern.splitAsStream`）；基本类型专属 `IntStream`/`LongStream`/`DoubleStream`（避免装箱拆箱）
- [[02 Stream map]] — 最常用的转换操作：把每个元素映射为新元素成新 Stream（元素映射/类型转换）；接收 `Function<T,R>` 接口；链式 `trim`/`toLowerCase` 示例；惰性
- [[03 Stream filter]] — 常用转换操作：逐一测试滤掉不满足条件者；接收 `Predicate<T>` 接口；过滤工作日示例；惰性、元素可能变少
- [[04 Stream reduce]] — 聚合方法（立即触发计算）：接收 `BinaryOperator`；`acc` 累积器原理、无初始值返回 `Optional`；求和/求积（初始值须 1）/聚合成 Map 示例
- [[06 Stream 输出集合]] — 转换 vs 聚合的区分（聚合立即计算）；`collect(Collectors.toList/toSet)`→List/Set、`toArray(String[]::new)`→数组、`Collectors.toMap`→Map、`groupingBy` 分组输出
- [[05 Stream 其他操作]] — 其余 Stream 操作分类：转换（`sorted`/`distinct`/`skip`/`limit`）、合并（`concat`/`flatMap` 拍平集合的 Stream）、并行（`parallel`）、聚合（`count`/`max`/`min`/`sum`/`allMatch`/`anyMatch`/`forEach`）
- [[编程/java并发编程/多线程/Java 多线程与 JMM]] — 多线程与内存模型整合篇：私有栈/共享堆是一切线程安全问题的根源、三类注意事项（安全/通信/成本）、线程池七参数与执行流程、JMM 三大特性（可见性/原子性/有序性）、volatile 与 synchronized 能力边界、DCL 防重排、happens-before，含面试六步答题框架与四类追问预案
- [[编程/java并发编程/线程池/有线程池参数设置的经验吗？]] — 线程池五件套参数面试整合篇：起点=**corePoolSize 按类型估**（CPU 密集=核数+1 防抢 CPU / IO 密集=核数×2 看 IO 等待）；三典型场景对比表（电商瞬时高并发=SynchronousQueue 直达线程+AbortPolicy 快速失败 / 后台数据处理=固定 8/8+有界 ArrayBlockingQueue(1000)+CallerRuns 兜底 / 微服务 HTTP=IO 密集 16/64+有界 LinkedBlockingQueue(200)+自定义重试）；加分表达（估算口诀、队列 vs 扩线程取舍、拒绝策略兜底闭环）；追问预案（corePoolSize 为何±1/×2、SynchronousQueue 时机、队列与 maximum 谁先用满、拒绝策略选型、keepAlive、核心线程是否回收、队列有界无界）
- [[编程/java并发编程/线程池/线程池的工作原理和执行流程？]] — 线程池工作原理面试整合篇：定义（复用线程、控制并发，省频繁创建/销毁开销）；**四步执行流程（核心优先 → 队列缓冲 → 扩容临工 → 拒单）**——① 线程数 < corePoolSize → 直接建核心线程 / ② 核心已满 → 任务入阻塞队列（offer 成功就不扩线程，无界队列永不扩非核心）/ ③ 队列满 → 建非核心线程（不超 maximumPoolSize）/ ④ 连最大也满 → 拒绝策略兜底；核心组成四要素（core / max / 队列 / 拒绝策略）；**反直觉考点：corePoolSize=0 可以**——任务先入队、`execute` 源码里 `workerCountOf==0` 时 `addWorker(null,false)` 补建临时线程消费队列；含 30 秒速答与 5 条追问预案（为何先入队后扩线程/边界怎么定/CachedThreadPool 场景/谁消费队列/参数细节跳转）
- [[编程/java并发编程/线程池/线程池怎么使用？]] — 线程池使用上手篇：**三段式（建池→提交→关闭）**——建池（**简单用 Executors** 快速但 newCachedThreadPool 可致大量线程 OOM / newScheduledThreadPool 无界 DelayedWorkQueue 任务堆积 OOM，复杂业务推荐 **ThreadPoolExecutor 手配 7 参数**精准控制）；提交（**submit** 可提交 Callable 收返回值、Future.get 捕获 ExecutionException 包的任务内异常 vs **execute** 只能 Runnable 异常直抛）；拒绝策略四选（Abort 默认抛/CallerRuns 主线程执行/Discard/DiscardOldest，核心业务别用 Discard 系）；使用纪律（不 shutdown 线程泄漏、队列容量合理防 OOM 防拒、CPU 密集≈核数 vs IO 密集×2）；定时任务 ScheduledExecutorService（schedule 延迟一次 / scheduleAtFixedRate 按开始时刻排班 / scheduleWithFixedDelay 按结束时刻顺延，周期任务抛异常会取消后续调度）；追问预案（Executors 坑/submit vs execute/7 参数/shutdown 选型/拒绝策略选型/线程数/FixedRate vs FixedDelay）
- [[线程池中 shutdown()、awaitTermination()、shutdownNow() 这三个方法有什么作用？]] — 线程池关闭三角色面试整合篇（合并 windpoplar 推荐）：**shutdown="温柔收尾"**（置 SHUTDOWN，队列已有任务仍跑完，interruptIdleWorkers 只中断空闲）vs **shutdownNow="强硬断电"**（置 STOP，interruptWorkers 中断所有，drainQueue 清空并返回未执行任务）vs **awaitTermination=轮询探测**（带超时查池是否关闭返布尔，**不改变状态、须配合 shutdown 用**）；共同点=之后提交新任务抛 RejectedExecutionException；**生产三段式优雅关闭**（shutdown → awaitTermination N 秒宽限 → 仍没关完 shutdownNow 兜底并处理返回任务，先软后硬不丢任务，含 while(!awaitTermination) 轮询实例）；核心机制=shutdownNow 靠 interrupt() 打断若无可中断阻塞点则未必立即退出；含源码对比与打断不确定性；追问预案（本质区别/与 awaitTermination、能否再提交、标准组合姿势、为何循环轮询、立即退出否、返回值、为何 interruptXxx 不同、返回任务如何处理）
- [[编程/java并发编程/线程池/ForkJoinPool]] — 取餐·分治任务窃取线程池（另一种线程池形态）
- [[编程/java并发编程/多线程/线程间通信有哪些方式？]] — 线程间通信四层框架面试整合篇：**由底到高四层**（① 共享内存 共享变量+volatile/synchronized 保证可见性 / ② 等待通知 Object wait/notify/notifyAll 与 Lock+Condition await/signal、多条件精准唤醒 / ③ 阻塞队列 BlockingQueue 生产者-消费者封装 wait/notify / ④ 同步工具 CountDownLatch 一批完成放行·CyclicBarrier 互等到齐·Semaphore 限量并发）；wait/notify 三大深水区（wait 靠 notify/notifyAll 唤醒回 RUNNABLE、**Thread.State 无 RUNNING 只有 RUNNABLE 含 OS ready+running**、notify 只醒一个 vs notifyAll 全部抢锁、HotSpot FIFO 唤醒非随机）；追问预案（wait vs sleep、Latch/Barrier/Semaphore 分工、生产者-消费者选型）
- [[编程/java并发编程/多线程/如何停止一个线程的运行？]] — 线程停止面试整合篇：总原则=**无安全强制终止，靠协作式停止**；**五种方式**（**共享标志位** volatile boolean 循环检测 / **中断机制** interrupt 打标+轮询最通用 / **Future.cancel(true)** 线程池取消任务 / **资源关闭** 解 Socket 等不可中断阻塞 / **stop/suspend/resume 已废弃** 作反例）+ 方法速查表；核心机制（阻塞中→立即解阻抛 InterruptedException、运行中→只打标稍后轮询、**不可中断阻塞→中断无效须关资源**；isInterrupted() 只读 vs Thread.interrupted() 会清除标志）；加分表达（先抛五法分类、interrupt 是"提议"非"命令"、三种中断响应、volatile 可见性）；追问预案（interrupt 是否立即停、stop 为何不安全、isInterrupted vs interrupted、标志位为何 volatile、cancel(true) 底层、不可中断阻塞怎么停、shutdownNow vs stop）
- [[编程/java并发编程/多线程/Java线程的状态有哪些？]] — 线程 6 种状态面试整合篇：**`Thread.State` 没有 RUNNING**（`RUNNABLE` 涵盖 OS 就绪+运行）；面试核心考 BLOCKED vs WAITING（**被动/主动**触发 + **自动/显式**唤醒）；ReentrantLock 抢锁失败进 WAITING 而非 BLOCKED（`LockSupport.park()`）
- [[编程/java并发编程/多线程/线程的创建方式有哪些？]] — 线程创建四法面试整合篇：按"有无返回值+是否复用"分层——**继承 Thread**（最直接但单继承锁死、任务与线程耦合）/ **实现 Runnable**（可再继承其他类、可共享同一任务对象，task 与 thread 分离）/ **实现 Callable + FutureTask**（只有它能 `get()` 取异步结果、可抛异常）/ **线程池 Executor**（预创建线程复用省创建销毁开销、控制并发数防资源耗尽，复杂度高/错误配置恐死锁）；加分表达（Runnable 是任务 vs Thread 是载体的本质、Callable 升维到 Future/CompletableFuture）；追问预案（为何不推荐继承 Thread、Runnable vs Callable、谁能取结果、start vs 直接 run、多次 start 抛 IllegalState、submit 为何能返回 Future、线程池丢任务场景）
- [[编程/java并发编程/多线程/使用 Future]] — 用 Future 取异步结果：`Runnable` 无返回值 → `Callable<V>` 有返回值并搭配线程池 `submit` 拿 `Future`；接口四方法（get/get 超时/cancel/isDone）；`get()` 阻塞与 `isDone()` 轮询两种等待方式的局限——正因主线程被"吊住"，才引出 CompletableFuture（来源：廖雪峰 Java 教程）
- [[编程/java并发编程/多线程/使用 CompletableFuture]] — CompletableFuture 使用详解（合并廖雪峰+CSDN 详解）：创建（`supplyAsync` 带返回用 Supplier / `runAsync` 无返回用 Runnable）；取结果多法（get 阻塞检查异常/join 非检查异常/getNow 兜底不阻塞/complete 手动设值）；**回调一族**（thenApply 有参有返回转换链 / thenAccept 有参无返回消费 / thenRun 无参无返回 / whenComplete 拿结果+异常但无返回 / handle 同 whenComplete 但要返回替代值）+ `xxx`(当前线程)/`xxxAsync`(线程池) 命名规则；**两任务组合**（都完成 thenCombine·thenAcceptBoth·runAfterBoth / 任一带 one 完成 applyToEither·acceptEither·runAfterEither）；**批量** allOf(全完成 get 返 null)/anyOf(任一或最快)；含各回调速记与多场景应用（串行链/异常兜底/多源取最快/汇聚）
- [[Tomcat 处理请求的线程模型]] — Tomcat 线程模型纠偏面试整合篇：结论=一个共享 Worker 池处理所有请求（含 HTTP 解析+业务），默认 maxThreads=200；「HTTP 一个线程」是误解（Acceptor 默认 1 个只收连接不干活）、「500 个」指调优后 maxThreads；四步流水线（Acceptor 收连接 → Poller 用 NIO/Selector 非阻塞监控 → Worker 池读请求/解析/调 Servlet → 写回释放）同步请求模型；**Servlet 3.0 异步**才是把耗时业务委托给应用自建业务线程池、Worker 立即释放的真正入口；含 30 秒速答 + 6 条追问预案（Acceptor 为何一个、Poller/epoll 意义、maxThreads 溢出与估算、同步 vs 异步、与 Netty/Reactor 关系）
- [[编程/java基础/java新特性/completableFuture怎么用的？]] — CompletableFuture 面试整合篇：四步回答骨架（定调 Java8 升级→Future 三大硬伤→三大能力→双接口底层）；对比 guava ListenableFuture 回调地狱 vs 声明式编排；常用 API 分类速查表；**六条易错点**（默认线程池 commonPool 风险/回调线程模型/join vs get 异常差异/thenCompose vs thenApply/non 套 CF/失败兜底）；**15 条追问预案**（get vs join、thenApply vs thenCompose、runAsync vs supplyAsync、thenApply/thenAccept/thenRun、异常传播、thenCombine vs thenCompose、回调线程、allOf vs anyOf、线程安全、项目落地场景、与锁关系等）
- [[编程/java并发编程/并发安全/juc包下你常用的类？]] — JUC 常用类四类框架面试整合篇：**按职责分四类**（① 线程池 ThreadPoolExecutor/Executors 含 Executors OOM 坑 / ② 并发集合 ConcurrentHashMap 1.8 CAS+锁桶、CopyOnWrite 读写分离适读多写少 / ③ 同步工具 CountDownLatch 一批完成放行·CyclicBarrier 互等到齐可复用·Semaphore 限量并发 / ④ 原子类 AtomicInteger 无锁 CAS、AtomicReference 原子替换引用）；加分表达（四类框架+每类关键细节+选型思路）；追问预案（弃 Hashtable 原因、CHM 1.7 vs 1.8、CopyOnWrite 场景、Latch vs Barrier、Semaphore 用途、原子类 vs synchronized、Executors 坑）
- [[编程/java并发编程/并发安全/Java中有哪些常用的锁，在什么场景下使用？]] — 锁体系面试整合篇（悲观/乐观主线）：先按竞争处理分**悲观锁**（synchronized 内置+锁升级无锁→偏向→轻量→重量 / ReentrantLock 显式+可中断·可定时·公平非公平 / ReadWriteLock 读多写少实时多读）vs **乐观锁**（版本号/时间戳+CAS 更新时校验，读多写少冲突低）；另补**自旋锁**（短临界区循环 CAS、过度自旋费 CPU）；加分表达（按场景选型、锁升级理解、自旋取舍）；追问预案（锁升级路径/偏向轻量重量触发、公平非公平选型、ReentrantLock vs synchronized 选型、ReadWriteLock 场景、悲观乐观选型、乐观锁判断被改、自旋何时划算、volatile 关系）
- [[编程/java并发编程/并发安全/公平锁和非公平锁的区别及ReentrantLock的实现？]] — 公平/非公平锁专项：**圆定义**（公平=按申请顺序排队、吞吐低；非公平=直接 CAS 先抢后排队、吞吐高但线程饥饿）；非公平吞吐更大原理（公平锁线程"休眠-唤醒"反复做**用户态↔内核态切换**慢，非公平 CAS 直抢成功免休眠省切换）；synchronized **不是**公平锁、ReentrantLock 默认非公平可配公平；核心实现（公平锁 `tryAcquire` 比非公平锁 `nonfairTryAcquire` **多判一个 `hasQueuedPredecessors()`**——队列已有线程在排就不抢）；**特例 tryLock() 永远插队**（源码直接调 `nonfairTryAcquire`，不遵守公平原则）；含 30 秒速答与 5 条追问预案（省哪部分开销/饥饿严重否/hasQueuedPredecessors 判什么/构造参数/tryLock 用途）
- [[编程/java并发编程/并发安全/乐观锁的实现方式及CAS的缺点和解决？]] — 乐观锁实现 + CAS 缺点专项：三种实现方式（**CAS 原子类 / 版本号 / 时间戳**）；CAS 三大缺点（**ABA**（用 AtomicStampedReference 带 Stamp 值+版本号双匹配解决）/ **自旋长时间不成功费 CPU** / **只能保证单变量**，多变量用 AtomicReference 或锁）；「不能全用 CAS」（循环重试在高竞争下大量自旋浪费 CPU，需按竞争程度与悲观锁互补）；含 30 秒速答与 5 条追问预案（为何 CAS 是乐观锁基础/版本号 vs 时间戳/ABA 何时出问题/自旋 vs 阻塞/为何只能单变量）
- [[编程/java并发编程/并发安全/volatile的作用与线程安全、和synchronized比较？]] — volatile 面试整合篇：两个作用（**可见性**—写刷主存读读主存 / **禁止指令重排序**—JMM 4 屏障 LoadLoad·StoreStore·LoadStore·StoreLoad + volatile 插入策略 + x86 lock 前缀）；指令重排序原理（单线程结果不变 / 数据依赖不重排，A-B 无依赖可互排）；**只保可见不保原子→不能完全保证线程安全**（`i++` 复合操作仍需锁）；volatile vs synchronized 六维对比表（可见性 vs 互斥原子性、轻量 vs 重量、非排它 vs 排它）；含 30 秒速答与 5 条追问预案（为何不能保证原子性/重排为何只破坏多线程/适用场景/DCL 为何要 volatile/能否替代 synchronized）
- [[编程/java并发编程/并发安全/AQS 面试整合：答法逻辑、ReentrantLock 原理与从零设计]] — AQS 实战面试整合篇（三支 B 站字幕）：**①先给大局观再下沉**（state+FIFO CLH 双向队列封"排队/唤醒"，锁逻辑交给实现类，别长篇大论）；②**ReentrantLock 完整走查**（加锁=CAS 改 state+记 exclusiveOwnerThread，抢不到封 Node 入队 park；解锁=state 归 0+unpark 唤醒；可用可重入判断、非公平=头节点线程抢新线程"回首掏"、公平锁多判"头节点有非当前线程后继就不抢"）；③**从零设计反推**（state 为何 int 非 boolean=Semaphore 许可/重入计数、失败不空转入队阻塞、acquire/tryAcquire 模板方法、为何不用 OS mutex 省内核态切换）；④ReentrantLock vs synchronized（tryLock/公平锁/多 Condition）与独占(ReentrantLock)/共享(Semaphore·CountDownLatch)；含 11 条追问预案
- [[编程/java并发编程/并发安全/怎么保证多线程安全？]] — 多线程安全手段总览：**先点明三大成因（原子性/可见性/有序性）再给 7 类手段**——synchronized（原子+可见、锁升级）/ volatile（只保可见不保原子，适状态标志与 DCL）/ ReentrantLock（公平·超时 tryLock·可中断·Condition，须 finally 释放）/ 原子类（CAS 无锁，含 AtomicStampedReference 解 ABA）/ ThreadLocal（线程隔离，**线程池下必须 remove 防泄漏**）/ 并发集合（CHM、CopyOnWriteArrayList、BlockingQueue）/ JUC 工具类（Semaphore·CyclicBarrier·CountDownLatch）；含选型速查表与"安全等级"金字塔（优先用并发集合和原子类而非手动加锁）
- [[编程/java并发编程/并发安全/介绍一下AQS]] — AQS 面试整合篇（三部件骨架）：定调=**构建锁/同步器的模板框架**；核心两大件+一模板——**① volatile state 同步状态（含义由子类定：ReentrantLock 可重入计数/Semaphore 剩余许可/CountDownLatch 剩余倒数）② CLH 变体的 FIFO 双向等待队列（拿不到锁的线程封成 Node 排队唤醒）③ tryAcquire/tryRelease 等模板方法由子类重写**；核心思想（共享资源空闲→设为持有者，被占→入队阻塞）；加分表达（state 含义子类赋予、模板方法模式、为何用队列而非忙等）；追问预案（为何叫同步器、state 含义/线程安全、可重入实现、公平与非公平锁靠 tryXxx 门槛区分、while 自旋、park/unpark 阻塞唤醒、自定义同步器、与 synchronized 关系）
- [[编程/java并发编程/并发安全/synchronized和ReentrantLock及其应用场景？]] — 锁对比面试整合篇：①五个维度速查区别（用法关键字 vs 类、自动 vs 手动加解锁、非公平 vs 公平可调、能否响应中断、JVM 监视器 vs AQS）；②synchronized 原理（monitorenter/monitorexit 字节码 + 计数器语义 + 排它性/用户态内核态代价 + 加解锁内存语义 + waitSet/entryList 双队列）；③ReentrantLock（基于 AQS + Sync 内部类，**四大高级能力**：可中断 / tryAcquireNanos 超时 / 公平（default 非公平）`new ReentrantLock(true)` / 多 Condition，可重入靠 AQS state 计数）；④选型（简单同步与内置锁用 synchronized，高级功能/高竞争优化/复杂结构用 ReentrantLock）+ 一句话口诀；含 30 秒速答与 6 条追问预案（最大区别/可重入不死锁原因/公平 vs 非公平代价/可中断用法/多 Condition 好处/高竞争性能）
- [[编程/java并发编程/并发安全/synchronized锁静态方法和普通方法区别？]] — synchronized 锁对象粒度专项：**普通方法锁 `this`（当前实例，不同实例的同步普通方法可并行）vs 静态方法锁类的 `Class` 对象（全局唯一，整个类所有实例该方法互斥、同时仅一线程）**；从「静态方法属类、无实例依赖 → 用 Class 作锁」推导作用范围与多实例场景差异；含对比表 + 30 秒速答与 4 条追问预案（实例静态方法 vs 他实例普通方法可并行/为何锁 Class/this vs Class 本质/多静态同步方法是否互斥）
- [[编程/java并发编程/并发安全/Threadlocal作用，原理，具体里面存的key value是啥，会有什么问题，如何解决？]] — ThreadLocal 面试整合篇：作用三连（线程隔离/降耦少传参/免同步性能）；原理（Thread 持有 ThreadLocalMap → Entry[] → **key 弱引用 ThreadLocal、value 强引用**）；get/set/remove 流程（initialValue 兜底 / expungeStaleEntries 清理）；**内存泄漏根源**（弱 key 回收 + 强 value 成孤岛，线程池复用不结束则不清理）+ 解决（用完 remove）；含 30 秒速答与 6 条追问预案（为何弱引用/泄漏机理/何时不 remove 才安全/线程池为何必须 remove/与 synchronized 区别/父子线程与 TTL）
- [[编程/java并发编程/TransmittableThreadLocal：原理、使用与避坑]] — 线程池上下文传递：捕获-传递-恢复机制、TtlRunnable 装饰器、TtlExecutors 包装、withInitial/remove 最佳实践、内存泄漏与值覆盖避坑、traceId/租户/日志 MDC 四类场景（来源：深入理解 TTL）
- [[编程/jvm/03 class 字节码文件完整详解]] — 字节码文件组成：常量池（编号引用/符号引用）与方法（操作数栈/局部变量表/核心指令/`i++` 面试题）
- [[编程/jvm/04 类加载器]] — 类加载器作用、四种加载器、双亲委派机制与打破方式，以及 JDK9+ 模块化下的变化（启动类加载器改 Java、扩展→平台类加载器、BuiltinClassLoader）
- [[05 运行时数据区 程序计数器]] — 运行时数据区总览（线程不共享/共享）与程序计数器：存下一条字节码指令地址、控制解释执行顺序、多线程切换恢复进度、固定长度不会内存溢出
- [[06 运行时数据区 栈 局部变量表]] — 虚拟机栈 LIFO 与栈帧（局部变量表/操作数栈/帧数据）、IDEA Frames 与异常栈轨迹、局部变量表槽规则（long/double 占 2 槽）与槽复用优化
- [[07 运行时数据区 栈 操作数栈和帧数据]] — 操作数栈（中间数据、最大深度编译期确定与推演）与帧数据（动态链接：符号引用→运行时常量池映射；方法出口：返回地址交给程序计数器；异常表：起始/结束 PC 生效范围与跳转位置）
- [[08 运行时数据区 栈 内存溢出与本地方法栈]] — 栈溢出机制与 `StackOverflowError`（线程终止）、递归实测 10684 帧、`-Xss` 单位与 IDEA 配置、JDK8 有效范围 180K~1024M 越界自动调整、局部变量多则栈帧数下降（10000→8500）、生产建议 256K、HotSpot 本地方法栈与虚拟机栈共用同一块空间
- [[09 运行时数据区 堆内存]] — 堆是线程共享区（引用存栈/静态变量决定能否跨线程）、`OutOfMemoryError: Java heap space` 实测、`used`/`total`/`max` 三值与 total 动态扩张、Arthas `dashboard -i` 与 `memory`、total 远小于 max 就溢出（留给 GC 章节）、默认 max=内存 1/4 与 total=1/64、`-Xmx`/`-Xms` 单位与下限、JMX 显示 4g→3925M、生产建议 `-Xms`=`-Xmx`
- [[10 运行时数据区 方法区的实现]] — 方法区存三类数据（类元信息/运行时常量池/字符串常量池）、`InstanceKlass` 与虚方法表、静态常量池→运行时常量池（符号引用→内存地址）、方法区只是规范：**JDK7 永久代在堆中** vs **JDK8 元空间在直接内存**、Arthas `ps_perm_gen` 与 `metaspace`（`max=-1`）、Byte Buddy 死循环造类实测（JDK7 11 万次 `PermGen space` / JDK8 百万次不报错 / 限 256m 后 39 万次 `Metaspace`）、`-XX:MaxPermSize` 与 `-XX:MaxMetaspaceSize`、为何必须给元空间设上限
- [[11 运行时数据区 方法区 字符串常量池]] — 字符串常量池存什么、与运行时常量池的三阶段演变（JDK7 前合一在永久代 / JDK7 单独进堆 / JDK8 运行时常量池进元空间）、两道拼接题的字节码分析（变量 `+` 走 `StringBuilder` 到堆 vs 常量 `+` 编译期折叠进池，JDK9+ 改用 `invokedynamic`）、`intern()` 用法与经典面试题（JDK6 复制实例 `false/false` vs JDK7+ 只存引用 `true/false`，陷阱在 `"java"` 已被 JVM 启动时入池）、静态变量位置（JDK6 永久代 → JDK7+ 堆中 Class/mirror 对象，`putstatic` 源码验证）
- [[12 运行时数据区 直接内存]] — 直接内存不属于 JVM 规范：为 NIO 而生（避免 GC 影响堆上对象 + 省掉「直接内存→堆」一次复制，Netty 底层）、JDK8 起承载元空间、`ByteBuffer.allocateDirect()`、Arthas `direct` 与 `metaspace` 分开统计、溢出实测 `Direct buffer memory`（默认上限≈`-Xmx`）、`-XX:MaxDirectMemorySize` 与压测定值建议、`Cleaner` 释放机制与 `DisableExplicitGC` 陷阱；**附运行时数据区章节总结**（五区域共享性/作用/是否溢出）与 **JDK6/7/8 演变对比**
- [[13 内存泄漏：产生原因、识别、修复]] — 内存泄漏 vs 内存溢出：GC Root 引用链、堆内存三类对象、HashMap 缓存未清理 / 定时任务两大泄漏场景、Arthas 识别（来源：实战篇-1）
- [[编程/jvm/14 类的生命周期 加载阶段]] — 类生命周期总纲 + 加载阶段：粗分五阶段 vs 细分七阶段（连接展开为验证/准备/解析）与「初始化是唯一程序员可干涉阶段」、加载四步骤（全限定名 + 四种渠道：磁盘/动态代理内存生成/网络/自定义 → 类加载器职责结束 → 方法区 `InstanceKlass`（C++ 对象，含虚方法表，Klass 用 K 打头的原因）→ 堆区 `java.lang.Class`（反射入口，双向引用））、**JDK8 起静态变量存堆中 Class 对象**而非方法区、灵魂拷问「为何建两个对象」（C++/Java 语言隔离 + 裁剪虚方法表收窄访问范围提升安全性）、HSDB 验证实操（`java -cp sa-jdi.jar sun.jvm.hotspot.HSDB` + jps + Object Histogram 反向查找，版本必须一致）；含两套答题框架、40 秒口述版与 19 条追问预案（加载阶段不执行静态代码块、准备阶段赋零值、类唯一性由「类加载器 + 全限定名」决定）（来源：基础篇-7）
- [[编程/jvm/15 类的生命周期 连接阶段]] — 连接阶段三小步：**整个阶段不执行程序员写的代码**；验证（魔数 `CAFEBABE` 篡改实测、类必须有父类默认 Object、`goto` 目标合法、符号引用查 private 访问；JDK8 版本号校验源码逐句解析：`主版本号 = JDK + 44`、JDK8 为 52、45~52 区间、主版本号相等再校验副版本号、副版本号仅 JDK12+ 启用）、准备（静态变量在堆 `Class` 对象中分配内存并赋**零值**，各类型默认值表、为何必须赋零值防随机值；**特例 `static final` 基本类型编译期确定值直接赋最终值**，jclasslib 可见字段多出 `ConstantValue` 指向常量池）、解析（符号引用 `#8` → 直接引用内存地址提升性能，HSDB Class Browser 验证父类跳转）；含四步答题框架、40 秒口述版与 27 条追问预案（`UnsupportedClassVersionError` 跨版本部署事故、`-Xverify:none` 已移除、实例变量不在准备阶段、`static final` 引用类型不走 `ConstantValue`、惰性解析可晚于初始化、三阶段可交叉进行）（来源：基础篇-8）
- [[编程/jvm/16 类的生命周期 初始化阶段]] — 初始化阶段（唯一程序员可干涉、笔试题高发区）：本质是执行 `<clinit>`（cl=class + init）——静态代码块 + 静态变量赋值，`putstatic` 指令（字段从常量池取、值从操作数栈弹）与执行过程拆解；**核心结论 `<clinit>` 指令顺序 == 源码书写顺序**（静态代码块写在声明前则最终值由后写者决定，常见错答）；四种触发方式（访问静态变量/方法、`Class.forName`、`new`、`main` 所在类）与 `-XX:+TraceClassLoading` 验证、`Class.forName` 单参/三参重载 initialize 差异；**笔试题一 `DACBCB`**（实例代码块被编译进构造方法且位于原代码之前、类初始化一次 vs 构造方法多次）；`<clinit>` 不生成的三种情况；继承两规则（初始化子类必先初始化父类 / 访问父类静态变量不初始化子类）与 **2021 笔试题 2 vs 1**；练习题结论（创建数组不初始化元素类、`final` 右边非常量仍进 `<clinit>`）；附**类生命周期七块全章回顾表**、四步答题框架、40 秒口述版与 26 条追问预案（`<clinit>` 由 JVM 加锁只执行一次是静态内部类单例线程安全之根、`ExceptionInInitializerError` → 后续 `NoClassDefFoundError`、`ClassLoader.loadClass` 不初始化、接口初始化不要求父接口、父子类 `<clinit>`/`<init>` 完整顺序、三大被动引用陷阱）（来源：基础篇-9）
- [[编程/数据库/sql nosql的区别]] — SQL vs NoSQL 面试答题逻辑：四维度选型框架（数据模型/ACID-BASE/扩展性/查询能力）、30 秒速答版、五类高频追问与三个陷阱题
- [[编程/数据库/mysql/事务/事务的特性是什么？如何实现的？]] — 事务 ACID 四个特性与 InnoDB 实现映射（redo log / undo log / MVCC+锁 / 三者构成一致性）、30 秒速答版、redo 与 binlog 对比、隔离级别、MVCC 原理、长事务排查、@Transactional 失效场景
- [[编程/数据库/redis/BASE与CAP]] — CAP 是理论边界、BASE 是 AP 方案的落地方法论：不可能三角与"P 必选"纠错、BA/S/E 三步、秒杀下单串讲、PACELC、常见中间件 CP/AP 归类与 Redis 为何是 AP
- [[编程/数据库/redis/场景题/如何保证 redis 和 mysql 数据缓存一致性问题？]] — 旁路缓存 + 先更 DB 再删缓存、缓存属 AP 只能最终一致、过期时间兜底、MQ 重试与 Canal 订阅 binlog 两方案对比、四种双写顺序与延迟双删
- [[编程/数据库/redis/场景题/缓存雪崩、击穿、穿透是什么？怎么解决？]] — 三者分界线（一片/一个热点/压根不存在）与对比表、各自解法、五道闸分层防护、布隆过滤器原理与误判、互斥锁与逻辑过期
- [[编程/操作系统/进程管理/00 面试整理-进程 线程 协程]] — 进程/线程/协程面试整合篇：核心主线「**隔离性越高、切换成本越大**」的三档权衡、五步答题框架、九维度核心对比表（定位/内存/调度者/切换开销/通信/稳定性/主要问题/资源分配/并发规模）、切换开销的真正来源（进程贵在**切地址空间导致 TLB 与缓存失效**而非保存内容多）、场景化选型（多进程隔离 / 多线程吃多核 / 协程抗 IO 并发 / 线程+协程组合）、30 秒速答版与 27 条追问预案（线程共享与独享资源清单、协程协作式调度与 Go 异步抢占、可增长栈为何能开百万协程、JDK21 虚拟线程、Linux LWP 与 `task_struct` 统一视角、Amdahl 定律、工厂类比）
- [[编程/python/00 面试整理-Python asyncio 协程]] — Python asyncio 面试整合篇：核心主线「**单进程单线程的协作式并发——不提升运算速度，只复用 IO 等待间隙** + **严格区分 coroutine 对象与 task**」；回答框架（定调→event loop 心智模型→coroutine vs task→三种转 task 方式 await/create_task/gather→边界坑点）；关键区分（**coroutine 不变成 task 不执行**、**直接 `await` 协程不会变 task、只是内联串行执行 3 秒**、`create_task` 先注册再 await / `gather` 批量并发才 2 秒、取返回值必须 `await`）；30 秒速答版与 20 条追问预案（协程 vs 线程抢占/协作、为何不加速、并发≠并行、单线程用单核、阻塞式库会卡死事件循环、`asyncio.run` 入口、死循环卡死、gather 返回顺序）（来源：B 站 BV1oa411b7c9）
- [[编程/python/00 面试整理-Python GIL 全局解释器锁]] — Python GIL 面试整合篇：核心主线「**CPython 一把全局互斥锁，同一时刻一个线程执行字节码——只废掉'计算型'多线程，不影响'网络型'多线程**」；三层答题逻辑（一句话定调→历史成因=引用计数+竞态取舍→落到 I/O 密集 vs CPU 密集实际影响）；表格速记（I/O 密集主动释放 GIL 照常并发 / **CPU 密集抢锁切换反更慢**）与一句话记忆点；四种绕开方案（进程池 / NumPy 释放 GIL / 换解释器 / **3.13 的 --disable-gil PEP 703**）；30 秒速答版与 6 条追问预案（成因、8 核白搭吗、如何吃满 CPU、示例演示、3.13 展望、跨语言对比）；避坑（别以偏概全说"多线程没用"、GIL 是 CPython 独有、牺牲并行是代价）
- [[编程/python/00 面试整理-线程 协程 虚拟线程 Goroutine]] — 跨语言并发对比面试整合篇：核心主线「线程解决'真并行'、协程解决'超高并发资源瓶颈'」+ 先立目标→讲实现哲学→落场景选型；对比表（线程=OS 抢占 8MB 栈微秒切换上限几千 / 协程=用户态协作 KB 栈纳秒切换数万）+ 三大判定点（任务量选型表 + 线程碾压协程三维度 + FastAPI 避坑）；阻塞 vs 异步 IO 工具盘点+大坑（**Linux 文件 fd 不支持 epoll，aiofiles 是伪异步开线程池模拟**）；跨语言三连（Java 虚拟线程=同步写法换异步性能·有栈零侵入无 GIL / Go goroutine=语言原生 2KB 栈+GMP 自动调度+Channel 通信）；30 秒速答与 4 组追问预案（线程 vs 协程 / 场景选型 / 阻塞异步 / 跨语言）；金句（协程是屠龙刀线程是菜刀、Go'简单就是力量'）（来源：[[raw/编程笔记/python/DeepSeek.md]]）
- [[编程/操作系统/进程管理/线程和进程的区别是什么？]] — 线程与进程五维度对比原始笔记：本质（资源分配单位 vs 调度执行单位）、开销、稳定性、内存分配、包含关系
- [[编程/操作系统/进程管理/进程，线程，协程的区别是什么？]] — 进程/线程/协程三者定义与特点原始笔记
- [[编程/vibecoding/01 黑盒对接还是白盒重写：由耦合度决定的代码策略]] — 黑盒对接还是白盒重写：附加型/侵入型功能二分、三问判断法、依赖倒置与防腐层原则
- [[编程/mqtt/MQTT 协议：应用场景、特点与常见概念]] — 物联网轻量级通讯协议：轻量/可靠/安全/双向通信/多语言五大特点，客户端-Broker-主题三大核心概念（来源：B站 MQTT 课程三）
- [[编程/架构设计/分布式/分布式ID/00 面试整理-分布式ID]] — 面试整合篇：什么时候需要（分库分表/高并发微服务/多系统合并）、四种方案（UUID页分裂/数据库号段/Redis INCR/雪花算法）、64位雪花三段设计（时间戳有序+机器号唯一+序列号并发）、时钟回拨深水区、选型判断；四步答题框架、8 得分点、加分点与四类追问预案（原型边界/方案细节/时钟回拨/选型）
- [[编程/设计模式/生产者消费者模式]] — 核心定义、三大角色、核心协作机制（阻塞控制）、三大价值（解耦/削峰填谷/异步提速）、典型应用、Java BlockingQueue 代码示意、进阶避坑（队列大小/拒绝策略/防假死/序列化开销）
- [[编程/设计模式/生产者消费者模式面试答法]] — 面试整理篇：回答主线三段式（定性→角色+机制→价值）、五大记忆锚点、8 类高频追问预案（为何要缓冲区/手写 wait-notify 的坑/队列大小/拒绝策略/消费者假死/跨进程不重不丢/内存队列 vs MQ/与责任链观察者边界）🎯含面试层
- [[编程/设计模式/责任链模式使用场景是什么]] — 使用场景说明：接口请求校验（登录态→Token→权限→频率限制）解耦 if-else、抽象处理者 Handler + setNext 链式组装、增删节点不改已有代码
- [[编程/设计模式/责任链模式面试答法]] — 面试整理篇：回答主线三段式（定性→价值→标志性场景）、五大记忆锚点、6 类高频追问预案（vs if-else 何时值得用/与拦截器 Filter 中间件关系/手写链的坑/动态增删顺序/责任链 vs 装饰器·策略·观察者/框架层 SpringSecurity·Netty 落地）🎯含面试层

### 牛券（oneCoupon）项目

开源优惠券中台项目实战系列的面试整理。

- [[项目/牛卷/01 项目介绍]] — oneCoupon 项目整体介绍与技术选型背景
- [[项目/牛卷/02 项目启动]] — 项目本地启动与环境准备
- [[项目/牛卷/03 责任链实现参数校验]] — 责任链模式实现参数校验：三类校验拆分为独立处理器 + Spring 自动注册/Order 排序，体现单一职责与开闭原则
- [[项目/牛卷/04 分库分表（ShardingSphere）]] — 分库分表面试整理：决策链（30亿数据→拆分程度→分片键 shop_number→ShardingSphere 选型）🎯含面试层、记忆锚点、8 类追问预案（2000万依据/分片键后果/分片不均匀/读扩散/MyCat vs ShardingSphere/分库分表新问题/扩容迁移/能否不分表）与配置记忆模板
- [[项目/牛卷/05 线程池与延迟队列优化接口响应时间]] — 接口优化面试整理：核心思想「先执行、延迟确认」、线程池手写五参数（core=核数/max=2×核/SynchronousQueue/DiscardPolicy）与 Executors 三大坑、Redis 延迟队列兜底（sendNum 有值即成功为空才重做）、为何不用 MQ/为何 Redis 只兜底不主力、事务保证一致性 🎯含面试层、9 类追问预案与代码模板
- [[项目/牛卷/06 模板方法模式重构消息队列发送]] — 设计模式重构面试整理：模板方法把 MQ 发送胶水代码收敛为「父类定骨架（拼目标/普通vs延迟/日志）+子类定差异（buildBaseSendExtendParam/buildMessage）」、三层抽象（BaseSendExtendDTO/MessageWrapper/AbstractCommonSendProduceTemplate）、业务侧收敛到两行、消费者同步改 MessageWrapper🎯含面试层、6 类追问预案（模板方法 vs 普通继承/骨架里固定与可变/为何统一 MessageWrapper/与策略·工厂·装饰器区别/与 JdbcTemplate 关联）与代码模板

## 🎓 研究生

学术与学位相关的知识。

- [[研究生/盲审]] — 学位论文匿名评审制度详解（本科 vs 硕士 vs 博士）

## 🧠 自我管理

从个人日志中提取的行为模式和经验。

- [[日记/行为模式]] — 决策瘫痪、拖延循环、动力波动等重复性行为模式
- [[日记/空虚感分析]] — 午睡过长后的空虚感：多巴胺戒断、意义真空、时间断裂、身份撕裂
- [[日记/求职经验]] — 求职投递数据与实际反思
- [[日记/轨迹预测]] — 基于行为证据推演的三种可能结局与分岔点（考研/求职/家庭）
- [[日记/晨间提示词模板]] — 用"极小小目标 + 意义"替换"恐惧驱动"的每日系统提示词模板

## ⚙️ 维护文件

- [[../CLAUDE.md]] — LLM 维护规范（宪法文件）
- [[../raw/README]] — 源材料区使用说明

---

*随着知识库的增长，本目录将持续扩展新的分类和页面。*
