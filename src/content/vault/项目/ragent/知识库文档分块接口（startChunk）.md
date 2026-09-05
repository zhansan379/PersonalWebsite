---
title: 知识库文档分块接口（startChunk）
tags:
  - rag
  - ragent
  - rocketmq
  - 事务消息
  - 并发控制
  - 面试
created: 2026-08-08
updated: 2026-08-08
---

# 知识库文档分块接口（startChunk）

> 知识库「上传」与「分块」拆成两个接口，分块由 RocketMQ 事务消息异步触发；用 CAS 防重、事务消息保证「状态更新 + 消息投递」原子性、`persistChunksAndVectorsAtomically` 跨表原子写入，是 RAG 项目后端面试的高频考点。

> **这道题对应的「答题主线」，如果面试官让你「讲一下这个分块接口的完整设计」，可以按这条主线串起来：**
> 职责分离拆接口 → 异步处理用 MQ 解耦 → RocketMQ 事务消息保证「状态更新 + 消息发送」原子性 → CAS 防重 → 消费者异步执行 → 分块日志做可观测性 → persistChunksAndVectorsAtomically 跨表原子写入 → 事务边界精确控制（事务内不做耗时操作）→ 失败用新事务标记状态、支持重试。
## 一、整体设计

### 1.1 两个阶段

- **同步阶段**：用户点击执行分块 → Controller 调用 `startChunk` → 发送 RocketMQ 事务消息（本地事务回调内完成 CAS 更新 + 注册定时任务）→ 立即返回。只涉及 DB 更新和消息发送，响应快。
- **异步阶段**：MQ Consumer 消费 → `executeChunk` → `runChunkTask`（解析、分块、向量化、原子写库）→ 更新状态。耗时长，用户无需等待，前端轮询文档状态即可。

### 1.2 为什么拆成两个接口

核心是**耗时差异 + 职责分离**：

- upload 只做对象存储 + 元数据入库，耗时可控（秒级）；
- startChunk 要解析文件、分块、多次调用 Embedding API、写向量库，大 PDF 可能耗时几分钟。

拆分的好处：**职责清晰**、**灵活控制**（批量触发 / 只重分块不重传）、**支持重试**（失败后直接重新触发，不用重传文件）、**方便扩展**（调整 `chunkSize` 等参数只需重新触发）。

## 二、核心设计要点

### 2.1 CAS 并发控制（防重复触发）

```sql
UPDATE t_knowledge_document
SET status = 'running', updated_by = 'xxx'
WHERE id = ? AND status != 'running'
```

关键在 `WHERE status != 'running'`：第一个请求把状态改成 `running`，并发请求 UPDATE 匹配 0 行 → 抛「文档分块操作正在进行中」。这是**乐观并发控制**，不加锁、性能好。

**为什么不用分布式锁**：场景本质是「状态判断 + 状态更新」，一条带条件的 SQL 天然原子；CAS 语义更匹配（状态符合预期才更新），且只依赖数据库，少一个 Redis 故障点。

### 2.2 RocketMQ 事务消息

**解决的问题**：DB 更新成功但消息发送失败 → 文档卡死在 `running` 无法重触发；消息发送成功但 DB 更新失败 → 消费者开始分块而状态还是 `pending`，数据不一致。

**四步流程**：发送半消息（消费者不可见）→ 执行本地事务（CAS 更新 + 注册定时任务）→ 提交或回滚（通知 Broker）→ **事务回查**（应用通知前宕机时，Broker 主动查询本地事务状态；项目用 `KnowledgeDocumentChunkTransactionChecker` 查文档状态是否已是 `running` 来决定提交/回滚）。

### 2.3 异步处理链路

