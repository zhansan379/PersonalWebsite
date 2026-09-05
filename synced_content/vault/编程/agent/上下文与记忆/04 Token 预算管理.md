---
title: Token 预算管理
tags:
  - token-budget
  - context-window
  - compaction
  - claude-code
  - llm
  - 面试
created: 2026-05-26
updated: 2026-08-15
---

# Token 预算管理

> 上下文窗口 200K，不等于你能用 200K。系统提示词、工具定义、输出预留各自吃掉一块，剩给对话历史的远比看起来少。Token 预算管理的核心就是精确计算还剩多少、什么时候该触发压缩。

Token 预算管理（由 `TOKEN_BUDGET` feature flag 控制）主要有三个作用：

1. **防止过早停止**：当 AI 消耗达到 90% 预算但未完成时，自动注入 nudge 消息让 AI 继续工作。
2. **检测收益递减**：如果连续 3 次续写且每次增量都小于 500 tokens，则认为收益递减，提前终止。
3. **UI 显示**：在 Spinner 组件中实时显示预算进度和预计剩余时间。

## 🎯 答题逻辑（骨架）

```
1. 先纠正前提：200K ≠ 能用 200K            ← 证明你真算过账单，而不是只看过宣传页
   系统提示 15-25K + 工具定义 10-20K + 输出预留 8K，剩下才归对话历史
   硬规则：input_tokens + max_tokens ≤ 上下文窗口
2. 拆成两层预算：QueryEngine vs query()      ← 证明你知道"钱"和"token"不是一回事
   QueryEngine 管美元/轮次（能不能继续跑）
   query() 管 token/长度（断了怎么接着跑）
3. 给出有效窗口公式 + 三条水位线              ← 证明你看过源码常量，不是拍脑袋
   effectiveWindow = 200K − min(maxOutputTokens, 20K) = 180K
   再减 AUTOCOMPACT_BUFFER 13K 触发压缩；提前 20K 警告；最后 3K 强制阻塞
4. 讲压缩阶梯：Microcompact → Autocompact     ← 证明你懂"不是一到线就全量压"
   Microcompact 换占位符续命 → 顶不住才 fork 只读子 Agent + 共享 Prompt Cache
5. 讲"怎么知道还剩多少"                       ← 证明你处理过可观测性
   usage 锚点 + 字符数 × 4/3 估算；剩余预算是"氧气表"，可跨压缩结转
6. 收在 API 契约：max_tokens 与 stop_reason    ← 证明你踩过被截断的坑
   max_tokens 必须显式传（不传 400）；stop_reason == "max_tokens" 才知道要续写
```

**关键心态**：这题考的**不是"上下文满了怎么办"，而是你有没有在生产里被 token 咬过**。面试官在听三件事：你能不能把上下文窗口、`max_tokens`、剩余预算这三个东西**分清楚**；你能不能报出**具体常量和公式**（20K 摘要预留、13K 压缩余量、3K 最后防线）；你处理截断时是**续写**还是傻乎乎重试。只回答"快满了就调用一下压缩/摘要"，等于承认自己只用过 API、没实现过循环。

**分水岭术语**：**有效窗口 effectiveWindow**、**水位线（Autocompact 阈值）**、**Microcompact**、**跨压缩结转**、**`stop_reason = "max_tokens"`**。这五个词能自然说出来，基本判定你实现过 Agent 主循环。

## 〇、双层预算模型：QueryEngine vs query()

Claude Code 的预算和恢复机制运行在**两个层级**上，各自关心不同的事：

| 维度 | QueryEngine（对话级） | query()（单次请求级） |
|---|---|---|
| **作用域** | 对话全生命周期 | 单次查询循环 |
| **状态** | 持久化（mutableMessages, usage） | 循环内（State 对象每次迭代重新赋值） |
| **预算追踪** | USD/轮次检查、结构化输出重试 | Task Budget 跨压缩结转、Token 预算续写 |
| **恢复策略** | 权限拒绝、孤儿权限 | PTL 排水/压缩、max_output_tokens 升级/重试 |
| **关心什么** | 钱、权限 | token、长度 |
| **出问题做什么** | 拒绝、重授权 | 压缩、续写、重试 |

