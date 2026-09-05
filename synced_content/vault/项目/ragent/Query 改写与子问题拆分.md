---
title: Query 改写与子问题拆分
tags:
  - rag
  - ragent
  - query-rewrite
  - 多轮对话
  - cache-aside
  - 容错设计
  - 面试
created: 2026-08-15
updated: 2026-08-15
---

# Query 改写与子问题拆分

> **模型有记忆，但检索没有。** 会话记忆让 LLM 知道「它」是 iPhone 16 Pro，但检索引擎拿到的仍是原话「那它的保修期呢」——「它」不携带任何语义。Query 改写就是在检索之前，把原始问题转化为**独立、完整、对检索友好**的查询；子问题拆分则进一步解决**意图覆盖**问题。

> **答题主线（一句话串起全篇）**：检索系统失忆 → 五种改写策略 → 拆分补上意图覆盖 → Ragent 落地：术语归一化（Cache-Aside + 长词优先）+ 一次 LLM 调用双输出（`rewrite` + `sub_questions`）→ 四层 JSON 容错 → 三层兜底 → 子问题并行喂给 `IntentResolver`。

本篇整合原理与工程两个视角：第一~三章讲**为什么**（通用原理，任何 RAG 系统都适用），第四~八章讲 Ragent **怎么做**（具体实现与设计取舍），第九章是**面试作答逻辑与追问预案**。

## 一、这是什么：检索系统的「失忆」

### 1.1 问题定位

多轮对话中 RAG 的断点不在生成端，而在检索端：

| 环节 | 是否有上下文 |
|---|---|
| LLM 生成 | ✅ 有（会话记忆已注入 history） |
| 向量检索 | ❌ 无（只拿到当前 query 字符串） |

「那它的保修期呢」向量化后，与「iPhone 16 Pro 保修期」的向量距离可能相差甚远，召回的往往是「笔记本电脑保修政策」「家电延保服务」这类无关内容。

### 1.2 不只是「它」的问题

| 问题类型 | 用户原话 | 检索为什么失败 |
|---|---|---|
| 省略上下文 | 还有别的颜色吗？ | 不知道是哪个产品的颜色 |
| 口语化表达 | 东西坏了咋整？ | 文档标题是「产品故障维修流程」，存在语义鸿沟 |
| 多意图混合 | 退货流程是什么，运费谁承担？ | 一次检索难以同时命中两个主题的 chunk |
| 模糊描述 | 那个很贵的手机 | 无上下文，无法解析「那个」「很贵」 |

共同点：**用户的原始 query 对检索系统不够友好。**

## 二、五种改写策略

### 2.1 指代消解（Coreference Resolution）

把代词替换为具体实体，多轮对话中最高频。

| 指代表达 | 示例 | 改写结果 |
|---|---|---|
| 它 / 它的 | 那它的保修期呢？ | iPhone 16 Pro 的保修期 |
| 这个 / 那个 | 这个支持分期吗？ | iPhone 16 Pro 支持分期吗？ |
| 上面说的 | 上面说的退货条件再详细说说 | iPhone 16 Pro 拆封后退货条件的详细说明 |

**关键**：必须结合对话历史才能确定指代对象。

**边界情况**：前文同时提到 iPhone 16 Pro 和 AirPods Pro，再问「它的保修期呢」，指代不明确 —— 通常取**最近一次被提到的实体**。

### 2.2 上下文补全（Context Completion）

人在对话中会自然省略信息，检索系统不知道被省略了什么。

| 原始 query | 省略了什么 | 改写结果 |
|---|---|---|
| 还有别的颜色吗？ | 什么产品 | iPhone 16 Pro 还有其他颜色可选吗？ |
| 价格呢？ | 什么东西的价格 | iPhone 16 Pro 的价格是多少？ |
| 能退吗？ | 什么产品、什么情况 | iPhone 16 Pro 拆封后能退货吗？ |

上下文补全常与指代消解同时出现（「价格呢」既省略产品名又省略主语），实际改写时大模型一并处理，无需单独区分。

### 2.3 口语化转正式（Colloquial to Formal）

用户说人话，文档写书面语。

| 口语 query | 知识库正式表达 |
|---|---|
| 东西坏了咋整 | 产品故障报修流程 |
| 快递咋还没到 | 订单物流查询 / 发货时效 |
| 能不能便宜点 | 优惠活动 / 促销政策 |
| 买贵了能补差价不 | 价格保护政策 |

两个要点：

- **不依赖对话历史** —— 单轮 RAG 也有价值。
- **不是「翻译」，而是「意图提取」** —— 「能不能便宜点」的意图是「查询有无优惠」，不是字面上的「降价」。

### 2.4 多意图拆分（Intent Decomposition）

