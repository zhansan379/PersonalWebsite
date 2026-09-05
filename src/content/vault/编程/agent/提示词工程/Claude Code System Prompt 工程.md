---
title: Claude Code System Prompt 工程
tags:
  - claude-code
  - system-prompt
  - prompt-engineering
  - agent
  - 面试
created: 2026-05-28
updated: 2026-08-15
---

# Claude Code System Prompt 工程

> Claude Code 的 System Prompt 不是随意堆砌的指令，而是经过大量 A/B 测试和模型行为观察迭代打磨的工程产物。

## 🎯 答题逻辑（骨架）

```
1. 先定位它是什么层次的东西               ← 证明你不把提示词当"一段咒语"
   ├─ Prompt 维度的工程产物，靠 A/B 测试 + 行为观察迭代
   └─ 物理形态是 string[] 数组，不是一整段文本（为了缓存分块）
2. 讲结构：7 层递进，抽象 → 具体          ← 证明你完整读过提示词，不是道听途说
   Identity → System → Doing Tasks → Actions → Using Tools → Tone & Style → Output Efficiency
   关键论点：模型先建立的概念会成为理解后续内容的框架，所以顺序不能乱
3. 讲三个可迁移的设计模式                 ← 证明你能抽出方法论，而不是背条款
   ├─ 反模式接种：写"不要做什么"，消掉模型的自我合理化空间
   ├─ 爆炸半径框架：给"可逆性 × 影响范围"判据，而不是穷举黑名单
   └─ 工具偏好映射表：不写就会退回训练数据里最常见的 bash
4. 讲职责分层：System Prompt ↔ CLAUDE.md   ← 证明你懂"什么该写在哪一层"
   通用行为契约（稳定、全局）vs 项目知识（多级发现、近因效应、可被子目录覆盖）
5. 讲工程约束：为什么静态区必须稳定        ← 证明你考虑过 token 成本，不只是效果
   静态/动态分界（SYSTEM_PROMPT_DYNAMIC_BOUNDARY）→ 前缀缓存；任何字符变动即失效
```

**关键心态**：这题考的不是"你会不会写提示词"，而是**你能不能从一份优秀提示词里反推出设计原则**。面试官在听三件事：你知不知道结构顺序是有意为之、你能不能说出模式的名字（而不是复述几条规则）、你有没有意识到提示词同时受**成本/缓存**约束。只会说"它要求简洁、要求安全、要求用专用工具"，等于只读过一遍没想过为什么，会被判定为没实操过。

**分水岭术语**：**反模式接种**、**爆炸半径（可逆性 × 影响范围）**、**工具偏好映射表**、**近因效应**、**静态/动态分界（`SYSTEM_PROMPT_DYNAMIC_BOUNDARY`）**。

## 一、这是什么

System Prompt 工程是让 LLM 成为合格 coding agent 的核心环节。它告诉模型：身份、规则、工具使用策略和环境信息。Claude Code 的 System Prompt 是一套经过精密设计的指令体系，从抽象到具体分层递进，融合了"反模式接种""爆炸半径框架""工具偏好映射"等关键设计模式。

## 二、7 层递进结构

提示词从抽象到具体分为 7 层——**先建立身份和约束框架，再填充具体行为指导**。顺序很重要：模型先建立的概念会成为理解后续内容的框架。

```
1. Identity       → 我是谁？interactive agent
2. System         → 运行环境的基本事实
3. Doing Tasks    → 怎么写代码？（反模式接种）
4. Actions        → 哪些操作需要确认？（爆炸半径框架）
5. Using Tools    → 怎么用工具？（偏好映射表）
6. Tone & Style   → 输出什么格式？
7. Output Efficiency → 怎么更简洁？
```

## 三、核心设计模式

### 3.1 反模式接种

**明确告诉模型"不要做什么"，比只描述"要做什么"有效得多。**

正面指令（如 "be concise"）给模型留下了自我合理化的空间——它会认为"加注释是让代码更简洁易读的"，然后给每个函数加 docstring。而负面指令（如 "don't add docstrings to code you didn't change"）消除了解释余地。

