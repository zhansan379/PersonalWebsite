---
title: 知识库定时同步（scheduleCron 调度架构）
tags:
  - rag
  - ragent
  - 定时同步
  - 分布式锁
  - 租约锁
  - 数据库锁
  - 变更检测
  - 面试
created: 2026-08-25
updated: 2026-08-25
---

# 知识库定时同步（scheduleCron 调度架构）

> URL 来源的文档映射的是不断更新的远程在线资源，靠 `scheduleEnabled + scheduleCron` 定时抓取，采用「两张表 + 五组件 + 数据库租约锁 + 两级变更检测」的完整调度系统，实现**有变化才重新分块**。核心是三个设计：**数据库实现的租约型分布式锁**（lockOwner + lockUntil 两个字段 + 自动心跳续锁，不新增 Redis 基础设施）、**职责分离的五组件架构**、**两层并发控制**（任务级租约锁防多实例重复执行 + 文档级 CAS 抢占防定时刷新与手动分块冲突）。是 RAG 项目后端面试的高频考点。

> **这道题对应的「答题主线」**，如果面试官让你「讲一下知识库定时同步的完整设计」，可以按这条主线串起来：
> 业务场景（URL 文档会变、本地文件不会变）→ 数据模型先行（任务主表 + 执行历史表，表设计决定了实现）→ 定时扫描（enabled=1 ∧ nextRunTime<=now ∧ 无锁）→ 数据库租约锁（CAS 抢锁 + lockToken 防误释放 + 自动心跳续锁 + 关键阶段检测锁失效）→ 两级变更检测（HEAD 快速判断 ETag/Last-Modified，再 SHA-256 兜底）→ 两层并发控制（任务级租约锁 + 文档级 CAS）→ 有变化才重新分块、没变化 SKIPPED 跳过。
> ⚠️ 本文是**上篇（基础设施层）**：数据模型、架构设计、分布式锁、变更检测。调度引擎、执行流程、异常恢复在**下篇**（本文完成时源文档尚未放出）。

## 一、这是什么

业务场景：企业文档通常放在飞书、Notion、钉钉等在线协作平台，会不断被修改；但作者不会每次改完都去知识库重新上传。若不加定时同步，会出现**用户问最新制度、知识库答上周版本**的不一致问题。

关键区别：

- **本地文件上传**是一次性导入：上传后内容与对象存储一一对应，除非重新上传否则不变。
- **URL 来源**对应一个远程资源：URL 不变，但背后文档内容可能一直在变。

所以 URL 来源的文档支持两个额外配置：

- `scheduleEnabled`：是否开启定时同步
- `scheduleCron`：同步周期（cron 表达式）

配置好后系统自动完成链路：**定时扫描 → 抢任务锁 → 拉远程文件 → 检测变更 → 抢文档运行权 → 重新分块 → 更新状态**。

这不是一个简单的 `@Scheduled` 方法，而是一套调度系统，至少要解决四个问题：

1. 怎么扫描到期任务
2. 多实例部署时怎么防止同一任务被重复执行
3. 怎么判断远程文档有没有变
4. 分块过程中失败、丢锁、切换文件失败怎么做补偿（下篇）

## 二、数据模型：两张表

所有调度逻辑、锁机制、状态管理最终都落到数据库表。两张表：任务主表 + 执行历史表。

| 表 | 回答的问题 | 设计要点 |
| :--- | :--- | :--- |
| `t_knowledge_document_schedule`（主表） | 现在**该不该跑**、跑得怎么样 | 只保留当前状态，查询快，支撑扫描/抢锁/变更比对 |
| `t_knowledge_document_schedule_exec`（历史表） | **历史上每次**执行发生了什么 | 完整流水，可追溯排查、统计分析 |

### 2.1 任务主表

```sql
CREATE TABLE t_knowledge_document_schedule (
    id                VARCHAR(20) NOT NULL PRIMARY KEY,
    doc_id            VARCHAR(20) NOT NULL,
    kb_id             VARCHAR(20) NOT NULL,
    cron_expr         VARCHAR(64),
    enabled           SMALLINT DEFAULT 0,
    next_run_time     TIMESTAMP,
    last_run_time     TIMESTAMP,
    last_success_time TIMESTAMP,
    last_status       VARCHAR(16),
    last_error        VARCHAR(512),
    last_etag         VARCHAR(256),
    last_modified     VARCHAR(256),
    last_content_hash VARCHAR(128),
    lock_owner        VARCHAR(128),
    lock_until        TIMESTAMP,
    CONSTRAINT uk_doc_id UNIQUE (doc_id)
);
```