| 原始 query | 是否拆分 |
|---|---|
| 退货流程是什么，运费谁承担？ | 拆（两个独立意图） |
| iPhone 16 Pro 和 iPhone 16 Plus 有什么区别？ | 不拆（对比型，放一起才能回答） |
| 我想退货，另外帮我查一下保修期 | 拆（两个不相关意图） |

**判断标准：两个意图是否可能分布在不同的 chunk 里。** 「iPhone 16 Pro 的价格和颜色」虽问两方面，但通常同一个产品介绍 chunk 就覆盖，不需要拆。

代价：拆分后每个子查询都走一遍检索，**成本翻倍**。业务场景多意图问题不多时可先不实现。

### 2.5 关键词扩展（Keyword Expansion）

补充同义词与相关术语，提高召回率。

| 原始 query | 扩展后 |
|---|---|
| 七天无理由退货 | 七天无理由退货 退换货政策 无条件退款 退货期限 |
| 屏幕碎了 | 屏幕碎裂 屏幕破损 屏幕维修 碎屏险 |

主要收益在 **BM25（按词匹配）** 一路；对向量检索帮助有限——向量本身已能理解「屏幕碎了」与「屏幕破损」的相似性。**混合检索（向量 + BM25）场景下提升明显。**

### 2.6 五种策略对比

| 策略 | 解决的问题 | 依赖历史 | 复杂度 | 对检索的影响 | 优先级 |
|---|---|---|---|---|---|
| 指代消解 | 代词无法检索 | 是 | 低 | 必需，否则检索失败 | **必做** |
| 上下文补全 | 省略信息无法检索 | 是 | 低 | 必需，否则不精准 | **必做** |
| 口语化转正式 | 口语与文档的语义鸿沟 | 否 | 中 | 有提升，尤其 BM25 | 推荐 |
| 多意图拆分 | 一次检索覆盖不了多意图 | 否 | 高 | 有提升，成本翻倍 | 按需 |
| 关键词扩展 | 同义词不匹配 | 否 | 低 | 对 BM25 有帮助 | 按需 |

## 三、通用改写实践：用大模型做改写

不需要为每种策略单独写规则，一个 Prompt 即可覆盖指代消解、上下文补全、口语化转正式。

### 3.1 基础版 Prompt（推荐默认）

```
你是一个查询改写助手。根据对话历史和用户的最新问题，将问题改写为一个独立的、完整的检索查询。

要求：
1. 如果最新问题中包含代词（它、这个、那个等）或省略了关键信息，请结合对话历史补全
2. 如果问题已经足够完整清晰，请原样输出，不要画蛇添足
3. 不要添加用户没有提到的信息
4. 只输出改写后的查询，不要输出任何解释、前缀或多余内容
5. 改写后的查询应该是一个独立的句子，脱离对话历史也能理解

对话历史：{history}
用户最新问题：{query}
改写后的查询：
```

### 3.2 进阶版 Prompt（需要多意图拆分时）

输出改为 JSON `{"queries": ["查询1", "查询2"]}` 便于程序解析。

| 原始 query | 输出 |
|---|---|
| 那它的保修期呢？ | `{"queries": ["iPhone 16 Pro 的保修期是多久"]}` |
| 退货流程和运费谁承担？ | `{"queries": ["退货流程是什么", "退货运费由谁承担"]}` |

> 基础版够用就用基础版。进阶版功能更强，但 JSON 解析增加复杂度，模型偶尔输出不规范 JSON。Ragent 走的是进阶版路线（见第五章）。

### 3.3 改写质量取决于什么

- **对话历史的质量**：若摘要压缩过狠，只剩「客户咨询手机售后」而丢了具体型号，改写就无法消解「它」。**会话记忆的摘要质量直接决定改写质量。**
- **Prompt 的设计**：必须明确「已完整的 query 原样输出」，否则模型画蛇添足。
- **模型能力**：改写任务要求不高，`Qwen2.5-7B-Instruct` 级别即可胜任。

### 3.4 三类典型失败案例

| 失败类型 | 原始 query | 错误改写 | 原因 |
|---|---|---|---|
| 过度改写 | 它多少钱？ | iPhone 16 Pro 256GB 沙漠色钛金属在京东平台的售价是多少？ | 平台和颜色是模型自己加的 |
| 改写不足 | 那个也是这个价吗？ | （原样输出） | 代词未替换 |
| 偏离原意 | 能不能便宜点？ | 如何投诉商品定价过高？ | 误解意图 |

**过度改写比不改写更危险** —— 凭空增加的限定词会把检索引向错误方向。抑制手段：Prompt 中明确「不要添加用户没有提到的信息」。

### 3.5 通用工程注意事项

**成本与跳过时机**：单次改写增加约 **200~500ms 延迟** 和一小笔 Token 费用。

| 可以跳过 | 必须改写 |
|---|---|
| 第一轮对话且 query 本身完整 | query 含代词（它/这个/那个/上面的） |
| query 已含主体、动作、对象 | query 很短且缺主体（还有吗？多少钱？） |
| | 多轮对话中的追问（非第一轮） |