Claude Code 的 Doing Tasks 部分有三条精确的"不要"：

- **不要扩大范围**：修 bug 不需要顺手重构周围代码
- **不要防御性编程**：不为不可能发生的场景加 try-catch 和校验
- **不要过早抽象**："Three similar lines of code is better than a premature abstraction"

这些规则的价值不在概念（谁都知道"不要过度工程"），而在**措辞的精确度**——给了模型具体的判断标准，而非模糊的原则。

### 3.2 爆炸半径框架

Actions 部分没有罗列"不能做 X、Y、Z"，而是教给模型一个**风险评估框架**：

```
Carefully consider the reversibility and blast radius of actions.
```

**二维模型：可逆性 × 影响范围。**

| | 低影响范围（本地） | 高影响范围（共享环境） |
|---|---|---|
| **可逆** | 编辑本地文件 ✅ | 推送代码 ⚠️ |
| **不可逆** | rm -rf ⚠️ | force push、删除云资源 ❌ |

高风险 = 不可逆 + 影响共享环境。这比穷举规则扩展性强得多——模型遇到规则列表之外的新场景（比如调用 API 删除云资源）能自行推理。

还有一条关键规则：**用户批准一次操作，不等于批准所有类似操作**。每次授权只对当前范围有效。

### 3.3 工具偏好映射表

Claude Code 在提示词中明确要求模型用专用工具而非 bash 命令：

```
Use Read  instead of cat/head/tail
Use Edit  instead of sed/awk
Use Glob  instead of find/ls
Use Grep  instead of grep/rg
```

专用工具和 bash 命令底层功能差不多，差异在**用户体验**：
- 权限可以细粒度控制（读取 vs 写入分开授权）
- 输出结构化
- 原生支持并行调用

没有这张映射表，模型会默认用训练数据中出现最多的方式——即各种 bash 命令。

### 3.4 代码风格约束（反过度工程）

```
- Don't add features, refactor code, or make "improvements" beyond what was asked.
- Don't add error handling, fallbacks, or validation for scenarios that can't happen.
- Don't create helpers, utilities, or abstractions for one-time operations.
- Three similar lines of code is better than a premature abstraction.
- Default to writing no comments.
- Before reporting a task complete, verify it actually works.
```

### 3.5 沟通风格

Claude Code 的 Output Efficiency 部分有详细的沟通规则：

- 写给人类看，不是写给控制台看
- 操作前先简要说明要做什么
- 不要叙述内部机制（不说"让我调用 Grep"，而说"让我搜索一下"）
- 更新时假定对方已经走开了、丢失了上下文
- 完成任务后报告结果，不追加 "Is there anything else?"
- 需要提问时，每次只问一个问题
- 解释事物时，先一句话概括
- 引用代码时用 `file_path:line_number` 格式
- 工具调用前不用冒号

## 四、CLAUDE.md：项目级知识注入

### 4.1 概念

CLAUDE.md 是项目级指令文件，类似 `.eslintrc` 但面向 AI。在项目根目录放一个 `CLAUDE.md` 文件，就能让 AI "理解"项目：技术栈、开发约定、常用命令、注意事项。

### 4.2 多级发现

Claude Code 从 CWD 向上遍历目录树，合并所有 CLAUDE.md：

```text
~/.claude/CLAUDE.md              ← 用户全局（个人偏好）
  └── /project/CLAUDE.md         ← 项目根目录（团队共享）
        └── /project/src/CLAUDE.md  ← 子目录（模块特定）
```

靠近 CWD 的文件**后加载、优先级更高**——利用 LLM 的近因效应，子目录规则可以覆盖父目录规则。

此外 `.claude/rules/*.md` 目录下的规则文件也会自动加载。

### 4.3 @include 语法

CLAUDE.md 支持 `@` 语法引用外部文件：

| 格式 | 含义 |
|---|---|
| `@./relative/path` | 相对于当前 CLAUDE.md 所在目录 |
| `@~/path` | 相对于用户 home 目录 |
| `@/absolute/path` | 绝对路径 |