`doc_id` 上有唯一约束 → **一份文档最多一条 schedule 记录**。字段分四组理解：

| 分组 | 字段 | 作用 |
| :--- | :--- | :--- |
| **基础信息** | `docId` / `kbId` / `cronExpr` / `enabled` | 这个任务是谁、多久跑一次、是否启用 |
| **调度状态** | `nextRunTime` / `lastRunTime` / `lastSuccessTime` / `lastStatus` / `lastError` | 决定何时该跑、上次跑得如何 |
| **变更检测** | `lastEtag` / `lastModified` / `lastContentHash` | 存上次远程文件检测结果，给下一次比对用 |
| **分布式锁** | `lockOwner` / `lockUntil` | 实现数据库租约锁 |

扫描器每次查 `nextRunTime <= now` 的记录，执行完更新 `lastRunTime` 和 `nextRunTime`。

### 2.2 执行历史表

```sql
CREATE TABLE t_knowledge_document_schedule_exec (
    id            VARCHAR(20) NOT NULL PRIMARY KEY,
    schedule_id   VARCHAR(20) NOT NULL,
    doc_id        VARCHAR(20) NOT NULL,
    kb_id         VARCHAR(20) NOT NULL,
    status        VARCHAR(16) NOT NULL,
    message       VARCHAR(512),
    start_time    TIMESTAMP,
    end_time      TIMESTAMP,
    file_name     VARCHAR(512),
    file_size     BIGINT,
    content_hash  VARCHAR(128),
    etag          VARCHAR(256),
    last_modified VARCHAR(256)
);
```

主表 vs 历史表：

- 主表回答「这个任务现在是什么状态」
- exec 表回答「它历史上每次执行发生了什么」

以每小时同步一次为例，一天 24 次执行；只在主表保留最近一次就无法回答「过去一周执行多少次、成功率多少、哪些时段常失败」。主表**查询快**、历史表**可追溯**。

### 2.3 表结构与业务逻辑的对应关系

| 业务逻辑 | 对应的表字段 |
| :--- | :--- |
| 扫描到期任务 | `enabled=1 AND nextRunTime <= now AND lockUntil < now` |
| 抢锁 | 更新 `lockOwner`/`lockUntil`，条件是 `lockUntil < now` |
| 续锁 | 更新 `lockUntil`，条件是 `lockOwner` 匹配 |
| 释放锁 | 把 `lockOwner`/`lockUntil` 设为 NULL |
| 变更检测 | 比对远程 ETag / Last-Modified / SHA-256 与 `lastEtag` / `lastModified` / `lastContentHash` |
| 记录执行结果 | 插入 exec 记录，更新主表 `lastStatus` / `lastRunTime` / `nextRunTime` |

## 三、架构设计：职责分离的五个组件

把所有逻辑塞进一个类的问题：**单一类职责过重**、**无法单独测试某环节**、**难以扩展**（换 Redis 锁或换检测策略都得大改）。于是拆成五个组件，每个只做一件事。

### 3.1 KnowledgeDocumentScheduleJob（调度入口）

整个定时同步的入口，负责两件事：

1. **扫描到期任务**（每 10 秒）：查 `enabled=1 ∧ nextRunTime<=now ∧ lockUntil<now`；找到后先尝试抢锁，抢到才执行，抢不到直接跳过。
2. **恢复卡住文档**（每分钟）：把卡在 `RUNNING` 超阈值（默认 30 分钟）的文档重置为 `FAILED`。是进程崩溃后的兜底恢复。

设计思路：**只负责找到该跑的任务和兜底恢复异常状态，不负责具体刷新逻辑**。

### 3.2 ScheduleLockManager（锁管理器）

负责分布式锁的获取、续期、释放、自动心跳续锁。解决：**多实例同时扫描到同一任务时怎么保证只有一个在执行**。

四个核心方法：