> 更稳的做法：**有对话历史就一律改写**。用小模型成本很低，避免规则未覆盖导致漏改。

**在 RAG 流程中的位置**：

```
用户提问 → 读会话记忆 → 【Query 改写】 → 检索 → 生成
```

1. **检索用改写后的 query，生成 Prompt 里放用户原始问题。** 改写的目的是提升检索精度，不是改变用户的问题（保险起见可原问题 + 改写问题都放）。
2. **位置必须在会话记忆读取之后、检索之前** —— 改写以历史为输入，以检索为输出。

**失败兜底**：改写是**锦上添花，不是雪中送炭**。API 超时、格式异常时用原始 query 兜底，绝不让整个 RAG 链路挂掉。

**改写缓存**：同 session 内重复提问可缓存，**缓存 key 必须包含 sessionId** —— 同样的「价格呢？」在聊 iPhone 和聊 AirPods 时改写结果完全不同。

**质量监控**：改写是**容易默默出错**的环节：改写差 → 检索不到 → 模型兜底回答，用户只觉得「这 AI 不聪明」。建议记录 `original_query` / `rewritten_query` / `history_length` / `rewrite_latency_ms`，关注三个指标：

- **改写率**：触发改写的请求占比，过低说明判断规则太严
- **过度改写率**：人工标注的画蛇添足比例，过高需调 Prompt
- **改写后检索提升率**：改写前后检索命中率对比

## 四、Ragent 落地：阶段 2 的双输出设计

### 4.1 在问答 Pipeline 中的位置

```
阶段 1 会话记忆（ctx.history）
   ↓
阶段 2 查询改写 + 拆分（ctx.rewriteResult）   ← 本章起
   ↓
阶段 3 意图识别（IntentResolver，每个子问题并行分类）
   ↓
阶段 4 歧义引导 → 阶段 5 检索/直答
```

核心特点：**一次 LLM 调用同时完成「改写」和「拆分」**。改写解决检索精度（指代消解、去噪），拆分解决复合问题的**意图覆盖**。

### 4.2 拆分解决什么：意图覆盖

以「iPhone 16 Pro 的退货政策是什么？AirPods Pro 的保修期呢？」为例：

**不拆分**：
```
改写后 → "iPhone 16 Pro 退货政策和 AirPods Pro 保修期"（唯一子问题）
→ 意图分类 → 可能只命中 kb-return-policy
→ 结果：AirPods Pro 的保修期方向被漏掉
```

**拆分后**：
```
子问题 1 "iPhone 16 Pro 的退货政策是什么" → 命中 kb-return-policy（score=0.92）
子问题 2 "AirPods Pro 的保修期"          → 命中 kb-warranty（score=0.90）
→ 两个方向都命中，分别去对应知识库检索
```

类比：**改写像是把一封字迹潦草的信重新写清楚；拆分像是把一封问了两件事的信拆成两封，分别交给不同部门。**

### 4.3 拆与不拆的判断标准

核心标准：**子问题能不能独立回答。**

| 场景 | 是否拆分 | 原因 |
|---|---|---|
| A 的退货政策？B 的保修期呢？ | 拆分 | 两个独立问题，不同产品不同主题 |
| A 和 B 的退货政策分别是什么？ | 拆分 | 话题相同但指向不同产品，需分别检索 |
| A 和 B 有什么区别？ | **不拆分** | 对比型，两者放一起才能回答 |
| A 从哪些方面考虑？ | **不拆分** | 笼统询问，无明确列举 |
| 你好 | **不拆分** | 问候语，保持原样 |

**对比型问题是最容易误拆的**。拆成「A 的优缺点」+「B 的优缺点」后各自召回一堆文档，但用户要的是对比，拆了反而更差。

### 4.4 RewriteResult：一个 Record 承载两个输出

```java
public record RewriteResult(String rewrittenQuestion, List<String> subQuestions) {
}
```

| 字段 | 用途 |
|---|---|
| `rewrittenQuestion` | 改写后的完整问题；用于阶段 4 歧义引导展示给用户，不拆分时也作为检索查询 |
| `subQuestions` | 子问题列表；每个子问题独立送去阶段 3 做意图分类 |

**关键约定**：不拆分时 `subQuestions` 只有一个元素，内容与 `rewrittenQuestion` 一致。这样下游 `IntentResolver` 不管拆不拆都从 `subQuestions` 取数据，**逻辑统一，无需特判**。

## 五、术语归一化：LLM 之前的规则预处理

### 5.1 解决什么

用户说「苹果手机」，文档标题写「iPhone 系列」；用户说「降噪豆」，实指 AirPods Pro。不归一化则 LLM 改写后可能保留口语叫法，向量距离偏远，检索精度打折。

