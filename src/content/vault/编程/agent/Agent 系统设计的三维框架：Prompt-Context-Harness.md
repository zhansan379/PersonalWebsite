---
title: Agent 系统设计的三维框架：Prompt-Context-Harness
tags:
  - agent
  - prompt-engineering
  - context-engineering
  - harness-engineering
  - system-design
  - openclaw
  - claude-code
  - hermes-agent
  - self-evolving
  - 面试
created: 2026-06-09
updated: 2026-08-15
---

# Agent 系统设计的三维框架：Prompt-Context-Harness

> Prompt Engineering 告诉模型「做什么」，Context Engineering 让它「做得更好」，Harness Engineering 确保它「可控地做」。三者层层递进，是构建 90+ 分 Agent 系统的核心方法论。

来源：飞樰系列文章 [[raw/编程笔记/claude源码解析/深度解析 Claude Code 在 Prompt  Context  Harness 的设计与实践|Claude Code 篇]]、[[raw/编程笔记/openclaw/深度解析 OpenClaw 在 Prompt  Context  Harness 三个维度中的设计哲学与实践|OpenClaw 篇]]、[[raw/编程笔记/Hermes Agent/深度解析 Hermes Agent 如何实现“自进化”及其 Prompt  Context  Harness 的设计实践|Hermes 篇]]；§4.1/§4.6 另参 [01 Claude Code 的 Agent Loop 核心循环（CSDN）](https://blog.csdn.net/m0_73980980/article/details/161260030)

## 🎯 答题逻辑（骨架）

```
1. 先摆三层框架 + 分数基线            ← 15 秒锁定站位，证明有全局观
   Prompt 70 分（怎么说）→ +Context 80-85 分（看什么）→ +Harness 90-95 分（怎么约束）
   强调：是层层叠加，不是三个并列可选项
2. Prompt 层：不是写一段话，是动态组装   ← 证明看过真实实现，不是只用过 API
   模块化 + 动静分离（缓存边界）+ 优先级覆盖 + Markdown 文件驱动
3. Context 层：压缩 / 记忆 / Skills 三块 ← 证明做过长程任务，被上下文炸过
   多级回退压缩（规则截断 → 复用会话记忆 → LLM 摘要）+ 分层记忆 + 渐进式披露
4. Harness 层：给野马套马具            ← 这层才是 70 分和 90 分的分水岭
   Agent Loop 只是 while(true)，工程量全在 Hook / 沙箱 / 权限 / 错误自愈 / 子 Agent 隔离
5. 对比 Harness vs Workflow，站到趋势上  ← 展现判断力，不是背设计文档
   主导权在 AI 而不在人；基座模型越强，硬编码路径越是在限制发挥
6. 主动落到自进化 + 自己的项目          ← 辩证收尾，同时抢占下一个问题
   Skill 动态生成 + RL 闭环 = 从「完成任务」到「从任务中学习」
```

**关键心态**：这题考的不是「你知不知道 Agent 有哪几个部分」，而是**你有没有真的把一个 Agent 跑崩过再修回来**。面试官在听两件事：你有没有**分层意识**（能把问题归到 Prompt/Context/Harness 哪一层），以及你能不能报出**具体机制名和数字**（压缩触发阈值、Hook 挂载点、权限三态、并发上限）。只说「Prompt 要写清楚、要加记忆、要挂工具」，或者把 Harness 讲成流程编排，基本就被判定为没实操过、只读过框架文章。

**分水岭术语**：**Harness（原义就是「马具」）**、**动静分离 / 缓存边界**、**多级回退压缩**、**Hook（Harness 的最小单元）**、**Agent Loop = while(true) + stop_reason 裁决**。这五个词能自然说出来，专业度立刻和「调过 API 的人」区分开。

## 一、三维框架总览

### 1.1 三层递进关系

```
Prompt Engineering        →  70 分基线（怎么说）
    +
Context Engineering       →  80-85 分（看什么）
    +
Harness Engineering       →  90-95 分（怎么约束）

三者不是独立的，而是层层叠加：单靠 Prompt 拿不到 90 分，必须三层协同。
```

### 1.2 核心隐喻：千里马与马具

> 大模型是一匹天赋异禀的「千里马」。不加 Harness 的 Agent = 草原上自由奔跑的野马——速度快但方向不可控。Harness Engineering 就是为这匹马套上精致的马具，通过缰绳和马鞭确保它按预定路线奔跑。

### 1.3 三维对比总表

| 维度          | 核心问题 | 关键手段              | OpenClaw            | Claude Code                    | Hermes                          |
| ----------- | ---- | ----------------- | ------------------- | ------------------------------ | ------------------------------- |
| **Prompt**  | 怎么说  | 动态组装、模块化、文件驱动     | 23 模块、Markdown 文件体系 | 11 模块、动静分离+缓存边界                | 兼容主流生态、模型异构适配                   |
| **Context** | 看什么  | 压缩、记忆、Skills 渐进披露 | 绝对阈值压缩+双层记忆         | 三层渐进式压缩+Memdir 结构化记忆           | 比例阈值压缩+内外双驱记忆                   |
| **Harness** | 怎么约束 | 钩子、沙箱、权限、护栏       | 7 种 Hook+三层沙箱       | 20+ Hook+异步生成器主循环+六大 AgentTool | 14 类错误自愈+子 Agent 隔离+Skills 安全扫描 |
| **独特能力**    | —    | —                 | 文件驱动的灵魂系统           | 极致工程细节（反蒸馏/彩蛋）                 | **自进化**（Skill 动态生成+RL 训练闭环）     |

## 二、Prompt Engineering：动态组装与文件驱动

### 2.1 核心认知转变

传统认知：Prompt Engineering = 写一段好的 System Prompt。
实际工程：Prompt Engineering = 一套复杂的**动态组装机制**——根据身份人设、系统行为、工具规范、约束条件等动态信息实时拼接。

### 2.2 三大系统的共同模式

三者的 System Prompt 都采用**模块化动态拼装**模式：

```
[静态模块] → 身份、行为规则、工具指南、语气风格
    ↓
[动态边界] → 缓存分隔线
    ↓
[动态模块] → 环境信息、Memory、Skills、Token 预算、语言偏好
    ↓
[上下文注入] → Git 状态、CLAUDE.md、当前日期
```

### 2.3 各系统特色

**OpenClaw**：23 个模块，Markdown 文件驱动（AGENT.md / SOUL.md / IDENTITY.md / USER.md / TOOLS.md / HEARTBEAT.md / BOOTSTRAP.md），三种 PromptMode（full / minimal / none），极简主义措辞风格（"Quality > quantity"）。

**Claude Code**：11 个模块，`SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 标记缓存边界（之前可全局缓存，之后不缓存），五级优先级决策（override → Coordinator → Agent → custom → default），内部/外部用户双版本 Prompt。

**Hermes**：在继承 OpenClaw 模式基础上，做模型异构适配——针对 GPT（懒，需要强调"执行而非描述"）和 Gemini（粗，需要强调"绝对路径、先读后改"）注入不同指令补丁。最大特色是**生态兼容**：可直接读取 OpenClaw 的 AGENT.md/SOUL.md、Claude Code 的 CLAUDE.md、Cursor 的 .cursorrules。

### 2.4 普适设计原则

1. **模块化**：每个模块有明确职责，独立维护
2. **动静分离**：静态可缓存部分 vs 动态不可缓存部分用边界标记分开
3. **优先级机制**：允许覆盖，override > 自定义 > 默认
4. **极简措辞**：Prompt 越短越好，把 Context Window 留给业务数据
5. **文件驱动**：通过 Markdown 文件解耦配置，方便用 grep/shell 管理

## 三、Context Engineering：压缩、记忆与 Skills

### 3.1 核心矛盾

Context Window 有限，但对话历史、工具输出、Skills 文件、Memory 都在不断膨胀。Context Engineering 解决的就是**如何在有限窗口内保留最关键信息**。

### 3.2 上下文压缩机制对比

| 特性       | OpenClaw               | Claude Code                           | Hermes                                 |
| -------- | ---------------------- | ------------------------------------- | -------------------------------------- |
| **触发方式** | 绝对阈值（如 18K/20K）        | 安全水位线（剩余 < 13K token）                 | 比例阈值（占窗口 ≥ 50%）                        |
| **压缩层数** | 单层（LLM 摘要）             | 三层渐进式                                 | 两层（+离线轨迹压缩）                            |
| **摘要策略** | 分块 → 独立摘要 → 合并         | Micro → SM → Full LLM（9 段式模板）         | 头尾保护区 + 中间摘要                           |
| **失败降级** | 排除大消息重试 → 兜底文本         | SM 不满足 → 降级到 Full LLM                 | 跳过压缩                                   |
| **特色**   | 时间窗口优化（利用 KV Cache 过期） | Implicit CoT（<analysis> 后再输出）、反工具调用保护 | 离线轨迹压缩（精确 Tokenizer 计数、目标 15250 token） |

### 3.3 Claude Code 的三层压缩（最精细）

| 层                          | 方法               | LLM 调用 | 触发条件                 | 成本  |
| -------------------------- | ---------------- | ------ | -------------------- | --- |
| **MicroCompact**           | 纯规则截断            | ❌      | 时间阈值 / 缓存边界          | 零   |
| **Session Memory Compact** | 复用已有会话记忆替换旧消息    | ❌      | Token ≥ 1万 且消息 ≥ 5 条 | 极低  |
| **Full LLM Compact**       | LLM 生成 9 段式结构化摘要 | ✅      | 前两层无法满足              | 最高  |

**Full LLM Compact 的 9 段式模板**：Primary Request → Key Technical Concepts → Files and Code Sections → Errors and Fixes → Problem Solving → All User Messages → Pending Tasks → Current Work → Optional Next Step

关键技巧：在 Prompt 中要求模型先在 `<analysis>` 标签内推演，再在 `<summary>` 中输出——程序剥离 `<analysis>`，只保留摘要，极大提升摘要质量。

> ⚠️ 待核对：[[编程/agent/上下文与记忆/03 Claude Code 上下文工程#四、五级压缩流水线]] 给出的是**五级**流水线（Tool Result 裁剪 / History Snip / Microcompact / Context Collapse / Autocompact），与本表的三层分类只有 Microcompact 对得上。两处源材料版本疑似不同，需回 raw 核对后统一（本页视角为三系统横向对比，五级视角为 CC 单系统纵向拆解，也可能是粒度差异）。

### 3.4 记忆系统对比

| 特性          | OpenClaw                               | Claude Code                                          | Hermes                            |
| ----------- | -------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| **长期记忆**    | MEMORY.md（每次注入 System Prompt，截断 200 行） | Memdir 四类（User/Feedback/Project/Reference）+ LLM 语义检索 | MEMORY.md + 外部记忆服务（Mem0/Honcho 等） |
| **短期/每日记忆** | memory/日期.md + 向量化索引                   | 自动记忆（loadMemoryPrompt）                               | SQLite 对话持久化 + 时间衰减               |
| **检索机制**    | BM25 + 向量双路召回                          | LLM-in-the-loop（Sonnet 做语义筛选，强制 ≤5 条）                | 内部静态存储 + 外部动态扩展                   |
| **时间衰减**    | ✅ 指数衰减（半衰期 30 天）                       | ❌                                                    | ✅                                 |
| **遗忘机制**    | 核心 MEMORY.md 不衰减；日期文件随时间降权             | 预算裁剪                                                 | 同 OpenClaw                        |

### 3.5 Skills 机制的演进

| 系统 | Skills 性质 | 说明 |
|---|---|---|
| **OpenClaw** | 静态（用户/社区预先编写） | 渐进式披露：先扫名字和描述，按需读 SKILL.md |
| **Claude Code** | 静态（内置 + 用户自定义） | 工具权限分级，子 Agent 各有限制 |
| **Hermes** | **动态生成** | 从 Agent 运行轨迹自动提炼 Skill，持续优化积累 |

### 3.6 Hermes 上下文注入创新：@ 符号即时挂载

将"工具调用"变为"上下文预加载"，省去 Agent 推理是否需要调用工具的环节：

| 语法 | 效果 |
|---|---|
| `@file:main.py` | 注入完整内容 |
| `@file:src/utils.py:10-20` | 只注入指定行 |
| `@diff` | 注入 git diff |
| `@url:https://...` | 抓取网页转 Markdown |

## 四、Harness Engineering：约束、引导与控制

### 4.1 核心定位

Harness Engineering = 在大模型之外构建一套**外部运行环境与约束机制**，通过接口、钩子、护栏等手段，约束、引导、检验、评估 Agent 的行为。

**一句话说明**：Harness 工程是为大模型搭建一套包含**规则、工具、记忆、反馈机制**的工作系统，让模型能安全、自主、可靠地完成复杂现实任务。

**一个比喻（面试可直接用）**：就像给一匹力量强大但可能脱缰的野马配上**马具、缰绳和马车**——Harness 工程不削弱模型的能力，而是把它驯成能按指令稳健拉车、不会乱跑的骏马。

> 名字本身就是线索：harness 的原义就是「马具」。这也解释了为什么 Harness 式设计优于 Workflow 式（见 4.2）——马具约束方向但不限制马力，而 Workflow 是把马换成轨道上的车。

### 4.2 Harness vs Workflow

| 维度 | Workflow | Harness |
|---|---|---|
| **主导权** | 在人手里（预设固定路径 Step A→B→C） | 在 AI 手里（Agent 自主规划+循环迭代） |
| **灵活性** | 确定性强但不灵活，遇异常链路断裂 | 动态调整，Harness 只是辅助约束 |
| **适合场景** | 流程固定、容错低 | 复杂任务、需发挥模型推理能力 |

> 关键洞察：随着基座模型能力越来越强，Harness 式设计（发挥模型能力 + 约束不过于失控）比 Workflow 式（硬编码路径限制模型发挥）更符合趋势。

### 4.3 三大系统的 Harness 对比

| 能力 | OpenClaw | Claude Code | Hermes |
|---|---|---|---|
| **Hook 机制** | 7 种（before_prompt_build, before_tool_call 等） | 20+ 种（覆盖工具/会话/消息/文件全生命周期） | 9 种（on_agent_start, on_tool_call 等） |
| **安全沙箱** | 三层：文件系统 + 命令执行 + 网络访问 | 双层：Permission Engine（61KB 规则引擎）+ OS 级 bwrap 沙箱 | 多层：防 Prompt 注入 + Skill 安全扫描 + 子 Agent 工具限制 |
| **权限模型** | Security / Ask / safeBins 白名单 | Allow / Deny / Ask 三行为 + 多源优先级覆盖 | 子 Agent 禁止递归委派、禁调 memory/execute_code 等敏感工具 |
| **错误处理** | 基础重试 | 三级自愈：上下文超长→压缩、输出截断→3 次续写、网络波动→指数退避 | **14 种错误分类** + 每类预设恢复策略 |
| **子 Agent 控制** | 基础隔离 | 6 大内置 AgentTool + Fork Sub Agent（共享 Prompt Cache） | 严格限制：最多 3 并行、最多 2 层嵌套、禁用递归 |
| **特殊机制** | 人在环路（Human-in-the-Loop） | System Reminder 动态注入 + 异步生成器主循环 + 可编程 Hook | 插件系统（Mem0 等以插件接入） |

### 4.4 Claude Code 的六大内置 AgentTool

| Agent | 模型 | 权限 | 职责 |
|---|---|---|---|
| **General-Purpose** | 默认 | tools: ['*'] | 万能打工人，什么都能做 |
| **Explore** | Haiku | 严格只读，不加载 CLAUDE.md | 代码库侦察兵，至少搜 3 次才动用 |
| **Plan** | 继承父模型 | 只读 | 软件架构师，输出关键文件清单 |
| **Verification** | 继承父模型 | 只读，只能在 /tmp 写临时脚本 | 红蓝对抗——目标是把代码"搞崩" |
| **Claude Code Guide** | Haiku | dontAsk | 自我说明书，查官方文档 |
| **Statusline Setup** | Sonnet | 只有 Read + Edit | 终端状态栏配置 |

**Verification Agent 的设计精华**（最体现 Harness 精髓）：
- **红蓝对抗**："你的工作不是确认代码能跑——而是想办法把它搞崩"
- **反偷懒话术**：内置一组 AI 常见自我开脱话术并逐一拆穿（"代码看起来是对的"→"看起来不是验证，运行它"）
- **按变更类型分类验证**：前端/后端/CLI/基础设施/Bug 修复/数据库迁移/重构/移动端，各有专用策略

### 4.5 Claude Code 的 System Reminder 机制

所有系统注入的元信息（CLAUDE.md 内容、日期、工具结果、Hook 反馈等）都用 `<system-reminder>` 标签包裹，在 normalizeMessagesForAPI 阶段统一处理。效果：
- 模型清晰区分「用户输入」与「系统指令」
- 避免上下文混淆或指令偏移
- 变为标准化工程流水线，而非手动拼接字符串

### 4.6 Claude Code 的异步生成器主循环

**本质**：Agent Loop 就是一个 `while (true)` 循环 + 工具调用 + 跳出条件。核心代码其实只有一点点，**剩下绝大部分代码都是 Harness 工程**——这也是"Agent 的难点不在循环本身"的直接证据。

```javascript
async function* queryLoop() {  // 六步 Pipeline:  // 1. 消息预处理（System Reminder 注入）  // 2. LLM API 调用  // 3. 响应解析与规划  // 4. 工具执行与安全校验（三层安全体系）  // 5. 结果产出（yield 给上层）  // 6. 终止条件检查}
```

**跳出条件靠 `stop_reason` / `continue_reason` 两组信号裁决**，不只是"模型说完了"这一种情况——还要覆盖上下文长度达到上限、跑到一半 token 耗尽等各类异常，每种情况对应不同的处理（压缩重试、续写、报错降级）。

> `stop_reason` 各取值的语义与应对见 [[编程/agent/上下文与记忆/04 Token 预算管理#8.3 stop_reason 必须区分]]；token 耗尽时的续写机制见同页 §七。

这带来了流式实时反馈、协作式暂停/恢复、优雅取消、有状态上下文维持四大能力。

### 4.7 Hermes 的 14 类错误分类体系

| 错误类型 | 含义 | 典型场景 |
|---|---|---|
| auth / auth_permanent | 认证失败 | API Key 无效/账号被封 |
| billing / rate_limit / overloaded | 配额/限流/过载 | 额度用完/被限流/服务器忙 |
| server_error / timeout | 服务端/超时 | 5xx/网络问题 |
| context_overflow / payload_too_large | 上下文溢出 | 消息太长 |
| model_not_found / format_error | 配置错误 | 模型名错误/参数问题 |
| thinking_signature / long_context_tier | Anthropic 特有 | 思考签名/长上下文 |
| unknown | 未知错误 | 需重试 |

每种错误类型预设了自动恢复策略（重试、降级、修正），避免一个失败导致整个长上下文任务中断。

## 五、Hermes 的自进化机制（独特能力）

这是 Hermes 超越 OpenClaw 和 Claude Code 的核心创新。两条路径构成「内外双驱」闭环：

### 5.1 路径一：动态 Skill 生成（外挂式进化）

```
任务执行 → 后台审查 Agent 异步复盘 → 提取有效路径/踩坑经验 → 自动生成 Skill → 下次复用
```

**触发机制**：`_skill_nudge_interval = 10`——Agent 连续 10 轮没创建/修改 Skill 时，系统提醒"要不要把经验整理成 Skill？"

**后台审查 Agent**（每次回复后异步启动，不阻塞用户）：
- 记忆审查：这段对话有什么值得记住的？
- 技能审查：这个任务模式是否值得变成 Skill？
- 综合审查：有什么可以改进的？

**本质区别**：OpenClaw 的 Skill 是静态的（人写的），Hermes 的 Skill 是动态的（Agent 自己从经验中生成的）。

### 5.2 路径二：RL 训练闭环（权重内化式进化）

这是真正改变模型权重的「练内功」：

```
Teacher Model（Claude Opus 4.6）生成高质量轨迹
    ↓
轨迹压缩（头尾保护 + 中间摘要，目标 15250 token）
    ↓
ShareGPT 格式转换 + 质量筛选
    ↓
GRPO 算法训练（8-16 个回答，规则化奖励函数打分）
    ↓
自动评估 → 达标则固化，不达标则调整参数/数据
```

**奖励函数设计黄金法则**：
1. 组合 3-5 个奖励函数，各管一个方面
2. 权重要合理：正确性最高（2.0），格式次之（0.5-1.0）
3. 给部分分（如写了标签但没闭合也给 0.125 分）
4. 奖励函数可通过 ToolContext 做真实验证（编译代码、读文件、访问网络）

**RL 训练的实际意义**：
- **降本**：Claude Opus API 贵，训练后用小模型本地跑
- **加速**：小模型推理快
- **合规**：数据不出机器
- **领域极致**：特定场景下小模型可能超越大模型

**为什么不用用户对话数据直接训练？** 隐私问题 + 质量参差不齐容易把模型「训废」。正确做法是 Teacher Model 参考下做数据合成 + 质量把关。

### 5.3 上下文压缩 vs 离线轨迹压缩

| 特性 | 上下文实时压缩 | 离线轨迹压缩 |
|---|---|---|
| 时机 | 对话进行中 | 对话结束后 |
| 目的 | 保持对话可继续 | 准备高质量训练数据 |
| Token 目标 | 降到窗口 50% 以下 | 精确到 15250 |
| Token 计数 | 粗略估算 | HuggingFace Tokenizer 精确计数 |
| 保护策略 | 前 10 条 + 尾部动态 | 首轮完整交互 + 最后 4 轮 |

## 六、Markdown 文件驱动设计对比

三者都使用 Markdown 文件驱动，但因定位不同，文件设计也不同：

| OpenClaw（私人助理） | Claude Code（AI Coding） | Hermes（自进化助理） |
|---|---|---|
| AGENT.md（总纲） | CLAUDE.md（项目说明书） | 兼容两者 |
| SOUL.md（灵魂/人格） | CLAUDE.local.md（个人私有） | SOUL.md |
| IDENTITY.md（身份） | .claude/rules/*.md（按文件类型规则） | IDENTITY.md |
| USER.md（主人档案） | MEMORY.md（持久记忆） | USER.md + MEMORY.md |
| TOOLS.md（工具清单） | — | — |
| HEARTBEAT.md（心跳任务） | — | — |
| BOOTSTRAP.md（首次启动） | — | — |
| BOOT.md（启动脚本） | — | — |
| MEMORY.md（长期记忆） | — | — |

**设计启示**：根据你自己 Agent 的定位，设计对应类型的 .md 文件——AI Coding Agent 需要「项目要求」，私人助理需要「灵魂和记忆」。

## 七、Agent 发展三阶段

| 阶段 | 代表 | 特征 |
|---|---|---|
| **被动式 Agent** | 早期 ChatBot | 依赖明确指令触发，一问一答 |
| **自主 Agent** | OpenClaw、Claude Code | 自主规划路径、调用工具、完成复杂长周期任务 |
| **自进化 Agent** | Hermes | 不仅能自主执行，还能在执行中学习、在学习中变强 |

## 八、构建 Agent 系统的关键 Takeaways

1. **Prompt 是地基**：没有 70 分的 Prompt 底子，Context 和 Harness 再强也拉不上去
2. **动静分离**：System Prompt 中可缓存的静态部分和不可缓存的动态部分用边界标记分开，利用 KV Cache 降本
3. **压缩是刚需**：没有上下文压缩，长程任务必然失败。从规则截断到 LLM 摘要，建立多级回退策略
4. **记忆需要结构化**：长期/短期/项目/用户，不同类型记忆应有不同的存储和检索策略
5. **Hook 是 Harness 的最小单元**：在关键节点插入自定义逻辑，不侵入核心代码
6. **安全要分层**：规则引擎 → 沙箱隔离 → 人在环路，三层纵深防御
7. **子 Agent 要授控**：最小权限 + 禁止递归 + 并行上限，防止资源爆炸
8. **自进化是下一个前沿**：从「完成任务」到「从任务中学习」

## ⚡ 30 秒速答版

> 我一般拆成三层来看，而且是**层层叠加**的关系：**Prompt Engineering 管「怎么说」，大概能到 70 分**；加上 **Context Engineering 管「看什么」，能到 80 到 85**；再加上 **Harness Engineering 管「怎么约束」，才能上 90**。
>
> Prompt 这层的关键认知是：它不是写一段 System Prompt，而是一套**动态组装机制**——模块化拼接，而且要**动静分离**，静态部分放在**缓存边界**之前吃 KV Cache，动态的环境信息、Memory 放后面。
>
> Context 这层解决的是窗口不够：**压缩要做多级回退**，先零成本的规则截断，不够再复用会话记忆，最后才动用 LLM 生成结构化摘要；记忆要**分层**，长期、每日、项目、用户各有各的检索策略；Skills 要**渐进式披露**，先只扫名字和描述，命中了才读正文。
>
> Harness 这层最容易被低估。**harness 原义就是「马具」**——模型是匹能力很强但可能脱缰的野马，Harness 不削弱马力，只管方向。因为**主循环本身其实就是一个 `while(true)` 加工具调用加跳出条件，核心代码很少，剩下绝大部分工程量全在 Harness 上**：Hook、沙箱、权限引擎、错误分类自愈、子 Agent 隔离。
>
> 最后我会补一句趋势：**Harness 式比 Workflow 式更符合方向**，因为 Workflow 是把路径硬编码在人手里，模型越强越是浪费；Harness 把主导权交给 AI，只做约束。再往前一步就是 Hermes 那种**自进化**——从运行轨迹自动提炼 Skill，甚至跑 RL 闭环把经验内化进权重。

## 💬 对方可能追问的问题

### 顺着三层递进关系追（概率最高）

| 追问 | 答题要点 |
|---|---|
| 为什么说光靠 Prompt 只能到 70 分？ | Prompt 只能解决「怎么说」，管不了「模型看到什么」和「模型能干什么」。窗口一长就崩，工具一多就乱调，这两个是 Context 和 Harness 的活儿，靠措辞补不上来 |
| Prompt 和 Context 的边界在哪？两者不是都拼进 System Prompt 吗？ | 拼的位置确实重合，但**决定内容的主体不同**：Prompt 管指令、人设、工具规范这些「我要模型怎么行动」；Context 管压缩、记忆检索、Skills 披露这些「这一轮该让它看到哪些信息」。Context 的产物最终落到 System Prompt 的**动态模块**里 |
| 「动静分离」到底为了什么？ | 为了**前缀缓存 / KV Cache 降本**。Claude Code 用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 显式标记：边界之前可全局缓存，之后不缓存。如果把当前日期、Git 状态这类每轮都变的信息混在前面，整段缓存全部失效 |
| 「Prompt 越短越好」和「指令要写详细」矛盾吗？ | 不矛盾。短是为了把 Context Window 留给业务数据；详细规则**下沉到文件**（AGENT.md / SOUL.md / CLAUDE.md / SKILL.md），按需读取而不是全量常驻。文件驱动的另一个好处是能用 grep/shell 直接管配置 |

### 顺着 Harness 设计追

| 追问 | 答题要点 |
|---|---|
| 用一句话定义 Harness | 在大模型之外搭一套包含**规则、工具、记忆、反馈机制**的运行环境，用来约束、引导、检验、评估 Agent 的行为。名字本身就是线索——harness 原义是「马具」，等于给一匹可能脱缰的野马配上马具、缰绳和马车，不削弱它的能力，只让它稳健拉车 |
| Agent Loop 到底难在哪？ | 循环本身不难：`while(true)` + 工具调用 + 跳出条件，核心代码只有一点点。难的是外面那一圈——消息预处理和 System Reminder 注入、响应解析规划、工具执行前的安全校验、流式 yield 给上层、终止条件裁决。这六步 Pipeline 里五步都是 Harness |
| 跳出条件怎么设计？ | 靠 **`stop_reason` / `continue_reason` 两组信号**裁决，绝不只是「模型说完了」这一种：上下文到上限要走压缩重试，token 中途耗尽要走续写，网络波动要指数退避降级，每种情况对应不同处理 |
| Hook 和直接改代码有什么区别？ | Hook 是 **Harness 的最小单元**：在关键节点（before_prompt_build、before_tool_call、工具/会话/消息/文件全生命周期）插自定义逻辑，**不侵入核心循环**。规模上能看出成熟度差异——OpenClaw 7 种、Hermes 9 种、Claude Code 20+ 种 |
| 安全怎么做分层？ | 三层纵深防御：**规则引擎**（CC 的 Permission Engine，61KB 规则，Allow/Deny/Ask 三行为 + 多源优先级覆盖）→ **OS 级沙箱**（bwrap；OpenClaw 是文件系统/命令执行/网络访问三层）→ **人在环路**。规则挡已知的，沙箱挡未知的，人挡判断不了的。再往里一层是**子 Agent 授控**：最小权限 + 禁止递归委派 + 并行上限（Hermes 最多 3 并行、最多 2 层嵌套、禁调 memory / execute_code；CC 的 Explore 严格只读且不加载 CLAUDE.md） |
| 六大 AgentTool 里哪个最体现 Harness 精髓？ | **Verification Agent**。三个设计点：①**红蓝对抗**——"你的工作不是确认代码能跑，而是想办法把它搞崩"；②**反偷懒话术**，内置一组 AI 常见自我开脱并逐一拆穿（"代码看起来是对的"→"看起来不是验证，运行它"）；③**按变更类型分类验证**，前端/后端/CLI/基础设施/Bug 修复/数据库迁移/重构/移动端各有专用策略。它只读、只能在 /tmp 写临时脚本 |

### 顺着三系统横向对比追

| 追问 | 答题要点 |
|---|---|
| 三家的压缩触发方式差别在哪？ | OpenClaw 是**绝对阈值**（18K/20K），Claude Code 是**安全水位线**（剩余不足 13K token），Hermes 是**比例阈值**（占窗口 ≥ 50%）。比例阈值的工程优势是换模型换窗口不用改配置，绝对阈值换到长窗口模型就白浪费 |
| CC 为什么要把压缩分成三层？ | **成本递增、层层降级**：MicroCompact 纯规则截断、零 LLM 调用；Session Memory Compact 复用已有会话记忆替换旧消息（Token ≥ 1 万且消息 ≥ 5 条触发），成本极低；前两层兜不住才走 Full LLM Compact 生成 9 段式摘要。能省的钱先省掉，最贵的手段放最后 |
| Full LLM Compact 怎么保证摘要质量？ | ①**9 段式结构化模板**，把「原始需求、技术概念、文件与代码、错误与修复、全部用户消息、待办、当前工作、下一步」拆开逼模型逐项填；②让模型先在 `<analysis>` 标签里推演再在 `<summary>` 输出，程序**剥离 analysis 只留摘要**——相当于给摘要过程开了一次隐式 CoT |
| 三家的记忆系统怎么比？ | OpenClaw：MEMORY.md 每轮注入 System Prompt（截断 200 行）+ 日期文件 + **BM25 与向量双路召回** + 指数衰减（**半衰期 30 天**），核心 MEMORY.md 不衰减；CC：**Memdir 四类**（User / Feedback / Project / Reference）+ 用 Sonnet 做 LLM-in-the-loop 语义筛选、**强制 ≤ 5 条**；Hermes：MEMORY.md + 外部记忆服务（Mem0 / Honcho）以插件接入 |
| Hermes 的 @ 符号挂载解决什么问题？ | 把「工具调用」前移成「**上下文预加载**」——`@file:main.py`、`@file:src/utils.py:10-20`、`@diff`、`@url:...`，直接注入内容。省掉了 Agent 推理「我该不该调 read_file」这一整轮，用户已经知道要看哪个文件时最划算 |

### 顺着自进化与自己的项目追

| 追问 | 答题要点 |
|---|---|
| 自进化具体有哪两条路径？ | **外挂式**：每次回复后异步启动**后台审查 Agent**（记忆审查 / 技能审查 / 综合审查三问），从轨迹里提炼有效路径和踩坑经验自动生成 Skill，还有 `_skill_nudge_interval = 10` 的催促机制——连续 10 轮没建/改 Skill 就提醒。**内化式**：跑 RL 真改权重。关键区别是 OpenClaw 的 Skill 是人写的静态资产，Hermes 的是 Agent 自己生成的 |
| RL 闭环这条链路怎么跑？ | Teacher Model（Claude Opus 4.6）产高质量轨迹 → **离线轨迹压缩**到目标 15250 token（HuggingFace Tokenizer 精确计数，保首轮完整交互 + 最后 4 轮）→ 转 ShareGPT 格式并质量筛选 → **GRPO** 训练（每题采 8-16 个回答，规则化奖励函数打分）→ 自动评估，达标固化、不达标调参数或数据 |
| 奖励函数怎么设计才不歪？ | 组合 3-5 个各管一个方面；**权重要有梯度**，正确性最高（2.0）、格式次之（0.5-1.0）；**要给部分分**（比如标签写了没闭合也给 0.125），否则梯度太稀疏学不动；奖励函数可以通过 ToolContext 做**真实验证**——编译代码、读文件、访问网络，而不是只做字符串匹配 |
| 为什么不直接拿用户真实对话训练？ | 两个原因：**隐私**，以及**质量参差不齐容易把模型训废**。正确做法是 Teacher Model 参考下做数据合成 + 质量把关。另外自己训小模型的动机也要说清：降本（Opus API 贵）、加速、合规（数据不出机器）、以及特定领域小模型可能反超大模型 |
| 你自己项目里这三层是怎么落地的？ | 必须报得出**具体值**才有说服力：Prompt 层有几个模块、缓存边界切在哪；Context 层压缩触发阈值定的多少、记忆分了几类、检索是不是限了条数；Harness 层至少要有一个 before_tool_call 的校验 Hook、一套错误分类重试策略、子 Agent 的工具白名单。说不出阈值和挂载点，就会被判定成只读过文章 |

### 高频陷阱题

1. **「Harness 不就是 LangGraph 那种流程编排吗？」** → 恰好相反。**Workflow 的主导权在人**（预设固定路径 Step A→B→C，遇异常链路直接断裂），**Harness 的主导权在 AI**（Agent 自主规划 + 循环迭代，Harness 只做辅助约束）。基座模型越强，硬编码路径越是在限制它发挥。
2. **「Agent 的核心难点是不是那个主循环？」** → 不是，这是最容易露馅的一问。**循环本身就是 `while(true)` + 工具调用 + 跳出条件，核心代码只有一点点**；绝大部分代码量和难度都在 Harness——安全校验、上下文压缩、错误自愈、子 Agent 隔离。答「难在 ReAct 怎么写」就说明没读过真实实现。
3. **「上下文不够就把最早的消息截掉不就行了？」** → 粗暴截断会丢掉**任务目标和用户的原始需求**，Agent 会越跑越偏。所以 9 段式摘要里专门保留 **Primary Request** 和 **All User Messages**，Hermes 也做**头尾保护区**（前 10 条 + 尾部动态 / 首轮完整交互 + 最后 4 轮）。压缩的本质是「有选择地丢」，不是「按时间丢」。
4. **「加 Hook、加沙箱、加权限，是不是把模型能力削弱了？」** → **马具不削弱马力**。Harness 约束的是方向和边界，不干预模型的推理路径；真正削弱能力的是 Workflow 那种把马换成轨道上的车。
5. **「Skill 是不是就是把 Prompt 模板存下来复用？」** → 静态 Skill（OpenClaw）确实接近模板库，但 Hermes 的 Skill 是**从 Agent 自身运行轨迹自动提炼生成的**，还有 nudge 机制催它生成，性质是「**经验固化**」而不是「模板复用」——这也是自进化和普通工程化的分界线。
6. **「压缩阈值设高一点不就能少压缩、少丢信息了吗？」** → 反了。阈值设太高（贴着窗口上限才压）会直接撞上上下文溢出，触发的是**报错降级**而不是优雅压缩；CC 留 13K 的安全水位线、Hermes 用 50% 比例阈值，都是为了**在还有余量的时候压**，因为压缩本身也要消耗窗口和 token。

## 九、相关页面

- [[编程/agent/提示词工程/Claude Code System Prompt 工程]] — Claude Code 的 System Prompt 7 层递进结构详解
- [[编程/agent/上下文与记忆/01 Agent 记忆机制]] — Agent 记忆的全局设计框架
- [[编程/agent/上下文与记忆/03 Claude Code 上下文工程]] — CC 的五级压缩流水线与前缀缓存
- [[编程/agent/上下文与记忆/05 System Prompt 缓存与动态组装]] — 三阶段组装管道与缓存分块（⚠️ 页面尚未创建）
- [[编程/agent/上下文与记忆/04 Token 预算管理]] — Token 预算精确计算与 Autocompact
- [[编程/agent/上下文与记忆/02 多轮对话记忆设计]] — 五种记忆策略与 RAG Token 预算分配
- [[编程/agent/评测/Harness 工程搭建式 Agent 评测]] — 用 CC 搭建评测 Harness 的方法论
- [[编程/agent/评测/RAG 评测方案对比（RAGAS vs Harness 式）]] — 评测框架对比
- [[编程/agent/未解决的问题]] — Agent 机制中尚未完全理解的细节（⚠️ 页面尚未创建）