- `tryAcquire(scheduleId, now)`：尝试获取锁，返回 lease 或 null
- `renew(lease)`：续期锁，返回是否成功
- `release(lease)`：释放锁
- `startHeartbeat(lease)`：启动自动心跳续锁

最有特色的是**自动心跳续锁**：传统做法是业务代码在每个耗时操作前手动 `renew`，容易遗漏；自动心跳启动后台线程周期性续锁，业务代码只需在关键阶段检测锁是否失效即可。

设计思路：**把锁的复杂性封装起来，业务代码不关心续期细节**。

### 3.3 ScheduleRefreshProcessor（刷新处理器）

定时同步的**总控台**，不负责单独做某件事，而是决定动作顺序、哪步跳过、哪步失败怎么收尾。`process(lease)` 编排 12 步：

心跳 → 校验任务 → 创建执行记录 → 变更检测 → 抢占文档运行权 → 上传新文件 → 执行分块 → 应用文件元数据 → 更新状态 → 文件清理 → 关闭心跳 → 释放锁。

用 `Phase` 枚举追踪执行阶段（INIT → DOC_OCCUPIED → CHUNK_STARTED → CHUNK_COMPLETED → FILE_SWITCHED），在关键阶段检测锁是否失效，按 Phase 精细化控制文件清理策略。

设计思路：**流程编排与具体实现分离，主线逻辑清晰**。

### 3.4 ScheduleStateManager（状态管理器）

更新 schedule 表与 exec 表状态。解决：**更新状态必须感知锁所有权，防止覆盖其他实例的状态**。核心方法均采用 `xxxIfOwned` 模式：

- `markSuccessIfOwned(lease, ctx, fetchResult, stored)`
- `markFailedIfOwned(lease, ctx, error)`
- `markSkippedIfOwned(lease, ctx, fetchResult)`
- `disableIfOwned(lease, reason)`

更新主表时都检查 `lockOwner` 是否匹配当前 `lockToken`；不匹配（锁已失效）则主表更新失败，但仍更新 exec 记录，并在 message 附加「调度锁已失效，未写回调度状态」标记。

设计思路：**状态更新必须是锁感知的**。

### 3.5 DocumentStatusHelper（文档状态助手）

文档状态的 CAS 更新与恢复。解决：**防止定时刷新和手动分块同时跑同一份文档**。四个核心方法：

- `tryMarkRunning(docId)`：CAS 抢占，条件 `ne(status, RUNNING)`
- `markFailedIfRunning(docId)`：失败时恢复文档状态
- `applyRefreshedFileMetadata(docId, stored)`：成功后应用新文件元数据
- `recoverStuckRunning(timeoutMinutes)`：恢复卡住的 RUNNING 文档

提供**第二层并发控制**（第一层是任务级数据库租约锁）。设计思路：用 **CAS 操作确保文档状态原子性更新**。

### 3.6 组件协作关系

> **ScheduleJob 扫描 → LockManager 抢锁 → RefreshProcessor 编排流程 → StateManager 更新状态 + DocumentStatusHelper 管理文档状态 + RemoteFileFetcher 检测变更**

每个组件只负责自己的职责，通过方法调用协作完成整个定时同步流程。

## 四、分布式锁：数据库实现的租约型分布式锁

### 4.1 为什么需要

3 个实例几乎同时扫描到同一 schedule，无锁会：同一远程文件被下载 3 次、同一文档分块 3 次、3 个实例互相覆盖主状态。分布式锁保证 **同一 schedule 同一时刻只能有一个实例执行**。

### 4.2 为什么选数据库锁而非 Redis

| 维度 | Redis 分布式锁 | 数据库租约锁 |
| :--- | :--- | :--- |
| 性能 | 高，内存操作 | 相对较低，磁盘操作 |
| 通用性 | 通用 | 只适合与业务数据同库的场景 |
| 成熟度 | 成熟（Redisson 等） | 需自己实现 |
| 依赖 | 需额外维护 Redis 高可用 | 不新增基础设施 |
| 数据一致性 | 锁状态与业务数据分离 | 锁和任务状态在一张表里 |
| 异常排查 | 跨系统查询（DB + Redis） | 只查数据库 |

场景特点：调度状态本来就在库里、锁粒度是 schedule 级、扫描频率不高（10 秒一次，每次最多 20 任务）、出问题排查只查库更方便。**架构上更收敛**。