防护措施：
- **visited Set** 防止循环引用（A include B，B include A）
- **MAX_INCLUDE_DEPTH = 5** 防止嵌套过深
- 找不到文件时留下 HTML 注释标记，不报错中断

## 五、简化实现

在 "从零构建 Claude Code" 教程中，System Prompt 通过模板 + 占位符替换实现：

```typescript
const SYSTEM_PROMPT_TEMPLATE = `You are Mini Claude Code...

# System
 - All text you output outside of tool use is displayed to the user.
 - Tools are executed in a user-selected permission mode.

# Doing tasks
 - Do not propose changes to code you haven't read.
 - Avoid over-engineering. Only make changes directly requested.

# Executing actions with care
Carefully consider the reversibility and blast radius of actions.

# Using your tools
 - Use read_file instead of cat/head/tail
 - Use edit_file instead of sed/awk

# Environment
Working directory: {{cwd}}
Date: {{date}}
Platform: {{platform}}
{{git_context}}
{{claude_md}}
{{memory}}
{{skills}}
{{agents}}`;
```

`{{memory}}`、`{{skills}}`、`{{agents}}` 放在末尾——利用近因效应，这些动态内容的权重更大。

### 简化取舍

| Claude Code | 简化版 | 理由 |
|---|---|---|
| Static/Dynamic 缓存边界 | 不实现 | 教程项目无需优化 API 成本 |
| CLAUDE.md 5 层发现 | 从 CWD 向上遍历 | 覆盖常见场景 |
| @include 指令 | 完整实现 | 保持配置模块化 |
| 反模式接种 | 完整保留 | 对输出质量影响极大 |
| 爆炸半径框架 | 完整保留 | 安全性不能简化 |
| 工具偏好映射表 | 适配工具名保留 | 必须有，否则模型默认用 bash |

## 六、与完整版的差异

教程简化版与真实 Claude Code 的核心差异在于**缓存策略**。真实 Claude Code 的 System Prompt 是一个 `string[]` 数组，通过 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 分界标记将静态内容（可跨组织缓存）与动态内容（会话特定）分离，配合 Anthropic Prompt Cache 的 `scope: 'global'` 实现大幅降低 API 成本。详见 [[05 System Prompt 缓存与动态组装]]。

## ⚡ 30 秒速答版

> Claude Code 的 System Prompt 不是一段咒语，而是**按 7 层从抽象到具体递进**的工程产物：Identity → System → Doing Tasks → Actions → Using Tools → Tone & Style → Output Efficiency。先建立身份和约束框架，再填具体行为指导，因为**模型先建立的概念会成为它理解后续内容的框架**。
>
> 里面最值得学的是三个模式：**反模式接种**——明确写"不要做什么"，因为正面要求（比如 be concise）会给模型留下自我合理化的空间；**爆炸半径框架**——给它"**可逆性 × 影响范围**"的二维判据而不是黑名单，这样遇到规则之外的新场景也能自己推理；**工具偏好映射表**——显式要求用 Read/Edit/Glob/Grep 而不是 cat/sed/find/grep，否则模型会默认用训练数据里出现最多的 bash。
>
> 项目相关的知识不写进 System Prompt，走 **CLAUDE.md**：从 CWD 向上遍历目录树合并，越靠近 CWD 的**后加载、优先级越高**，利用 LLM 的**近因效应**让子目录规则覆盖父目录。
>
> 工程上还有一层：真实版的 System Prompt 是 `string[]` 数组，用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 把**静态区和动态区分开**，静态区可以拿到跨组织的**前缀缓存**——所以静态区必须稳定，任何字符变动都会让缓存失效。

## 💬 对方可能追问的问题

### 顺着 7 层递进结构追（概率最高）