> 例：「苹果手机的降噪豆能退吗」→ 归一化 →「iPhone 的 AirPods Pro 能退吗」→ 再交给 LLM 做语义改写。

### 5.2 QueryTermMappingService 的三个设计点

```java
public String normalize(String text) {
    if (text == null || text.isEmpty()) return text;
    List<QueryTermMappingDO> mappings = loadMappings();
    String result = text;
    for (QueryTermMappingDO mapping : mappings) {
        result = QueryTermMappingUtil.applyMapping(
                result, mapping.getSourceTerm(), mapping.getTargetTerm());
    }
    return result;
}
```

**① 缓存在 Redis 而非本地内存 —— Cache-Aside 模式**

```java
// 读：缓存未命中 → 查 DB（enabled=1）→ 排序 → 回填 Redis
// 写：Admin 接口先写数据库，再删缓存
queryTermMappingMapper.insert(record);
queryTermMappingCacheManager.clearCache();
```

读时加载、写时失效。集群部署时任意实例的 Admin 操作都会删除 Redis 缓存，所有实例下次 `normalize` 发现缓存为空各自重新加载，**天然保持一致，无需重启应用**。与意图树的缓存策略一致。

**② 排序策略：优先级降序 + 源词长度降序**

```java
dbList.sort(Comparator
        .comparing(QueryTermMappingDO::getPriority, Comparator.nullsLast(Integer::compareTo)).reversed()
        .thenComparing(m -> m.getSourceTerm().length(), Comparator.reverseOrder()));
```

**为什么长词优先？** 假设有「苹果 → Apple」和「苹果手机 → iPhone」两条规则。若短词先替换，「苹果手机」变成「Apple 手机」，长词规则再也匹配不到 —— **长词优先避免这种截断问题**。

**③ 纯文本替换，零 LLM 开销**

速度快，相当于**提前帮 LLM 做好功课**：把别名问题解决掉，LLM 只专注指代消解和语义改写。

## 六、一次 LLM 调用完成改写 + 拆分

### 6.1 入口：rewriteWithSplit

```java
@RagTraceNode(name = "query-rewrite-and-split", type = "REWRITE")
public RewriteResult rewriteWithSplit(String userQuestion, List<ChatMessage> history) {
    // 开关关闭 → 术语归一化 + 规则拆分，不调 LLM
    if (!ragConfigProperties.getQueryRewriteEnabled()) {
        String normalized = queryTermMappingService.normalize(userQuestion);
        return new RewriteResult(normalized, ruleBasedSplit(normalized));
    }
    // 开关打开 → 归一化后送 LLM
    String normalizedQuestion = queryTermMappingService.normalize(userQuestion);
    return callLLMRewriteAndSplit(normalizedQuestion, userQuestion, history);
}
```

要点：**不管开关开不开，都先过一遍术语归一化。**

### 6.2 消息数组的三个设计决策

```
[0] SYSTEM:    改写 Prompt（角色、规则、输出格式、示例）
[1] USER:      最近第 N-1 轮用户消息（如有）
[2] ASSISTANT: 最近第 N-1 轮助手回复（如有）
[3] USER:      最近第 N 轮用户消息（如有）
[4] ASSISTANT: 最近第 N 轮助手回复（如有）
[5] USER:      当前归一化后的问题
```

| 决策 | 做法 | 原因 |
|---|---|---|
| 历史只取最近 2 轮 | `subList(size-4, size)`，最多 4 条 | 指代消解 1~2 轮足够；送太多既浪费 Token 又引入噪音，导致过度改写 |
| 过滤 SYSTEM 消息 | 只保留 USER / ASSISTANT | `ctx.history` 里的摘要是 SYSTEM 类型，是给最终生成用的，对改写无价值 |
| 参数追求确定性 | `temperature=0.1`、`topP=0.3`、`thinking=false` | 改写是确定性任务，同问题同上下文应得同结果 |

> 对比会话记忆摘要压缩的参数（`temperature=0.3`、`topP=0.9`）：**摘要需要归纳灵活性，改写需要精确和一致。**

### 6.3 Prompt 模板（user-question-rewrite.st）

**输出格式**：严格 JSON，三个字段。

```json
{
  "rewrite": "改写后的查询",
  "should_split": true,
  "sub_questions": ["子问题1", "子问题2"]
}
```

`rewrite` → `RewriteResult.rewrittenQuestion`；`sub_questions` → `RewriteResult.subQuestions`；`should_split` 是**辅助判断字段**，帮 LLM 明确自己的决策。用 JSON 而非纯文本，是因为纯文本无法同时承载子问题列表。

**改写规则三分法**：