### 4.3 为什么叫「租约锁」，租约体现在哪

这不是二者选一，而是**「租约锁是另一种形式的分布式锁——一把带租期的分布式锁」**，相当于 Redisson 看门狗的简单实现。

- `lockOwner`：谁持有锁（lockToken）
- `lockUntil`：锁何时到期

租约的核心语义——锁不是永久占有、只在一段时间内有效、到期不续租别人就能接管：

- 锁不是一直持有，而是带租期
- 到期会自动失效
- 持有者还能续租（心跳把 `lockUntil` 不断往后推 = 续租）

它同时解决定时调度最怕的两件事：**多实例同时执行**（抢到锁的执行，其余轮跳过）+ **实例挂了锁不释放**（锁在租期后自动失效）。所以准确叫法是：**数据库实现的租约型分布式锁**，语义像租房——现在归你使用，到期不续租别人接手。

### 4.4 获取锁（CAS）

把 `lockOwner` 改成自己的 token，只有锁不存在或已过期才能改成功：

```sql
UPDATE t_knowledge_document_schedule
SET lockOwner = ?, lockUntil = ?
WHERE id = ?
  AND (lockUntil IS NULL OR lockUntil < now)
```

这是典型的 **CAS（Compare-And-Swap）**。多实例并发执行，只有一个 affected rows = 1，其余为 0。

**为什么生成唯一 lockToken**：续锁和释放锁时要验证这把锁是不是我持有的。否则会出现：A 持锁执行慢 → 锁过期 → B 抢到同一任务 → A 执行完释放锁 → **A 误把 B 的锁释放**（进一步可能 C 也抢，多个实例并发）。所以获取锁时生成唯一 token，续/释放都验证 token 匹配。

**过期时间默认 900 秒（15 分钟），最小 60 秒**。这是经验值：太短任务没跑完锁就过期、太长宕机后锁等太久影响恢复；15 分钟平衡两者，配合心跳续锁，长任务不会被中断。

### 4.5 自动心跳续锁

一次刷新（下载 + 分块 + 上传）可能几分钟，固定 15 分钟锁会中途过期。

- **传统手动续锁**：每个耗时操作前手动 `renew`。问题：业务代码要记住在哪续锁、容易遗漏、时机不好把握。
- **自动心跳续锁思路**：获取锁后启动后台心跳线程周期性 `renew`；业务代码只在关键阶段检测锁是否失效；任务结束关闭心跳线程。

**心跳间隔 = 锁持有时间 / 3，限制在 5~60 秒**。默认下：900/3=300 秒，但被上限压到 **60 秒**。1/3 是经验值（太频繁浪费资源、太稀疏来不及时重试），也是 Redisson 看门狗默认比例。

**心跳失败处理**：`renew` 返回 false 说明锁被抢走 → 心跳线程 `markLost()` 标记锁失效 → 业务逻辑在关键阶段检测 `heartbeat.isLost()` 中止。**不直接抛异常**是因为业务可能正在执行上传等操作，需要一个安全时机中止；心跳只负责标记，业务逻辑自己决定何时中止。

### 4.6 锁失效检测

因为心跳是异步的，业务逻辑可能还在执行、心跳已发现续锁失败。所以在**高成本操作前**（抢占文档运行权前、执行分块前）主动检测。`shouldAbortForLeaseLoss()` 两重检测：

1. **查心跳标记**：`heartbeat.isLost()` 则中止
2. **主动续锁一次**：`lockManager.renew(lease)` 返回 false 则标记 lost 并中止

两重结合：只查标记可能心跳线程还没来得及执行；只主动续锁可能心跳已发现失败但业务还没检测到。确保锁失效能被及时发现。

### 4.7 释放锁

在 `finally` 中执行，无论成功/失败/跳过都释放：

```sql
UPDATE t_knowledge_document_schedule
SET lockOwner = NULL, lockUntil = NULL
WHERE id = ? AND lockOwner = ?
```

同样验证 `lockOwner`，防误释放其他实例的锁（避免 A 过期后 B 持锁、A 结束反把 B 的锁释放 → 多个实例并发）。

```java
finally {
    if (heartbeat != null) heartbeat.close();
    lockManager.release(lease);
}
```