> **预算追踪决定"能不能继续跑"，恢复策略决定"断了怎么接着跑"。**

**直观理解**：QueryEngine 是财务——"这整场对话不能花超过 $10"；query() 是工程——"这一条消息最多 8K tokens，不够就压缩再试"。两层协同：QueryEngine 设美元硬顶防账单爆炸；query() 在单次请求内精确管理 token，输出截断时自动续写。

## 一、上下文窗口的真实账单

### 1.1 几个容易混淆的概念

全篇术语以此表为准，后文不再重复定义：

| 术语 | 本质 | 备注 |
|---|---|---|
| **上下文窗口** | 模型一次前向传播的总容量上限 | 标称值，如 200K / 1M |
| **输入 Input** | 这次实际塞进去的内容（system + 历史 + 文件 + 当次问题） | 必须 ≤ 上下文窗口 |
| **输出 Output** | 模型这次最多生成多少 token（独立上限） | 默认 8K，被截断时升级到 64K |
| **max_tokens** | 「输出上限」对应的 API 参数名，单轮 output 天花板（硬上限） | Anthropic 要求显式传，不传直接 400，见 §八 |
| **剩余预算** | 当前任务*还剩多少 token 可以用*（软上限，**可跨轮、跨压缩结转**） | 与 max_tokens 是两码事，见 §七 |
| **有效上下文** | 模型仍能稳定利用信息的那段"高质量区" | 总是 ≤ 标称上下文，随任务难度收缩 |
| **有效窗口 effectiveWindow** | 压缩算法眼中的"满"= 上下文窗口 - 摘要输出预留 | 计算见 §2.1 |

核心公式：**Input + Output ≤ Context Window**，即 `input_tokens + max_tokens ≤ 上下文窗口`，否则请求非法。

### 1.2 200K 窗口的实际分配

```
上下文窗口（200K）
├── 系统提示词     ~15-25K  ← 大部分被缓存，成本低
├── 工具定义       ~10-20K  ← 含 MCP 工具
├── 用户上下文     若干     ← CLAUDE.md、git status 等
├── 输出预留       8K-64K  ← maxOutputTokens
│   ├── 默认 8K             ← 覆盖 99% 需求（p99 输出 = 4,911 tokens）
│   └── 被截断→升级 64K     ← MOT（Max Output Tokens）恢复机制
└── 剩余 ≈ 实际可用于对话历史的空间
```

### 1.3 为什么 maxOutputTokens 默认只有 8K？

API 服务端根据 `max_output_tokens` 预留计算资源（slot）。如果每个请求都声明 32K 但实际只用 5K，服务端的 slot 利用率只有 1/6。8K 覆盖了 99% 的需求（p99 输出 = 4,911 tokens），是服务端资源利用率的最佳平衡点。

**不要手贱改成 32K"以防万一"**——你大概率用不到，但服务端会一直为你预留着。