| 类别 | 内容 | 为什么 |
|---|---|---|
| 保留 | 专有名词（系统名/产品名/模块名）、关键限制（时间/环境/终端/角色）、业务场景 | 检索的核心信号，「iPhone 16 Pro 在京东自营的退货政策」每个词都可能命中不同 chunk |
| 删除 | 礼貌用语（请帮我/麻烦/谢谢）、回答指令（详细说明/分点回答）、无关描述（我是新人） | 对检索无价值，一起向量化会干扰核心关键词匹配 |
| 禁止 | 添加原文没有的条件/维度/假设、修改专有名词写法、引入「方面/维度/角度」等枚举词 | **最容易出问题**：LLM 会把「退货政策」扩写成「包括七天无理由、拆封后退货、运费承担等环节」，多出的枚举词把检索引向错误方向 |

**拆分规则**：

- 何时拆：多个问号、显式列举（`1) ... 2) ...`、「A 和 B 分别是什么」）、分号/换行分隔
- 何时不拆：抽象对比、笼统询问、**不确定时不拆**
- 一致性约束：不拆则 `sub_questions` 仅 1 条且与 `rewrite` 完全一致

核心理念：**宁可不拆也不要错拆** —— 错误的拆分比不拆分危害更大。

**示例设计（5 个，覆盖决策边界）**：

| 示例 | 场景 |
|---|---|
| 1 | 删除礼貌用语，不拆分 |
| 2 | 保留专有名词和限制，不拆分 |
| 3 | 两个问号 → 拆成两个子问题 |
| 4 | 「X 和 Y 有什么区别」→ 不拆分 |
| 5 | 结合历史做指代消解，不拆分 |

**示例 3 与 4 成对出现尤其重要** —— 一个该拆一个不该拆，让 LLM 看到区分标准。另外 5 个示例中 4 个是无历史场景，这个分布告诉 LLM：**大部分情况不需要指代消解，只需去噪和判断是否拆分。**

## 七、容错设计：四层解析 + 三层降级 + 三层兜底

### 7.1 JSON 解析的四层容错

**LLM 返回的 JSON 不能完全信任。**

```java
private RewriteResult parseRewriteAndSplit(String raw) {
    try {
        // 第 1 层：移除 Markdown 代码块标记
        String cleaned = LLMResponseCleaner.stripMarkdownCodeFence(raw);
        JsonElement root = JsonParser.parseString(cleaned);
        if (!root.isJsonObject()) return null;
        JsonObject obj = root.getAsJsonObject();
        String rewrite = obj.has("rewrite") ? obj.get("rewrite").getAsString().trim() : "";

        // 第 2 层：逐个元素校验子问题数组（类型 + 非空）
        List<String> subs = new ArrayList<>();
        // ... isJsonPrimitive() && isString() && isNotBlank()

        // 第 3 层：rewrite 为空则整体失败
        if (StrUtil.isBlank(rewrite)) return null;
        // 第 4 层：没有子问题则用 rewrite 兜底
        if (CollUtil.isEmpty(subs)) subs = List.of(rewrite);

        return new RewriteResult(rewrite, subs);
    } catch (Exception e) {
        log.warn("解析改写+拆分结果失败，raw={}", raw, e);
        return null;
    }
}
```

`LLMResponseCleaner.stripMarkdownCodeFence` 用正则移除头尾围栏（支持带语言标识如 ```json），项目里凡是需要从 LLM 返回中提取 JSON 的地方都先过一遍。

> **经验**：Prompt 里写了「严格返回 JSON、不要额外文字」，LLM 大概率还是会时不时包一层 Markdown。**不能在解析端假设 LLM 遵守格式要求，每个边界都要有容错。**

### 7.2 接口设计：三层方法逐级降级

```java
public interface QueryRewriteService {
    String rewrite(String userQuestion);                       // 纯改写，最基础

    default RewriteResult rewriteWithSplit(String q) {          // 改写 + 拆分
        String rewritten = rewrite(q);
        return new RewriteResult(rewritten, List.of(rewritten));
    }