## 五、远程文件变更检测：两级策略

### 5.1 为什么需要

每小时同步一次=一天 24 次，但文档可能一周才更新一次 → 168 次触发只有 1 次真需要刷新，其余都是浪费（下载几十 MB、分块几百 chunk、多次 Embedding API、写向量库）。所以**下载和分块之前先判断文件是否真的变了**。

### 5.2 第一级：HEAD 请求快速判断

发 HEAD 请求拿远程资源元数据，不下载内容，两个标准 Header 标识资源版本：

- **ETag**：资源唯一标识（哈希或版本号），内容变则变
- **Last-Modified**：最后修改时间，内容变则更新

当前实现：远程的 ETag **或** Last-Modified 任意一个与上次相同 → 直接短路判定未变。优点：不下载文件、几十毫秒、未变直接短路。局限：有些服务器不支持 HEAD 或不返回这两个 Header → 需要第二层兜底。

### 5.3 第二级：下载并计算内容哈希

HEAD 失败或未命中「未变化」短路 → 下载文件计算 SHA-256。巧妙设计：**边下载边算哈希，只遍历一次数据流**（`DigestInputStream` 包裹 InputStream，读的同时喂给 sha256Digest）。

下载完比对 `lastContentHash`，相同 → 删除临时文件返回 SKIPPED；不同 → 返回 CHANGED。SHA-256 冲突概率极低可视为内容唯一标识，代价是下载全量 + CPU 密集计算，但比重新分块 + Embedding 成本低很多。

### 5.4 两级配合与 RemoteFetchResult

- 先 HEAD 拿 ETag/Last-Modified
- 任一与上次相同 → SKIPPED（文件没变）
- HEAD 失败或未命中短路 → 下载算 SHA-256
- 哈希相同 → SKIPPED；哈希不同 → CHANGED

这是典型的「先 cheap check，再 expensive check」。

`RemoteFetchResult` 实现 `AutoCloseable`：变更检测会下载临时文件，未变化需删除防泄漏。用 try-with-resources 自动管理临时文件生命周期：

```java
try (RemoteFetchResult fetchResult = remoteFileFetcher.fetchIfChanged(...)) {
    if (!fetchResult.changed()) return;   // 没变跳过
    // changed=true 时使用 fetchResult.tempFile() 处理
}
// 离开作用域，tempFile 自动删除
```

它携带 `changed()` / `tempFile()` / `size()` / `contentHash()` / `etag()` / `lastModified()` / `message()`（跳过原因），这些信息被记录到 exec 表和 schedule 表便于追溯。

## 六、面试题目与答案

### 6.1 定时同步和本地上传有什么区别？为什么要定时同步？

**考点**：业务场景、URL vs 文件模型差异。

**答案**：本地文件是一次性导入，上传后与对象存储一一对应、内容不变；URL 来源对应不断更新的远程在线资源，URL 不变内容却可能一直在变。不加定时会「用户问最新、答上周版」的不一致。所以 URL 文档支持 `scheduleEnabled + scheduleCron`，定时抓取、检测变化、有变化才重新分块。

### 6.2 多实例部署时，怎么防止同一个定时任务被重复执行？

**考点**：分布式锁、租约锁。

**答案**：用数据库租约锁。每个 schedule 记录有 `lockOwner + lockUntil`，抢锁是 `UPDATE ... WHERE (lockUntil IS NULL OR lockUntil < now)` 的 CAS——多个实例同时执行只有 1 个 affected rows=1，其余抢锁失败跳过。结合 `lockToken` 唯一性防误释放、自动心跳续锁防止长任务锁过期、关键阶段检测锁失效兜底。

### 6.3 为什么用数据库锁而不是 Redis 锁？

**考点**：分布式锁选型。

**答案**：这个场景调度状态本来就存在数据库表里，加两个字段即可实现；锁粒度是 schedule 级与主键对应；扫描频率低（10 秒一次、最多 20 任务）数据库扛得住；异常排查只查库更方便（哪个实例持锁、何时过期一眼可见）。选数据库锁**架构更收敛、不新增 Redis 故障点**。代价是需自己实现租约/续期，性能不如 Redis。

### 6.4 什么是租约锁？和普通分布式锁什么关系？