> ⚠️ 待核对：[[03 Claude Code 上下文工程#5.2 输出 Token 预留]] 的源材料记 Sonnet 默认 `max_output_tokens = 16,000`，与本页的 8K 冲突（且"8K 覆盖 99% 需求"的论证只对 8K 成立），需回 raw 核对后统一。

## 二、有效上下文窗口的计算

### 2.1 为什么要单独算？

Autocompact 需要留出空间给"压缩摘要的输出"。如果按 200K 算阈值，摘要写一半就爆了。

```
effectiveWindow = contextWindow - min(maxOutputTokens, 20,000)
                = 200,000 - 20,000
                = 180,000  ← 压缩算法实际以此为"满"
```

`MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20,000`：基于 p99.99 压缩摘要输出 17,387 tokens，加一点余量。

### 2.2 三层水位线

以默认 200K 窗口为例：

```
200K ──────────────────────────── 标称上限
197K ─── 🚫 强制阻塞              = 200K - 3K (MANUAL_COMPACT_BUFFER)
                                    新消息被阻止写入
180K ─── 🔄 Autocompact 触发      = 200K - 20K - 13K
167K ─── ⚠️ 警告闪烁              = 180K - 20K (WARNING_BUFFER)
                                    系统提示但不动手
                                     ↓
                              对话历史增长方向 ↑
```

| 常量 | 值 | 用途 |
|---|---|---|
| `AUTOCOMPACT_BUFFER_TOKENS` | 13,000 | 留给"执行压缩操作本身"的安全余量 |
| `WARNING_THRESHOLD_BUFFER_TOKENS` | 20,000 | 提前 20K 开始警告 |
| `MANUAL_COMPACT_BUFFER_TOKENS` | 3,000 | 最后防线 |
| `MAX_OUTPUT_TOKENS_FOR_SUMMARY` | 20,000 | 压缩摘要的输出预留 |

### 2.3 为什么 AutoCompact 触发线不是固定的？

触发公式：

```
autoCompactThreshold = effectiveWindow - AUTOCOMPACT_BUFFER_TOKENS
                     = (200K - 20K) - 13K = 167K（相对有效窗口的 92.8%）
```

但如果 slot-cap feature flag 开启，`maxOutputTokens` 被限制为 8K：

```
effectiveWindow = 200K - 8K = 192K
threshold = 192K - 13K = 179K  ← 阈值上移了 12K
```

阈值会随 `maxOutputTokens` 和模型窗口大小的变化而动态调整。可通过 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 环境变量按百分比覆盖。

## 三、Microcompact：Autocompact 之前的缓冲

并非一到 180K 就立即全量压缩。在此之前，系统先走 **Microcompact**：

- 清理旧的工具调用结果（FileRead、Bash、Grep、Glob 等），替换为占位符
- 剥离图片/文档附件
- 每次释放一些 token，**可能把 Autocompact 推迟很久甚至永远不触发**

只有 Microcompact 也顶不住了，才进入全量 Autocompact。详见 [[03 Claude Code 上下文工程#Level 3 Microcompact]]。

## 四、Autocompact 的执行机制

### 4.1 为什么 fork 子 Agent？

主线程不能自己压缩自己，有两个致命问题：
- **上下文污染**：摘要任务混入当前对话，影响主回答质量
- **死锁风险**：摘要本身占 token，直接撑爆主线程

所以：**临时 fork 一个只读的副 Agent**，专门生成摘要，不参与主对话。

### 4.2 复用主线程的 Prompt Cache

这是性能优化的关键。主线程已经把大量上下文加载进 cache，fork 出来的 Agent **共享同一个 cache key**：

- 不用重新上传几十万 token
- 摘要请求极快、极便宜
- 不会因为重复传上下文而提前爆掉

> 一句话：用最小的代价，借主线程已经付过钱的上下文，去生成摘要。

### 4.3 如果摘要请求自己也爆了？

最讽刺的场景：为了压缩发起的请求，自己超出了上下文窗口。

此时 `truncateHeadForPTLRetry()` 接管——**Truncate Head（砍头）+ Prompt Too Long + Retry**：

| 删除优先级 | 内容 |
|---|---|
| ✅ 最先删 | 最早的用户/助手普通对话 |
| ✅ 其次 | 老旧的工具调用结果 |
| ⚠️ 尽量不删 | 系统 prompt、当前任务相关文件 |
| ❌ 绝不删 | 正在执行的 tool use 本身 |

从最老的消息开始删，删完重试，最多 3 次。

### 4.4 熔断器

连续 3 次 Autocompact 失败（`MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES`），停止重试，回退给主线程报错。

这个熔断器来自真实数据：曾有 **1,279 个会话**连续失败超过 50 次（最高 3,272 次），浪费了约 **250K 次 API 调用/天**。

### 4.5 不触发的情况

`shouldAutoCompact()` 有多个逃逸条件：

| 条件 | 原因 |
|---|---|
| 当前查询本身就是 compact/session_memory 来源 | 防递归死锁 |
| `DISABLE_COMPACT` / `DISABLE_AUTO_COMPACT` 环境变量 | 手动关闭 |
| `autoCompactEnabled = false` 用户配置 | 用户选择 |
| Context Collapse 模式激活 | collapse 自己管上下文 |
| 连续失败 ≥ 3 次 | 熔断 |

## 五、压缩提示词的设计哲学

### 5.1 信息保真 > 长度压缩

压缩提示词有一个反直觉的设计：**完全不给长度限制**。

| 明确要求的（内容维度） | 完全没有要求的（规模维度） |
|---|---|
| 必须覆盖 9 个固定章节 | ❌ 没有压缩比例（50%? 30%?） |
| 必须保留技术细节（文件名、代码片段、函数签名） | ❌ 没有最大 token 数 |
| 必须按时间顺序分析每条消息 | ❌ 没有摘要长度上限 |
| 输出 `<analysis>` + `<summary>` 两阶段 | ❌ 反而强调 thorough / precise / complete |

### 5.2 两阶段 "草稿纸" 技术

```
<analysis>          ← 推理草稿，按时间顺序分析每条消息
  用户意图、关键决策、文件名、代码片段、错误及修复

<summary>           ← 正式摘要，9 个标准化部分
  Primary Request / Key Concepts / Files / Errors /
  Problem Solving / All User Messages / Pending Tasks /
  Current Work / Optional Next Step
```

最终 `formatCompactSummary()` 会**剥离 `<analysis>` 块**，只保留 `<summary>` 进入上下文。这是经典的 Chain-of-Thought Scratchpad 技术——让模型先推理再总结，质量远超直接生成摘要；但推理过程不保留，省 Token。

详见 [[03 Claude Code 上下文工程#Level 5 Autocompact]]。

## 六、Token 估算：不调 API 也能算

`tokenCountWithEstimation()` 的算法不需要额外 API 调用：

1. 从消息末尾向前找最近一条有 API `usage` 数据的消息（server 精确值）
2. 以该值为锚点
3. 对锚点之后的新消息做粗略估算：`字符数 × 4/3`

误差从 30%+ 降到通常 <5%，无需额外 API 调用。

## 七、剩余预算：Agent 的 "氧气表"

### 7.1 剩余预算 ≠ max_tokens

一句话区分（术语定义见 §1.1）：**max_tokens 管"这一次最多吐多少"，剩余预算管"这个任务总共还能吐多少"**。

举例：`max_tokens = 4096`，剩余预算 = 12000（可以分 3 次生成）。

### 7.2 为什么需要剩余预算？

因为 Agent 不是一次请求就结束，而是：用户提问 → 模型生成 → 超长则压缩 → 没说完则续写 → 工具调用 → 再生成。**每一步都在花钱，必须知道还剩多少可以花。**

### 7.3 跨压缩结转

这是 Claude Code 的关键设计——预算不因压缩而消失：

```
没有剩余预算 ❌                   有剩余预算 ✅
上下文太长                       上下文太长
→ 截断                           → 压缩历史（-token）
→ 输出不完整                      → 剩余预算还在
→ 直接失败                        → 继续生成
```

### 7.4 完整例子

假设总预算 10K tokens，当前剩余 2500：

| 行为 | 消耗 | 剩余 |
|---|---|---|
| 第一次回复 | 1800 | 700 |
| 发现没说完 | — | 700 |
| 压缩上下文 | 200 | 500 |
| 续写 | 400 | 100 |
| 再续写 | ❌ 不够 | 停止 |

### 7.5 续写时传递什么上下文？

续写不是"恢复状态"，而是**把状态完整重放一遍**。一个新的 API 请求携带：

```
messages = [
  System Prompt,
  ...全量历史消息,
  被截断的 assistant 输出,      ← 续写的地基
  "请继续输出未完成的部分。"     ← 续写指令
]
```

因为 Transformer 的自回归特性——给定前面的 token，预测下一个——只要前面的 token 没变，续写就是自然的。

## 八、max_tokens：为什么必须存在且显式传？

前提：`max_tokens` 不是上下文窗口，它只管单轮 output 天花板（定义与硬规则见 §1.1）。本节回答的是**为什么这个参数必须存在、且必须由调用方显式给出**。

### 8.1 解决的 5 个问题

| 问题 | 没有 max_tokens 会怎样 |
|---|---|
| **计费防火墙** | prompt 有歧义或自引用循环 → 模型无限生成，账单爆炸 |
| **服务端资源调度** | 推理服务无法预知 output buffer 大小 → 无法分配 KV cache → OOM |
| **防跑飞** | 概率分布变 flat 时模型不确定怎么停，只要没采样到 stop token 就继续 |
| **延迟/UX** | 一次 10000 token 的生成阻塞整个请求队列，P99 延迟无上界 |
| **下游系统** | JSON/日志/Kafka 都有 size limit，无限输出会撑爆下游 |

### 8.2 为什么 Anthropic 要你显式传（不设默认值）？

| 做法 | 后果 |
|---|---|
| OpenAI：不传 → 内部默认值 | 新手不知道有上限，换 SDK 版本后行为悄悄变了 |
| Anthropic：不传 → 直接 400 报错 | 逼你正视"合理的最长输出是多少" |

显式必填是一种 **API 设计契约**：explicit is better than implicit。

### 8.3 stop_reason 必须区分

| stop_reason | 含义 | 你该做什么 |
|---|---|---|
| `"end_turn"` | 模型自然说完 ✅ | 直接用 |
| `"max_tokens"` | **被天花板硬切** ⚠️ | 结果可能残缺 → 需续写/报错/降级 |
| `"stop_sequence"` | 命中自定义停止符 | 正常 |

不告诉你"我是被截的"，你就无法判断 JSON 缺 closing brace 是模型 bug 还是截断。

## 九、CLI 命令速查

### 9.1 预算 & 成本相关

| 命令/Flag | 作用 |
|---|---|
| `claude -p --max-budget-usd 2.00` | 单次任务美元硬顶（`-p` 模式） |
| `claude -p --max-turns 5` | 限制最多 5 轮 tool-use 循环 |
| `/cost` | 显示当前会话 token 用量 + 花费 |
| `/context` | 可视化上下文窗口占用 |
| `/compact [指令]` | 压缩历史对话为摘要，释放 token |
| `/clear` | 彻底清对话历史 |

### 9.2 其他常用 Flag

| Flag | 用途 |
|---|---|
| `--permission-mode plan` | 只读计划模式（省 tool-call 代价） |
| `--allowedTools "Read" "Edit"` | 白名单工具（间接预算控制：少工具 = 少 round-trip） |
| `--output-format json` | 脚本化输出 |
| `--bare` | 极简模式（跳过 hooks/skills/MCP，启动快） |

## ⚡ 30 秒速答版

> 先把账算清楚：**200K 的上下文窗口不等于你能用 200K**——系统提示词 15-25K、工具定义 10-20K，再加输出预留，剩下的才归对话历史，而且 API 层的硬规则是 **`input_tokens + max_tokens ≤ 上下文窗口`**。
>
> 所以压缩算法看的不是标称值，而是**有效窗口**：`effectiveWindow = 200K − min(maxOutputTokens, 20K) = 180K`，再扣掉 **13K 的 AUTOCOMPACT_BUFFER** 作为"执行压缩本身"的余量，大约到**有效窗口的 92.8%** 就触发 Autocompact；前面 20K 处开始警告闪烁，最后还有 3K 的强制阻塞防线。
>
> 但真正到线之前系统会先走 **Microcompact**——把旧的工具调用结果换成占位符、剥掉图片附件，很多会话因此**永远不会触发全量压缩**。真要全量压缩时会 **fork 一个只读子 Agent** 去写摘要，**共享主线程的 Prompt Cache**，所以又快又便宜，也不会自己把主线程撑爆。
>
> 用量统计不需要额外调 API：**往前找最近一条带 `usage` 的消息当锚点，之后的新消息按字符数 × 4/3 估**，误差能压到 5% 以内。
>
> 最后是最容易露馅的一点：**`max_tokens` 必须显式传**（Anthropic 不传直接 400），而且拿到响应一定要看 **`stop_reason`**——如果是 `"max_tokens"` 说明被天花板硬切了，要走**续写**、或者把输出上限从 8K 升到 64K，而不是当成正常结果用。

## 💬 对方可能追问的问题

### 顺着有效上下文窗口的计算追（概率最高）

| 追问 | 答题要点 |
|---|---|
| 有效上下文窗口怎么算？ | `effectiveWindow = contextWindow − min(maxOutputTokens, 20,000)`，默认即 `200K − 20K = 180K`。常量 `MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20,000`，依据是 **p99.99 压缩摘要输出 17,387 tokens** 再加一点余量 |
| 为什么非要减掉这 20K？ | Autocompact 自己要**写摘要**，摘要也是输出。若按 200K 算阈值，**摘要写一半就爆了** |
| 三条水位线分别是什么？ | ①**警告闪烁**：触发线前 20K（`WARNING_THRESHOLD_BUFFER_TOKENS`），只提示不动手；②**Autocompact 触发**：`effectiveWindow − AUTOCOMPACT_BUFFER_TOKENS(13,000)`，13K 是留给"执行压缩操作本身"的安全余量；③**强制阻塞**：`200K − MANUAL_COMPACT_BUFFER_TOKENS(3,000) = 197K`，新消息被阻止写入，最后防线 |
| 触发线是固定的 167K / 92.8% 吗？ | ❌ **不是固定的**。它随 `maxOutputTokens` 和模型窗口大小动态变化：slot-cap flag 开启时 `maxOutputTokens` 被限到 8K → `effectiveWindow = 200K − 8K = 192K` → `threshold = 192K − 13K = 179K`，**阈值上移 12K**。还能用 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 环境变量按百分比覆盖 |
| 为什么 `maxOutputTokens` 默认只有 8K？ | 服务端按 `max_output_tokens` **预留计算资源（slot）**。8K **覆盖 99% 需求**（p99 输出 = 4,911 tokens），是利用率最佳平衡点；声明 32K 却只用 5K，slot 利用率只有 1/6，而服务端会一直替你留着。被截断时才由 **MOT 恢复机制升级到 64K** |

> ⚠️ 面试口径提醒：本页 §2.2 的水位线示意图与 §2.3 的公式，在"180K 和 167K 谁是触发线、谁是警告线"上标注不一致（本页已挂待核对）。**说公式比说数字安全**——记住 `min(maxOutputTokens, 20K)` / `13K` / `20K` / `3K` 这四个常量和它们的减法顺序，怎么问都不会翻车。同理 `maxOutputTokens` 默认值本页与 [[03 Claude Code 上下文工程]]（记 Sonnet 16,000）冲突，面试时讲"默认是 8K～16K 量级、被截断后升级 64K"更稳。

### 顺着 Microcompact 与 Autocompact 追

| 追问 | 答题要点 |
|---|---|
| Microcompact 和 Autocompact 差在哪？ | Microcompact 是**局部清理**：把旧的工具调用结果（FileRead、Bash、Grep、Glob）替换成**占位符**、剥离图片/文档附件，每次释放一些 token，**可能把 Autocompact 推迟很久甚至永远不触发**。Autocompact 是**全量摘要**，只有 Microcompact 也顶不住才走 |
| 为什么压缩要 fork 一个子 Agent，主线程自己总结不行吗？ | 两个致命问题：①**上下文污染**——摘要任务混进当前对话，影响主回答质量；②**死锁风险**——摘要本身占 token，直接把主线程撑爆。所以 fork 一个**只读副 Agent**，不参与主对话；而且它**共享同一个 cache key**，直接复用主线程已经付过钱的 **Prompt Cache**，不用重新上传几十万 token，请求极快极便宜 |
| 为了压缩发的那个请求自己也超长了怎么办？ | 走 `truncateHeadForPTLRetry()`——**Truncate Head（砍头）+ Prompt Too Long + Retry**。删除优先级：最早的普通对话 → 老旧工具调用结果 → 尽量不删 system prompt 和当前任务相关文件 → **绝不删正在执行的 tool use 本身**。从最老的开始删，删完重试，**最多 3 次** |
| 会不会一直压缩失败、疯狂刷 API？ | 有**熔断器** `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3`，连续 3 次失败就停止重试、回退给主线程报错。这个熔断来自真实数据：曾有 **1,279 个会话**连续失败超过 50 次（最高 **3,272 次**），浪费约 **250K 次 API 调用/天** |
| 哪些情况明明快满了也不压缩？ | `shouldAutoCompact()` 的逃逸条件：①当前查询来源本身就是 compact / session_memory（**防递归死锁**）；②`DISABLE_COMPACT` / `DISABLE_AUTO_COMPACT` 环境变量；③用户配置 `autoCompactEnabled = false`；④**Context Collapse 模式**激活（它自己管上下文）；⑤连续失败 ≥ 3 次已熔断 |

### 顺着 max_tokens 与 stop_reason 追

| 追问 | 答题要点 |
|---|---|
| `max_tokens` 和上下文窗口是什么关系？ | `max_tokens` **不是**上下文窗口，它只管**单轮 output 天花板**。约束是 `input_tokens + max_tokens ≤ 上下文窗口`，否则请求非法。推论：**调大 `max_tokens` 会挤掉输入空间**，且在 20K 以内还会直接压低 `effectiveWindow`、让 Autocompact 更早触发 |
| 为什么 Anthropic 逼你显式传，不给默认值？ | OpenAI 不传就走内部默认值 → 新手根本不知道有上限，**换个 SDK 版本行为悄悄变了**；Anthropic 不传**直接 400**，逼你正视"合理的最长输出是多少"。这是一种 **API 设计契约**：explicit is better than implicit |
| 假如根本没有 `max_tokens` 会出什么事？ | 5 件事：①**计费防火墙**失守——prompt 有歧义或自引用循环 → 无限生成、账单爆炸；②**服务端资源调度**——无法预知 output buffer 大小 → 无法分配 KV cache → OOM；③**防跑飞**——概率分布变 flat 时模型不确定怎么停，没采到 stop token 就一直写；④**延迟/UX**——一次超长生成阻塞请求队列，P99 延迟无上界；⑤**下游系统**——JSON / 日志 / Kafka 都有 size limit，会被撑爆 |
| `stop_reason` 有哪几个取值、你怎么用？ | `"end_turn"` 模型自然说完，直接用；`"max_tokens"` **被天花板硬切**，结果可能残缺 → 续写 / 报错 / 降级；`"stop_sequence"` 命中自定义停止符，属正常。**不看这个字段，你就无法判断 JSON 少一个 closing brace 是模型 bug 还是被截断** |
| 剩余预算和 `max_tokens` 到底差在哪？ | 一句话：**`max_tokens` 管"这一次最多吐多少"（硬上限），剩余预算管"这个任务总共还能吐多少"（软上限，可跨轮、跨压缩结转）**。例如 `max_tokens = 4096`、剩余预算 12000，就是可以分 3 次生成 |
| 剩余预算能"跨压缩结转"有什么实际价值？ | 没有它：上下文太长 → 截断 → 输出不完整 → **直接失败**；有它：压缩历史（减 token）→ **剩余预算还在** → 继续生成。走账示例（总预算 10K、当前剩 2500）：首次回复花 1800 剩 700 → 压缩花 200 剩 500 → 续写花 400 剩 100 → 再续写不够，停止 |

### 顺着工程落地与你的项目追

| 追问 | 答题要点 |
|---|---|
| 你怎么知道当前用了多少 token，每次都调一遍计数接口？ | 不用。`tokenCountWithEstimation()`：从消息末尾**往前找最近一条带 API `usage` 的消息**作为锚点（server 精确值），锚点之后的新消息用**字符数 × 4/3** 粗估。误差从 30%+ 降到通常 **<5%**，且**零额外 API 调用** |
| 续写的时候你到底往请求里塞什么？ | 续写**不是"恢复状态"，而是把状态完整重放一遍**：`System Prompt + 全量历史消息 + 被截断的那段 assistant 输出（续写的地基）+ "请继续输出未完成的部分"`。能这么干是因为 **Transformer 的自回归特性**——前面的 token 没变，续写就是自然延续 |
| Token 预算这个开关具体带来什么行为？ | `TOKEN_BUDGET` feature flag 三件事：①**防止过早停止**——消耗达 **90%** 预算但任务未完成时，自动注入 **nudge 消息**让 AI 继续；②**检测收益递减**——连续 **3 次**续写且每次增量都 **< 500 tokens**，判定收益递减、提前终止；③**UI**——Spinner 里实时显示预算进度和预计剩余时间 |
| 线上真要控预算，你手上有什么抓手？ | 观测：`/context` 可视化窗口占用、`/cost` 看用量与花费。干预：`/compact [指令]` 主动压缩、`/clear` 清历史。硬顶（`-p` 模式）：`--max-budget-usd 2.00` 美元硬顶、`--max-turns 5` 限 tool-use 轮次。间接省：`--permission-mode plan` 只读计划模式省 tool-call、`--allowedTools` 白名单（少工具 = 少 round-trip，也少工具定义 token）、`--bare` 跳过 hooks/skills/MCP |

### 高频陷阱题

1. **「200K 窗口，是不是就能塞 200K 的对话历史？」** → **不能**。系统提示词 15-25K、工具定义 10-20K（含 MCP）、用户上下文（CLAUDE.md / git status）、再加输出预留，剩下才是历史的空间；而压缩算法眼里的"满"是 **`effectiveWindow` 180K**，不是 200K。硬约束永远是 `input_tokens + max_tokens ≤ 上下文窗口`。
2. **「Autocompact 阈值是个固定百分比吧？」** → **不是固定的**。它是 `effectiveWindow − 13K` 推出来的，而 `effectiveWindow` 依赖 `min(maxOutputTokens, 20K)` 和模型窗口大小；slot-cap 开启让 `maxOutputTokens` 变 8K 时，阈值直接上移 12K。还可被 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 覆盖。
3. **「压缩提示词是不是要写明摘要不超过多少 token，才省得下来？」** → 反直觉：**完全不给长度限制**。压缩提示词只在**内容维度**下硬要求（覆盖 9 个固定章节、必须保留文件名/代码片段/函数签名、按时间顺序分析每条消息），**规模维度一个字都不提**，反而强调 thorough / precise / complete——因为设计原则是**信息保真 > 长度压缩**。真正省 token 的地方是 `formatCompactSummary()` **把 `<analysis>` 草稿块剥掉**、只把 `<summary>` 放进上下文，即经典的 CoT Scratchpad。
4. **「把 `max_tokens` 调大点，是不是预算就更宽裕了？」** → 混淆了两个概念。`max_tokens` 是**单轮硬上限**，剩余预算才是**跨轮跨压缩的任务级软上限**；而且调大 `max_tokens` 是有代价的——挤占输入空间、服务端一直替你预留 slot、20K 以内还会压低 `effectiveWindow` 让压缩来得更早。所以"不要手贱改成 32K 以防万一"。
5. **「输出被截断了，重试一次不就行了？」** → 重试是**从头重新生成**，既浪费又很可能**再次被截**。正确路径是：先看 `stop_reason` 是不是 `"max_tokens"` → 走 **MOT 恢复机制把输出上限从 8K 升到 64K**，或者**续写**（重放全量历史 + 被截断输出 + 继续指令），并让剩余预算跨压缩结转扛住这次接力。
6. **「主线程直接自己总结一下历史不就完了，何必 fork？」** → 两个坑：**上下文污染**（摘要任务混进主对话，拉低主回答质量）和**死锁**（摘要本身要占 token，直接把已经快满的主线程撑爆）。fork 出的只读子 Agent 还能**共享 cache key 复用主线程 Prompt Cache**，这是"又快又便宜"的真正原因。

## 十、相关页面

- [[01 Agent 记忆机制]] — 记忆机制全局视角：上下文构建、压缩、缓存、设计决策框架
- [[03 Claude Code 上下文工程]] — 五级压缩流水线、前缀缓存策略的完整实现
- 源材料：[[raw/编程笔记/claude源码解析/claude code Token 预算管理 - 上下文窗口动态计算]]、[[raw/编程笔记/claude源码解析/claude code 元宝问答]]