- 消费者通过 `@RocketMQMessageListener` 注册，`onMessage` 中**手动设置 UserContext**（异步线程无 HTTP 上下文，`event.operator` 用于审计，try-finally 清理防线程池泄漏）。
- `runChunkTask` 创建分块日志 → 按 `ProcessMode` 分发：
  - **CHUNK 模式**：固定流程（读对象存储 → Tika 解析 → 按 `chunkStrategy` 分块 → Embedding → 返回 `List<VectorChunk>`）；
  - **PIPELINE 模式**：执行自定义节点序列，设置 `skipIndexerWrite=true`，让 `IndexerNode` 跳过写向量库、只把 chunks 放入 context，真正的写入统一在原子写方法中与 DB 写入同事务。

### 2.4 原子性写入

`persistChunksAndVectorsAtomically` 用 `TransactionTemplate` 在**同一事务**中执行 5 个操作：

1. DELETE 旧 chunks → 2. INSERT 新 chunks → 3. DELETE 旧 vectors → 4. INSERT 新 vectors → 5. UPDATE 文档状态（`success` + `chunkCount`）。

- **为什么要先删后插**：新旧 chunk 数量可能不匹配（100 → 50），UPDATE 无法删除多余的旧数据；DELETE+INSERT 数据完全替换，不留脏数据。
- **为什么两个表必须同事务**：chunk 有 vector 无 → 检索不到；vector 有 chunk 无 → 前端看不到记录，都会让用户觉得是 bug。
- **向量库事务支持**：pgvector 的向量表就是普通 PG 表，`JdbcTemplate` 自动参与外层 Spring 事务，可保证原子性；Milvus 不支持事务，需「先写 Milvus 成功后再写 PG，失败时补偿清理」方案。这也是项目选 pgvector 而非 Milvus 的原因之一。

### 2.5 事务边界设计

原则：**事务内不做耗时操作**。

- `startChunk`：不加 `@Transactional`，事务由 RocketMQ 事务消息框架管理（`sendInTransaction` 内部用 `TransactionTemplate` 包裹回调），只有几毫秒；
- `runChunkTask`：不加事务（含文件解析、分块、向量化等分钟级操作，加事务会**耗尽数据库连接池**）；
- `persistChunksAndVectorsAtomically`：手动开启事务，只在需要原子性的写入处开事务。

**异常处理**：`markChunkFailed` 用**新事务**（REQUIRES_NEW）执行——若在当前事务中改状态，事务回滚时状态更新也回滚，文档仍卡在 `running` 无法重触发。

### 2.6 分块日志（可观测性）

`t_knowledge_document_chunk_log` 每次执行插入一条记录：`status`、`processMode`、`chunkStrategy`、各阶段耗时（extract/chunk/embed/persist/total）、`chunkCount`、`errorMessage`。

- **性能分析**：`extractDuration` 长 → 解析慢；`embedDuration` 长 → Embedding API 慢；
- **问题排查**：`errorMessage` 直接记录异常信息，不用翻全部日志；
- **历史记录**：支持多次重分块对比（如 `chunkSize=500` vs `1000` 的 `totalDuration`）。

### 2.7 RocketMQ 在本项目中的作用

RocketMQ 是项目异步化与最终一致性的核心基础设施，主要承担三方面作用：

1. **异步任务解耦（削峰）**：把耗时操作从 HTTP 请求线程剥离。`knowledge-document-chunk_topic`（`KnowledgeDocumentChunkConsumer`）异步执行分块/向量化/写库，`knowledge-base-cleanup_topic`（`KnowledgeBaseCleanupConsumer`）异步清理向量空间、文件存储等物理资源，`message-feedback_topic`（`MessageFeedbackConsumer`）异步持久化用户反馈。生产与消费之间隔着 Broker 磁盘缓冲，请求线程发完消息即返回，消费端默认单条串行处理——天然削峰，无需显式限流配置。
2. **事务消息保证最终一致性**：通过 `sendInTransaction` + `DelegatingTransactionListener` 实现「半消息 → 本地事务 → Commit/Rollback → 回查」全流程，把 DB 写操作与 MQ 投递绑定为原子操作；生产者宕机时由 Broker 回调回查兜底（详见 2.2）。


## 三、面试题目与答案

### 3.1 为什么把「上传」和「分块」拆成两个接口？

**考点**：异步化思维、职责分离。