**考点**：锁模型理解。

**答案**：普通分布式锁强调**作用范围**（多实例互斥）；租约锁强调**持锁模型**（锁带租期、到期自动失效、可续租）。租约锁是另一种形式的分布式锁——一把带租期的分布式锁，类似 Redisson 看门狗的简单实现。语义像租房：现在归你用、到期不续租别人接手、还在用就主动续租。既防多实例并发，又在持有者宕机后自动释放。

### 6.5 为什么要 lockToken？释放锁为什么还要校验 owner？

**考点**：锁误释放、ABA/竞争防护。

**答案**：防止「A 持锁执行慢 → 锁过期 → B 抢到 → A 执行完释放锁把 B 的锁误释放 → C 又抢到 → B/C 并发」。每次获取生成唯一 token，续锁和释放都用 `WHERE lockOwner = ?` 校验，只操作自己持有的锁。

### 6.6 自动心跳续锁是怎么设计的？为什么间隔取 1/3？

**考点**：看门狗机制、续锁策略。

**答案**：获取锁后启动后台心跳线程周期性 `renew`，业务代码不必手动续锁，只在关键阶段检测锁是否失效。间隔 = 锁持有时间 ÷ 3，夹在 5~60 秒，默认 900/3=300 但被上限压到 60 秒。1/3 是经验值：太频繁浪费资源、太稀疏来不及重试；这是 Redisson 看门狗经过实践验证的默认比例。心跳续锁失败 → `markLost()` 标记，业务在安全时机中止。

### 6.7 锁失效检测为什么是「两重」？为什么不直接抛异常？

**考点**：异步心跳 vs 同步业务的不一致、中止时机。

**答案**：心跳是异步的，业务逻辑推进到关键阶段时心跳线程可能还没执行、或已发现失败但业务没检测到。所以既有「查 `heartbeat.isLost()` 标记」又有「主动 `renew` 一次」两重保障。不抛异常是因为业务可能正在执行上传等操作，需要安全时机中止；心跳只负责标记 lost，业务自己决定何时中止。

### 6.8 两级变更检测分别是什么？为什么这样设计？

**考点**：成本控制、cheap check / expensive check 策略。

**答案**：第一级 HEAD 请求拿 ETag/Last-Modified 元数据（不下内容、几十毫秒），任一与上次相同即短路判定未变；局限是有些服务器不支持 HEAD 或不返回这两个 Header。第二级下载文件并边下载边算 SHA-256，与 `lastContentHash` 比对。本质是「先 cheap check 快跑、miss 了再 expensive check」，避免每次定时触发都全量下载 + 分块 + Embedding，节省大量资源和成本。

### 6.9 两层并发控制分别防什么？

**考点**：多级并发防护。

**答案**：第一层**任务级数据库租约锁**（schedule 的 lockOwner/lockUntil）防同一 schedule 被多个实例重复执行；第二层**文档级 CAS 抢占**（`tryMarkRunning`，`ne(status, RUNNING)`）防定时刷新和手动分块同时跑同一份文档。两层配合，既管实例间，也管实例内不同触发来源。

### 6.10 执行历史表有什么用？为什么不能只用主表？

**考点**：状态 vs 流水、可观测性。

**答案**：主表只保留当前/最近一次状态，用于「现在该不该跑、跑得怎么样」的快速查询；exec 表保留每次执行流水，用于回答「过去一周执行多少次、成功率、哪些时段常失败、失败原因」。每小时同步一次一天就 24 条记录，只留主表无法统计与排查。

## 七、相关页面

- [[raw/编程笔记/ragent/知识库/《AI大模型Ragent项目》——深度解析知识库定时同步的架构设计]] — 源文档（本文为上篇）
- [[知识库文档分块接口（startChunk）]] — 同项目兄弟页：`startChunk` 中调用 `scheduleService.upsertSchedule` 注册定时任务，衔接本页的调度机制
- [[项目/ragent/线程池使用规范与设计思想]] — 调度锁心跳线程属长驻线程，关联优雅停机、`catch` 中断后恢复 `interrupt()` 等约定
- [[编程/ragent/RAG 评测初始化与新增文档流程]] — 同项目文档知识库的初始化与增量维护（⚠️ 页面尚未创建）