    default RewriteResult rewriteWithSplit(String q, List<ChatMessage> history) {
        return rewriteWithSplit(q);                              // 完整版，向上回退
    }
}
```

`default` 实现让调用一路回退到 `rewrite`。**扩展价值**：将来若想换一个纯规则改写器，只覆盖 `rewrite` 即可，`default` 自动把结果包装成 `RewriteResult`，Pipeline 调最完整版本也不会报错。当前 `MultiQuestionRewriteService` 直接覆盖了最完整的版本。

### 7.3 三层兜底：链路绝不中断

改写是**增强项**，失败最坏就是拿原始问题去检索、精度差一点，不应中断问答流程。

| 异常场景 | 兜底策略 | 结果 |
|---|---|---|
| 改写开关关闭 | 术语归一化 + 规则拆分 | `RewriteResult`（归一化问题 + 按标点拆分的子问题） |
| LLM 调用异常 | 归一化问题作为改写结果和唯一子问题 | `RewriteResult(归一化问题, [归一化问题])` |
| JSON 解析失败 | 同上 | 同上 |

**关键细节**：兜底用的是 `normalizedQuestion` 而**不是原始 `userQuestion`** —— 即使 LLM 挂了，术语归一化的成果不白费，「苹果手机」至少已映射成「iPhone」。

**规则拆分（开关关闭时）**：

```java
private List<String> ruleBasedSplit(String question) {
    List<String> parts = Arrays.stream(question.split("[?？。；;\\n]+"))
            .map(String::trim).filter(StrUtil::isNotBlank).collect(Collectors.toList());
    if (CollUtil.isEmpty(parts)) return List.of(question);
    // 问号本身是分隔符，分割后末尾无问号，统一补上保持问句形式
    return parts.stream().map(s -> s + "？").toList();
}
```

简单粗暴，但至少覆盖最基本的多问句情况；结果为空时回退原问题，**保证返回值永不为空**。

## 八、喂给下游：IntentResolver 与全链路

```java
@RagTraceNode(name = "intent-resolve", type = "INTENT")
public List<SubQuestionIntent> resolve(RewriteResult rewriteResult) {
    List<String> subQuestions = CollUtil.isNotEmpty(rewriteResult.subQuestions())
            ? rewriteResult.subQuestions()
            : List.of(rewriteResult.rewrittenQuestion());     // 防御性回退

    List<CompletableFuture<SubQuestionIntent>> tasks = subQuestions.stream()
            .map(q -> CompletableFuture.supplyAsync(() -> {
                try { return new SubQuestionIntent(q, classifyIntents(q)); }
                catch (Exception e) { return new SubQuestionIntent(q, List.of()); }  // 降级空意图
            }, intentClassifyExecutor))
            .toList();

    return capTotalIntents(tasks.stream().map(CompletableFuture::join).toList());
}
```

四个要点：

1. 统一从 `subQuestions` 取数据，为空时防御性回退到 `rewrittenQuestion`
2. 每个子问题在**专用线程池** `intentClassifyExecutor` 上通过 `CompletableFuture` **并行**分类
3. 单个子问题分类失败**降级为空意图**，不影响其他子问题
4. `capTotalIntents` **封顶总意图数** —— 防止子问题多 × 每个命中多个意图 → 后续检索开销爆炸

### 全链路示例

**输入**：请帮我详细介绍一下苹果手机的退货流程？降噪豆的保修期呢？

```
Step 1 术语归一化
  苹果手机 → iPhone；降噪豆 → AirPods Pro
  → "请帮我详细介绍一下iPhone的退货流程？AirPods Pro的保修期呢？"

Step 2 LLM 改写 + 拆分
  {"rewrite": "iPhone退货流程和AirPods Pro保修期",
   "should_split": true,
   "sub_questions": ["iPhone的退货流程", "AirPods Pro的保修期"]}

Step 3 解析为 RewriteResult（礼貌用语「请帮我详细介绍一下」被删除）

Step 4 IntentResolver 并行分类
  "iPhone的退货流程"     → kb-return-policy（0.92）
  "AirPods Pro的保修期"  → kb-warranty（0.89）
