---
title: ProjDevBench：端到端项目开发能力的 Agent 评测（论文笔记）
tags:
  - vibecoding
  - Agent
  - 评测
  - 论文笔记
  - LLM
created: 2026-09-30
updated: 2026-09-30
---

> 一句话概述：ProjDevBench 用"OJ 执行分 80% + 代码审查分 20%"端到端评测 coding agent 的**完整项目开发**能力。三大发现：① 从零构建是真正的分水岭（多数 agent 补全尚可、从零大跌）；② 交互越长越接近失败（tokens/轮数与分数显著负相关）；③ Agent 框架与模型是**乘法关系**。结论：vibe coding 可以做原型，但还不能替代完整项目开发。

## 一、论文信息

- 原文：[ProjDevBench: Benchmarking AI Coding Agents on End-to-End Project Development](https://zsworld6.github.io/projdevbenchpage/)
- 作者单位：上海交通大学、加州大学默塞德分校、上海创智学院（感觉相对靠谱）

**个人评价**：代码示例和过程写得比较详细，之前一直不知道 agent 和搭配的大模型对开发结果到底有多大影响，这篇给了量化答案。但也存在问题——示例中的管理系统只有四个，样本偏少，而且**全部是用 C++ 开发的命令行程序**（没错，就是命令行）。

## 二、衡量指标

| 指标 | 说明 | 权重 |
| :--- | :--- | :--- |
| **执行分** | 把 AI 写的整个项目丢到 **OJ**（在线判题系统：自动编译、运行、跑测试打分）里跑，看功能对不对、会不会超时超内存 | **80%** |
| **代码审查分** | 用规则脚本 + **大模型**（LLM）检查有没有违规、作弊、不按要求提交 | **20%** |

**最终分 = 0.8 × 执行分 + 0.2 × 代码审查分**

## 三、评估过程

给 AI **20 个项目需求**，有的给半成品，有的从零做。AI 自己写完整项目、建**仓库**、配置构建、提交。然后 OJ 自动跑测试，代码审查再查规范，最后加权算总分。允许多次提交，取最高分。

> 总体上只有 **27.38%** 的提交被接受。

### Easy / Hard 的划分依据

⚠️ 注意：Easy / Hard **不是按题目本身"难不难"主观划分的，而是按"是否提供初始代码库"划分**（论文 3.1 节）：

> "tasks in the project-completion and project-creation settings are categorized as Easy and Hard subsets, respectively."

![[ProjDevBench-Table5-任务清单与Easy-Hard划分.png]]
> Table 5 的 **Difficulty** 列直接标注 E / H，依据即"是否提供初始代码库"。从实验看，Hard 子集上很多 agent 性能下降明显，说明**从零构建完整项目仍是当前 coding agent 的薄弱环节**。

## 四、三个核心结论

### 1. 从零构建，是当前 coding agent 的真正分水岭

论文把任务分成两档：

- **Easy**：项目补全，给部分代码库；
- **Hard**：从零创建完整项目。

结果很多 agent 在 Easy 上表现还不错，一到 Hard 就大幅下降：

| Agent + Model | Easy → Hard (Final) |
| :--- | :--- |
| GitHub Copilot + Sonnet-4.5 | 74.46 → **45.35** |
| Gemini CLI | 75.72 → **47.26** |
| Codex + GPT-5 | 79.81 → **71.95**（唯一相对稳定） |

![[ProjDevBench-评测结果总表.png]]

**列定义**：

- **Agent**：AI 编程智能体产品 / 框架（Augment、Codex、Cursor、GitHub Copilot、Claude Code）
- **Model**：底层大模型（GPT-5、Sonnet-4.5、Gemini-3-Pro、DeepSeek、GLM、Kimi 等）
- **Easy(E) / Hard(H)**：按**是否提供初始代码库**划分——E=项目补全、H=从零创建（见上文"Easy / Hard 的划分依据"）
- **Exec.（Execution）**：执行分——写出来的代码能不能成功运行
- **CR（Code Review）**：代码评审分——代码质量、规范、可读性、工程性
- **Final**：加权总分；**Overall**：全部任务综合得分

> 道理是：给模板补代码，和从需求出发造一个完整系统，是**两种能力**，后者难得多。写函数比写一整个项目容易得多。

### 2. 交互越长，不一定越接近成功

论文发现：平均每题 **138 轮交互、4.81M tokens**。而且：

- Tokens 与最终分数：Spearman ρ = **-0.734**
- Turns 与最终分数：Spearman ρ = **-0.668**

也就是说，难题会逼 agent 进行更长交互，但**长交互并不保证它能解决问题**。很多 agent 在长时间调试后，仍然无法把"反复尝试"转化为"有效进展"。

> 道理是：多轮交互本身不是能力，**能把交互转化为正确决策才是能力**。

### 3. Agent 框架和模型是乘法关系，不是简单叠加

同一个 GPT-5，放在不同 agent 框架里，结果不同：

| 框架 + GPT-5 | Final |
| :--- | :--- |
| Codex | **77.85** |
| Augment | 72.35 |
| Cursor | 71.85 |

同一个模型在不同框架下，执行分和代码审查分也会变——比如 Sonnet-4.5 在 Claude Code 里代码审查分高达 **89.31**，但执行分只有 **63.76**。

> 道理是：**选模型重要，选 agent 框架也重要**，二者会相互影响。

## 五、总结论

论文结论很直接：

- 简单任务有希望；
- 复杂、真实、系统级任务仍然不行；
- 开源模型整体落后于最强闭源模型；
- **从零构建、资源约束、系统集成**仍是瓶颈。

所以，**vibe coding 可以做原型，但还不能放心替代完整项目开发。**

## 六、相关页面

- [[wiki_published/vibecoding开发经验/02 AI 时代该如何学习编程？]] — 同系列：AI 时代"能定义、能判断、能兜底"正是对"从零构建不行"的人的补位