| 追问 | 答题要点 |
|---|---|
| 为什么是这个顺序？打乱会怎样？ | 抽象 → 具体：先用 Identity/System 锁定身份与环境事实，再填行为指导。**先建立的概念会成为理解后续内容的框架**；如果把 Tone & Style 提到 Doing Tasks 前面，模型会拿"输出格式"的框架去理解"该怎么改代码" |
| Identity 层就一句 interactive agent，有必要单独占一层吗？ | 有。它决定了一整套默认交互假设：先简要说明再动手、每次只问一个问题、假定用户已经走开丢了上下文。不声明，模型容易退化成"一次性吐一大段代码" |
| 7 层里哪一层最难写？ | Doing Tasks 和 Actions。因为它们必须落成**可判定的标准**而不是口号——"Three similar lines of code is better than a premature abstraction" 给的是判据，"避免过度工程"给的只是态度 |
| Output Efficiency 不能并进 Tone & Style 吗？ | 拆开是因为违规表现不同。Tone & Style 管**格式**（`file_path:line_number` 引用、工具调用前不用冒号）；Output Efficiency 管**信息密度与沟通对象**（写给人看不是写给控制台看、不叙述内部机制、不追加 "Is there anything else?"） |

### 顺着核心设计模式追

| 追问 | 答题要点 |
|---|---|
| 反模式接种为什么比正面要求有效？ | 正面指令留下**自我合理化空间**：说 "be concise"，模型会认为"加 docstring 让代码更简洁易读"，于是给每个函数加注释。改成 "don't add docstrings to code you didn't change"，解释余地直接被消掉 |
| Doing Tasks 的"不要"具体是哪几条？ | ①**不要扩大范围**（修 bug 不顺手重构周围代码）②**不要防御性编程**（不给不可能发生的场景加 try-catch 和校验）③**不要过早抽象**（三行相似代码优于过早抽象）。另外还有 default to writing no comments、报告完成前先验证真的能跑 |
| 爆炸半径为什么不直接列个黑名单？ | 黑名单不可穷举。给出**可逆性 × 影响范围**的判据后，模型碰到清单外的新场景（比如调 API 删云资源）能自己推出"不可逆 + 共享环境 = 高风险" |
| 这个二维表怎么落到具体分级？ | 可逆+本地 = 编辑本地文件（放行）；可逆+共享 = 推送代码（需确认）；不可逆+本地 = `rm -rf`（需确认）；不可逆+共享 = force push、删云资源（最高风险） |
| 用户已经批准过一次危险操作，下次还问吗？ | 还要问。提示词里有明确一条：**用户批准一次操作不等于批准所有类似操作**，每次授权只对当前范围有效 |
| 有专用工具和 bash 能力差不多，为什么还要写偏好映射？ | 差异在**用户体验**：权限可细粒度控制（读取与写入分开授权）、输出结构化、原生支持并行调用。不写这张表，模型会按训练数据频次选择——也就是各种 bash 命令 |

### 顺着 CLAUDE.md 与分层知识注入追

| 追问 | 答题要点 |
|---|---|
| CLAUDE.md 是怎么被发现和加载的？ | 从 CWD **向上遍历目录树**并合并所有 CLAUDE.md：`~/.claude/CLAUDE.md`（用户全局偏好）→ 项目根（团队共享）→ 子目录（模块特定）；此外 `.claude/rules/*.md` 下的规则文件也会自动加载 |
| 多个 CLAUDE.md 规则冲突时谁生效？ | 靠近 CWD 的文件**后加载、优先级更高**，机制是 LLM 的**近因效应**，所以子目录规则可以覆盖父目录规则 |
| `@include` 有什么坑，怎么防？ | 三重防护：**visited Set** 防循环引用（A include B、B include A）、**MAX_INCLUDE_DEPTH = 5** 防嵌套过深、文件找不到时留一个 HTML 注释标记而不是报错中断。路径支持 `@./`（相对当前 CLAUDE.md）、`@~/`、`@/` |
| 模板里 `{{memory}}`/`{{skills}}`/`{{agents}}` 为什么放末尾？ | 同样吃**近因效应**——放末尾这些动态内容权重更大；而且它们本来就会变，放在后面才不会污染前面那段稳定的静态前缀 |

### 顺着工程落地与你自己写 Prompt 的实践追