```

对比不拆分：唯一子问题「iPhone退货流程和AirPods Pro保修期」可能只命中 kb-return-policy（0.78），AirPods Pro 方向被漏掉。

**注意顺序**：术语归一化在拆分**之前**生效。否则 LLM 可能保留「降噪豆」，后续在 AirPods Pro 相关意图节点里搜「降噪豆」就匹配不上。

### 特殊场景与配置

| 场景 | 处理 |
|---|---|
| 问候/身份类（你好、你是谁） | 保持原样。阶段 3 识别为 SYSTEM 意图，阶段 5 系统直答，根本不走检索 |
| 单轮对话（无历史） | 过滤后无 user/assistant 消息，消息数组只有 System Prompt + 当前问题，自然不做指代消解 |
| 改写结果与原问题一致 | 正常情况。下游逻辑完全一致，不需特判 |

| 配置项 | 默认值 | 调优建议 |
|---|---|---|
| `rag.query-rewrite.enabled` | true | 开发调试可关闭以减少 LLM 调用；生产建议开启 |

**模型选型**：改写不需要强模型。输入短、输出短（一个 JSON），**7B / 14B 轻量模型完全胜任**，把大模型留给最终答案生成。

## 九、面试作答逻辑与追问预案

### 9.1 答题总框架：五步递进

不要一上来就讲代码。**先讲问题，再讲方案，最后讲取舍** —— 面试官真正想听的是「你知道为什么这么做」。

```
① 定位问题：模型有记忆，检索没有        ← 建立共识
② 拆解现象：不只是代词，还有口语化/多意图  ← 体现你想得全
③ 给方案：五种策略 + 优先级排序          ← 有主次判断
④ 讲落地：归一化 → LLM 双输出 → 容错兜底  ← 有工程细节
⑤ 讲取舍：过度改写、误拆、成本、监控      ← 有踩坑经验
```

**关键心法**：每讲一个设计，都补一句「如果不这么做会怎样」。这是区分「背过」和「做过」的最强信号。

### 9.2 三种时长的版本

**30 秒版（自我介绍/项目概览时）**

> RAG 多轮对话有个断点：LLM 有会话记忆，但向量检索只拿到当前 query 字符串，「那它的保修期呢」里的「它」不携带语义，检索必然失败。我在 Ragent 里做了阶段 2 的查询改写：先用规则做术语归一化，再用一次 LLM 调用同时输出改写后的问题和拆分出的子问题，下游每个子问题并行做意图分类。整条链路有三层兜底，改写失败不影响问答。

**2 分钟版（标准回答，按 9.1 五步走）**

补上：五种策略是什么、哪两个必做（指代消解 + 上下文补全）、双输出为什么合并成一次调用（省一次 RTT、拆分判断本身需要理解改写后的语义）、四层 JSON 容错、三层兜底用归一化后的问题而非原始问题。

**5 分钟版（深挖时）**

再加：Cache-Aside 与长词优先排序、消息数组只取最近 2 轮的原因、`temperature=0.1` 与摘要任务的参数对比、Prompt 三分法（保留/删除/禁止）、示例 3 与 4 成对设计、`capTotalIntents` 封顶、三个监控指标。

### 9.3 必须踩到的得分点

| #   | 得分点        | 一句话表述                                           |
| --- | ---------- | ----------------------------------------------- |
| 1   | 问题定位准确     | 断点在**检索端**不在生成端                                 |
| 2   | 改写与拆分职责区分  | 改写解决**检索精度**，拆分解决**意图覆盖**                       |
| 3   | 策略有优先级     | 指代消解和上下文补全**必做**，拆分和关键词扩展**按需**                 |
| 4   | 规则与 LLM 分工 | 别名归一化用规则（零开销），语义改写用 LLM                         |
| 5   | 过度改写的危害    | **过度改写比不改写更危险**，凭空限定词把检索引向错误方向                  |
| 6   | 误拆的危害      | **宁可不拆也不要错拆**，对比型问题最容易误拆                        |
| 7   | 下游接口统一     | 不拆时 `subQuestions` 只有 1 个元素且与 rewrite 一致，下游无需特判 |
| 8   | 不信任 LLM 输出 | 四层 JSON 容错，Prompt 写了严格 JSON 也照样会包 Markdown      |
| 9   | 降级不中断      | 改写是增强项，三层兜底，最坏退化成原问题检索                          |
| 10  | 可观测性       | 改写会**默默出错**，必须监控改写率/过度改写率/检索提升率                 |

### 9.4 加分点（主动抛出，制造追问）

这些细节主动说出来，很容易把面试官引到你准备充分的方向：

- **长词优先排序**：「苹果 → Apple」和「苹果手机 → iPhone」并存时，短词先替换会造成截断
- **兜底用归一化后的问题**：LLM 挂了，规则的成果不能白费
- **参数对比**：改写 `temperature=0.1` vs 摘要 `temperature=0.3` —— 一个要一致性，一个要归纳灵活性
- **历史只取 2 轮**：不是省 Token，主要是**防噪音导致过度改写**
- **过滤 SYSTEM 消息**：history 里的摘要是给最终生成用的，对改写是噪音
- **缓存 key 含 sessionId**：同一句「价格呢」在不同上下文的改写结果完全不同
- **`capTotalIntents` 封顶**：子问题数 × 每个命中意图数 会让检索开销乘法爆炸

### 9.5 高频追问与应答

**A. 原理与边界**

| 追问                       | 应答要点                                                      |
| ------------------------ | --------------------------------------------------------- |
| 前文提到两个产品，「它」指哪个？         | 取**最近一次提到的实体**；真正歧义时不硬猜，靠阶段 4 歧义引导反问用户                    |
| 怎么判断一个 query 需不需要改写？     | 可用规则预判（含代词/长度短/有历史），但**更稳的是有历史就一律改写** —— 小模型很便宜，规则漏改的代价更高 |
| 改写后的 query 用来做什么？原问题还用吗？ | **检索用改写后的，生成 Prompt 里放原问题**（保险起见两个都放）。改写只为提升召回，不该改变用户的问题  |
| 为什么位置必须在记忆之后、检索之前？       | 改写**以历史为输入、以检索为输出**，位置由数据依赖决定                             |
| 关键词扩展为什么优先级低？            | 向量本身能理解同义词，收益主要在 BM25；**只有混合检索场景才明显**                     |

**B. 拆分相关**

| 追问 | 应答要点 |
|---|---|
| 拆分的判断标准到底是什么？ | 两问：**子问题能否独立回答**、**答案是否可能分布在不同 chunk**。「价格和颜色」通常同一 chunk 覆盖，不拆 |
| 误拆了怎么办？有没有兜底？ | Prompt 层面「不确定时不拆」；示例 3/4 成对教边界；理念是宁可不拆。运行时无法自动检测误拆，靠监控 + 人工抽检 |
| 拆分后成本翻倍怎么控制？ | `capTotalIntents` 封顶总意图数；子问题并行（墙钟时间不翻倍，只有 Token 翻倍）；多意图问题占比低时可关开关 |
| 拆出来的子问题结果怎么合并？ | 各自检索的结果汇总去重后一起进生成 Prompt；`rewrittenQuestion` 保留完整问题，保证生成时能看到用户完整意图 |
| 为什么改写和拆分合并成一次 LLM 调用？ | 省一次 RTT 和一份 Prompt Token；**拆分判断本身依赖对改写后语义的理解**，分两次调用会让第二次重复做一遍语义理解 |
| `should_split` 字段有什么用，不是冗余吗？ | 是**辅助决策字段** —— 让模型先显式表态再产出列表，比直接产列表更稳（类似轻量 CoT）。程序实际以 `sub_questions` 为准 |

**C. 工程实现**

| 追问 | 应答要点 |
|---|---|
| 术语映射为什么放 Redis 不放本地内存？ | 集群一致性。Cache-Aside：Admin 改完删缓存，所有实例下次加载自动一致，**无需重启** |
| 删缓存失败怎么办？会不会长期不一致？ | 可加 TTL 作为最终兜底；或用消息广播补偿。当前场景术语变更低频、容忍短暂不一致 |
| 为什么不用 Function Call / 结构化输出而是解析 JSON？ | 可以用，但要求模型和网关都支持；自己解析 + 四层容错的方案对模型无依赖，**能自由换 7B 小模型** |
| LLM 一直返回坏 JSON 怎么办？ | 解析失败即降级为归一化问题；同时监控解析失败率，持续偏高说明该换模型或调 Prompt/示例 |
| 三层接口用 `default` 方法的意义？ | 换纯规则改写器时只覆盖 `rewrite`，Pipeline 调最完整版本照样跑通 —— 面向扩展开放 |
| 改写增加多少延迟？用户能感知吗？ | 约 200~500ms。小模型 + 短输入短输出；相比检索错误导致的答非所问，这个延迟值得 |
| 怎么证明改写真的有效？ | 离线：构造多轮测试集，对比改写前后的召回命中率 / Recall@K。在线：埋点记录改写前后检索命中率，看提升率指标 |
| 单个子问题意图分类失败怎么办？ | 降级为**空意图**，不抛异常，不影响其他子问题；空意图走后续默认策略 |

**D. 容易被问倒的深水区（提前准备）**

| 追问 | 应答要点 |
|---|---|
| 改写引入了新的错误来源，整体是正收益吗？ | 承认这是权衡。多轮场景不改写几乎必错，收益远大于风险；单轮完整 query 场景收益小，所以 Prompt 里强调「已完整则原样输出」 |
| 会话记忆摘要压缩把型号丢了，改写就废了，怎么办？ | 这是**上游问题**：摘要 Prompt 要保留实体/专有名词；或单独维护一份「实体槽位」不参与压缩 |
| 用户上一轮说的产品是错的（比如口误），改写会放大错误吗？ | 会。改写忠实于历史，不做事实校验；错误应在歧义引导/最终生成阶段暴露 |
| 如果不用 LLM，纯规则能做到几成？ | 术语归一化和多问句拆分能做（已实现为兜底）；指代消解纯规则做不好，这是必须用 LLM 的部分 |
| 多轮改写会不会累积漂移？ | 每轮都从**原始 query + 历史**重新改写，不是在上一轮改写结果上继续改写，所以不累积 |

### 9.6 反向提问（体现思考深度）

面试尾声可问：

- 你们的检索是纯向量还是混合检索？（决定关键词扩展是否值得做）
- 多意图问题在你们业务里占比高吗？（决定拆分优先级）
- 改写效果目前是怎么评估的？有没有离线测试集？

## 十、相关页面

- [[编程/rag/RAG 综述（2024 经典论文）]] — RAG 三代范式与三维核心
- [[编程/rag/Agentic RAG 综述]] — 七大 Agentic RAG 架构
- [[知识库文档分块接口（startChunk）]] — 同项目的写入链路设计（CAS、事务消息、原子写）
- [[编程/ragent/RAG 评测初始化与新增文档流程]] — RAG 评测数据流（⚠️ 页面尚未创建）
- 来源：[[raw/编程笔记/ragent/问答链路/01 问题重写+拆分：用户说的话 ≠ 该搜的词]]
- 来源：[[raw/编程笔记/ragent/问答链路/02 查询重写与语义增强机制]]