**答案**：核心是耗时差异（upload 秒级、分块分钟级）与职责分离。合并会让用户上传后干等；拆开后获得灵活控制（批量触发/只重分块）、重试能力（失败重触发不重传）、可扩展性（调整分块参数只重触发）。

### 3.2 RocketMQ 事务消息解决了什么？原理是什么？

**考点**：分布式事务、消息可靠投递。

**答案**：解决「DB 更新」与「消息发送」的一致性问题。流程：发半消息（消费者不可见）→ 执行本地事务 → 成功提交 / 失败回滚 → 应用宕机时 Broker 事务回查。保证本地事务与消息投递原子性。回查实现：查文档状态是否为 `running`。

### 3.3 CAS 防重，为什么不用分布式锁？

**考点**：乐观并发 vs 悲观锁、选型。

**答案**：防重复触发本质是「状态判断 + 状态更新」，一条 `UPDATE ... WHERE status != 'running'` 就具备原子性。CAS 语义更匹配、只依赖数据库（少一个 Redis 故障点）、省一次网络往返。**比喻**：看桌子有没有人坐（CAS）vs 锁住整个房间再看（分布式锁）。

### 3.4 startChunk / runChunkTask 为什么不加 @Transactional？

**考点**：长事务危害、事务边界。

**答案**：startChunk 的事务由事务消息框架管理，自己加 `@Transactional` 会把发半消息的网络请求包进事务；runChunkTask 含分钟级耗时操作，加事务会持有 DB 连接导致**连接池耗尽**。原则是「事务内不做耗时操作」，只在写入处用 `TransactionTemplate` 开短事务。

### 3.5 如何保证 chunk 表和 vector 表的一致性？

**考点**：跨表/跨库原子写、向量库选型。

**答案**：`TransactionTemplate` 中 5 步操作（删旧 chunks → 插新 chunks → 删旧 vectors → 插新 vectors → 更新文档状态）同事务。两表必须同事务，否则出现「有 chunk 检索不到」或「检索到却看不到 chunk」。pgvector 支持事务（普通 PG 表 + JdbcTemplate），Milvus 不支持需补偿方案。

### 3.6 为什么 chunk 表「先删后插」而不是 UPDATE？

**考点**：数据替换策略。

**答案**：新旧数量可能不匹配（100 → 50），UPDATE 无法删除多余的旧 chunk；DELETE+INSERT 完全替换、不留脏数据，无需考虑数量差异。

### 3.7 异步消费者为什么手动设置 UserContext？

**考点**：上下文传递、审计、线程安全。

**答案**：消费者线程无 HTTP 上下文，`event.operator` 记录操作人用于审计；`try-finally` 清理，防止线程池复用导致上下文泄漏到后续任务。

### 3.8 分块日志表有什么用？

**考点**：可观测性、性能分析。

**答案**：记录每次执行的各阶段耗时用于定位瓶颈（`embedDuration` 长 → Embedding API 慢）、`errorMessage` 用于快速排查、完整历史支持重分块对比。

### 3.9 `markChunkFailed` 为什么在新事务中执行？

**考点**：事务回滚与状态一致性。

**答案**：在当前事务中更新状态会随事务回滚，文档仍卡在 `running` 无法重触发；用新事务（REQUIRES_NEW）保证状态独立提交为 `failed`，用户可重新触发分块。

## 四、相关页面

- [[raw/编程笔记/ragent/《AI大模型Ragent项目》——知识库文档开始分块接口]] — 源文档
- [[编程/rag/RAG 综述（2024 经典论文）]] — RAG 三代范式与架构背景
- [[编程/agent/RAG 系统的 Prompt-Context-Harness 落地指南]] — RAG 工程实现方法论（⚠️ 页面尚未创建）
- [[编程/mq/2.为什么需要MQ？或者说MQ的作用？有什么缺点？]] — MQ 解耦/异步/削峰基础
- [[编程/ragent/RAG 评测初始化与新增文档流程]] — 同项目后续文章（文档分块的前置：初始化与新增文档）（⚠️ 页面尚未创建）