| 追问 | 答题要点 |
|---|---|
| 教程简化版和真实 Claude Code 差在哪？ | 核心差在**缓存策略**。真实版 System Prompt 是 `string[]` 数组，用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 分界，把静态内容（可 `scope: 'global'` 跨组织缓存）与动态的会话特定内容分离；教程版直接不实现缓存边界，因为无需优化 API 成本 |
| 做简化时哪些能砍、哪些绝不能砍？ | 能砍：缓存边界（教程项目不需要）、CLAUDE.md 多层发现（退化成从 CWD 向上遍历就够覆盖常见场景）。不能砍：**反模式接种**（对输出质量影响极大）、**爆炸半径框架**（安全性不能简化）、**工具偏好映射表**（不写模型就默认用 bash） |
| 让你从零写一份 System Prompt，怎么下手？ | 照 7 层骨架搭：身份 + 环境事实 → 行为规则 → 风险判据 → 工具偏好 → 输出格式与沟通；规则一律写成**可判定的负面约束**；风险控制给框架不给清单；工具与 bash 能力重叠时显式写偏好映射；项目知识一律不进 System Prompt，走 CLAUDE.md |
| 怎么验证一条提示词规则真的有效？ | Claude Code 的做法就是 **A/B 测试 + 模型行为观察**反复迭代。自己做：固定一组任务跑对照，统计目标反模式（多余注释、越界重构、误用 bash 命令）的出现率是否下降，而不是凭感觉判断"这样写更好" |

### 高频陷阱题

1. **「System Prompt 是不是写得越长越详细越好？」** → 不是。这三条"不要"的价值**不在概念**（谁都知道不要过度工程）**而在措辞的精确度**——它给的是判断标准。堆没有判据的原则只会稀释重点，而且 System Prompt 是每轮请求都要发的固定开销（一次典型的 System Prompt 就有 20K+ token 量级），长度本身是成本不是收益。
2. **「只写正面要求不行吗，为什么非要写负面示例？」** → 不行。正面要求会被模型**自我合理化**：要求 "be concise"，它会论证"加 docstring 是为了更易读"然后照加。负面约束（"don't add docstrings to code you didn't change"）不给它解释空间——这就是**反模式接种**。
3. **「项目的技术栈、常用命令，是不是该写进 System Prompt？」** → 不该。职责边界是：System Prompt 放**通用、跨项目稳定**的行为契约（身份、风险框架、工具偏好、输出风格）；项目级知识走 **CLAUDE.md**（多级发现、可被子目录覆盖、随项目仓库演进）。混进 System Prompt 会把本该静态的前缀变成动态，既破坏缓存，也没法随项目版本走。
4. **「在 System Prompt 里塞个当前时间或 session id，应该没影响吧？」** → 有影响。缓存以**内容块**为单位、缓存键由内容哈希决定，**任何字符变化都会让该块缓存失效**。所以环境信息、会话特定内容必须放在动态分界**之后**——这正是 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 存在的理由，静态区稳定不是洁癖而是省钱。
5. **「爆炸半径不就是'危险操作要先确认'吗？」** → 不止。它是**两个正交维度**（可逆性 × 影响范围）构成的判据框架；只记住"危险=确认"就丢掉了对新场景的推理能力，也会漏掉"一次批准不等于永久批准"这条。
6. **「模型自己就会挑最合适的工具吧？」** → 不会。没有偏好映射表，模型按训练数据里的出现频次选择，会大量退回 cat/sed/find/grep，牺牲掉细粒度权限、结构化输出和并行调用能力。

## 七、相关页面

- [[Agent 系统设计的三维框架：Prompt-Context-Harness]] — 本页所属的上层框架：Prompt 维度的方法论来源与三系统横向对比
- [[05 System Prompt 缓存与动态组装]] — 动态组装管道、缓存策略、分块标记（⚠️ 页面尚未创建）
- [[03 Claude Code 上下文工程]] — 更宏观的上下文管理视角
- [[01 Agent 记忆机制]] — Agent 记忆机制的全局视角
- [[02 多轮对话记忆设计]] — 记忆策略详解
- [[raw/编程笔记/claude源码解析/System Prompt 工程]] — 源材料
- [[raw/编程笔记/claude源码解析/源代码/prompts.ts]] — 源代码分析
