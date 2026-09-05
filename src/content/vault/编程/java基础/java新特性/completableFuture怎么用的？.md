---
title: CompletableFuture 面试：回答逻辑与追问预案
tags:
  - Java
  - Java 8
  - 并发
  - CompletableFuture
  - Future
  - 异步
  - 面试
created: 2026-08-22
updated: 2026-08-22
---

# CompletableFuture 面试：回答逻辑与追问预案

> 一句话答题主线：`CompletableFuture` 是 Java 8 对 `Future` 的异步编排升级，核心价值在**把「阻塞等待结果」改成「回调驱动」**——既能异步执行、又能随任务完成自动回调，还能把多个异步任务串行/并行编排成 DAG，从而取代 guava `ListenableFuture` 那套回调地狱。

## 一、四步回答骨架

1. **定调**：`CompletableFuture` 是 Java 8 引入、对 `Future` 的异步增强版。
2. **讲痛点**：`Future` 取结果只能 `get()` 阻塞 或 `isDone()` 轮询，不能设回调；Java 8 前用 guava `ListenableFuture` 加回调，但层层嵌套回调又造成**回调地狱**。
3. **讲三大能力**：异步执行（`supplyAsync`）、完成回调（`thenAccept`/`whenComplete`/`exceptionally`）、任务编排（`thenApply`/`thenCompose`/`thenCombine`/`allOf`/`anyOf`）。
4. **讲底层**：同时实现 `Future` + `CompletionStage` 双接口，`CompletionStage` 正是支持链式组合编排的接口基础。

## 二、核心要点

### 1. 为什么需要它——Future 的三大硬伤

- **取值难**：只能 `get()` 阻塞等待，或 `isDone()` 轮询，主线程被"吊住"。
- **不能回调**：任务完成时没有通知机制，Java 8 前只能靠 guava `ListenableFuture` 补回调。
- **组合难**：多个异步任务有依赖关系时，回调层层嵌套 → 回调地狱。

### 2. 三种手段（对比 ListenableFuture vs CompletableFuture）

假设 step1、step2 并行，step3 依赖二者结果：

- **ListenableFuture（回调地狱）**：

```java
ListenableFuture<String> f1 = guavaExecutor.submit(() -> "step1 result");
ListenableFuture<String> f2 = guavaExecutor.submit(() -> "step2 result");
Futures.addCallback(Futures.allAsList(f1, f2), new FutureCallback<List<String>>() {
    @Override public void onSuccess(List<String> result) {
        guavaExecutor.submit(() -> "step3 result");   // 回调里再嵌回调
        Futures.addCallback(f3, new FutureCallback<String>() { /* 又一层 */ });
    }
    @Override public void onFailure(Throwable t) {}
}, guavaExecutor);
```

- **CompletableFuture（声明式编排）**：

```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> "step1 result");
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> "step2 result");
cf1.thenCombine(cf2, (r1, r2) -> r1 + " , " + r2)   // 并行合并
   .thenAccept(r3 -> System.out.println(r3));        // 串行消费
```

→ 显然 CompletableFuture 更简洁、可读更好。

### 3. 常用 API 速查

| 分类 | 方法 | 说明 |
| :--- | :--- | :--- |
| **异步执行** | `supplyAsync(Supplier)` | 提交有返回值任务 |
| | `runAsync(Runnable)` | 提交无返回值任务 |
| **获取结果** | `join()` | 阻塞取结果，异常包成 `CompletionException` |
| | `get()` | 阻塞取结果，异常抛 `ExecutionException`（受检） |
| **完成回调** | `thenAccept` | 消费结果（`Consumer`），无返回值 |
| | `thenApply` | 结果转换（`Function`），返回新 CF |
| | `thenRun` | 不关心结果，仅继续执行 |
| | `whenComplete` | 完成/异常都回调 |
| | `exceptionally` | 异常时提供兜底值 |
| | `handle` | 成功/异常统一处理返回新 CF |
| **串行编排** | `thenCompose` | 平铺嵌套 CF（返回 CF 的 thenApply） |
| **并行合并** | `thenCombine(biFn)` | 两个结果合并成一个 |
| | `allOf(...)` | 全部成功才继续，返回 `Void` |
| | `anyOf(...)` | 任一成功即继续 |
| **手动完成** | `complete(v)` / `completeExceptionally(ex)` | 外部主动给/给异常 |

### 4. 底层：实现双接口

- `Future`：表示异步计算的结果。
- `CompletionStage`：表示异步执行过程中的一个**步骤（Stage）**，可能由另一个 Stage 触发，当前 Stage 完成又会触发后续 Stage——这就是 `thenApply`/`thenCompose` 等函数式组合能链式编排的依据。

### 5. 大白话理解「回调地狱」

**回调地狱 = 代码里的"套娃行为"，一环扣一环，越缩进越深，深得没完没了。**

点外卖的类比：正常情况是"选餐→付款→等餐→吃饭"一步步往下走，很清晰。地狱模式是——做菜要先杀鱼、杀鱼要先捞鱼、捞鱼要先补网、补网先要找线……一步"前提"接一步"前提"。这种"做完这件事才能做下一件"的**前提**，在编程里就叫**回调**。

需求一多，代码就写成层层嵌套、向右缩进无限生长的"躺倒金字塔/圣诞树"：

```javascript
找到线(function(线) {
    补渔网(线, function(渔网) {
        捞鱼(渔网, function(鱼) {
            杀鱼(鱼, function(处理好的鱼) {
                做菜(处理好的鱼, function(菜) {
                    吃饭(菜, function(饱了) {
                        console.log("终于吃上了");
                    });
                });
            });
        });
    });
});
```

**说它"地狱"，三个最要命的地方：**

1. **可读性差**：代码横向无限生长，屏幕装不下，谁维护谁想骂人。
2. **牵一发动全身**：中途想加一步"腌鱼"，要扒开层层括号往最里面插，少写一个 `}` 整个程序就崩。
3. **错误处理稀碎**：每一层都要单独写"出错了怎么办"，第三层失败要一层层往外抛，像传话游戏，很难定位。

**怎么解决？** 后来的语言用 **Promise + async/await** 把嵌套"拍扁"成顺序——还是那件事，变成排队做操一样整齐，一眼看到底：

```javascript
async function 做饭流程() {
    let 线   = await 找到线();
    let 渔网 = await 补渔网(线);
    let 鱼   = await 捞鱼(渔网);
    let 处理好的鱼 = await 杀鱼(鱼);
    let 菜   = await 做菜(处理好的鱼);
    await 吃饭(菜);
    console.log("终于吃上了");
}
```

> **一句话**：回调地狱就是"层层嵌套、缩进永无止境"的代码；各家语言都在用新语法把它拍扁。**JavaScript 用的是 Promise/async-await，Java 用的正是 `CompletableFuture`**——`thenApply`/`thenCompose` 就是把这段"杀鱼流程"从嵌套回调拍平成的声明式链。

### 6. 大白话理解「DAG」

**DAG = 有向无环图（Directed Acyclic Graph）**，就是一张"只往一个方向走、没有回头路"的流程图。

- **节点（圆）**：一个异步步骤/任务。
- **有向边（箭头 A→B）**：A 完成后才触发 B（依赖关系）。
- **无环**：不存在 `A→B→C→A` 这种绕回原点的死循环依赖。

`CompletableFuture` 编排出来的一整套异步流程，就是一张 DAG：

- **串行**（`thenApply`/`thenCompose` 一个接一个）→ 图里就是**一条有向链** `A→B→C`。
- **并行并联**（`anyOf`/`allOf`）→ 图里就是**分叉、汇聚**：一个源分叉出发多个查询、结果再汇聚。
- 把串行 + 并联拼起来 → 一张完整的 **DAG**。

以查股价为例的 DAG（廖雪峰例子）：

```
查询代码(新浪源) ─┐                      ┌─ 查询价格(新浪源) ─┐
查询代码(163源) ──┴─[anyOf]→ ─→ [thenApply]→ ┴─[anyOf]→ 显示价格
```

> **面试怎么讲**：能靠 `thenApply`/`thenCompose`/`allOf`/`anyOf` 把多个异步步骤搭成一张 **DAG**（串行链 + 分叉汇聚）——这正是 `CompletableFuture` 相对 `Future` 最强大的地方；`Future` 只能描述"单个任务的结果"，而它描述的是"整张异步依赖图"。

## 三、易错点与最佳实践

1. **默认线程池别乱用**：不带池的 `supplyAsync` 用公共线程池 `ForkJoinPool.commonPool()`，一来可能因并行度不足拖慢大任务，二来主线程结束它可能被关——**生产应显式传自定义线程池**。
2. **回调线程别想当然**：`xxx()`（无 Async）通常在依赖它的那个 Stage 完成时在当前线程/触发线程执行；`xxxAsync()` 才保证进线程池。别把线程模型当黑盒。
3. **优先 `join()` 还是 `get()`**：`get()` 抛受检 `ExecutionException` 需 try-catch；`join()` 抛非受检 `CompletionException`，回调/组合场景更顺手。
4. **`thenCompose` 与 `thenApply` 别混**：转换结果本身就是 `CompletableFuture` 时，用 `thenCompose` 平铺，否则会得到"CF 套 CF"。
5. **失败要早兜底**：`exceptionally`/`handle` 给兜底，避免异常静默吞掉。
6. **别名/属性名注意**：`thenApplyAsync` 才算真正异步投递，串行示例里 `queryCode → fetchPrice` 才需要 `Async` 版避免阻塞提交线程。

## 四、可能被追问的点与预案

| 追问 | 应答案点 |
| :--- | :--- |
| **Future 与 CompletableFuture 区别？** | 取值方式（阻塞/轮询 vs 回调）、是否可编排（单任务 vs DAG）、回调替代回调地狱（对比 ListenableFuture） |
| **`get()` 和 `join()` 区别？** | 返回结果相同；异常不同：`get` 受检 `ExecutionException`（Java8，需显式处理），`join` 是非受检 `CompletionException`（组合回调用起来更顺）；`get` 支持超时重载 |
| **`thenApply` 和 `thenCompose` 区别？** | 返回值类型：`Function` 返回普通值 vs 返回 `CompletableFuture`；后者自动平铺避免嵌套（flatMap 思想） |
| **`runAsync` 和 `supplyAsync` 区别？** | 无返回值/有返回值；对应 `Runnable` vs `Supplier` |
| **`thenApply`/`thenAccept`/`thenRun` 区别？** | 都有入参结果 → 返回 CF / 只消费返回 CF（无新值）/ 连结果都不要仅继续，三者形参分别是 `Function`/`Consumer`/`Runnable` |
| **`exception` 传播与处理？** | 未处理的异常会向上传递并结束链；`exceptionally` 兜底、`handle` 统一兜底、`whenComplete` 只看副作用不改变结果 |
| **`thenCombine` 与 `thenCompose` 区别？** | 前者**并行**合并两个独立 CF 的结果；后者**串行**依赖（前一个结果当后一个输入） |
| **回调在哪条线程执行？** | 看是否 `Async`：无 `Async` 一般在依赖它的 Stage 完成线程上跑；`Async` 才提交线程池；别假定固定线程 |
| **`supplyAsync` 默认用什么线程池？** | `ForkJoinPool.commonPool()`（`ForkJoinPool.commonPool()`），可能因并行度受限；生产显式传自定义池更可控 |
| **`allOf` vs `anyOf`？** | 全部成功才继续（返回 `CompletableFuture<Void>`，结果要再 `.join()` 刷新） vs 任一成功即继续（返回 `CompletableFuture<Object>`） |
| **怎么拿到 `allOf` 的结果？** | `allOf` 返回 `Void`，若需各自结果，遍历 `future.join()` 收集 |
| **`CompletableFuture` 线程安全吗？** | 是线程安全的，内部用 CAS 衔接状态；但在"完成前"主动依赖其状态需注意，别对未完成的 CF 做非线程安全操作 |
| **实际项目用在哪？** | 异步批量调用/组装多个远程结果（`thenCombine`/`allOf`）、读多源取最快（`anyOf`）、配合 Spring `@Async` 提升吞吐、编排有依赖的多步异步流程 |
| **和 `synchronized`/锁的关系？** | 用途不同：锁是串行互斥；CF 是并发编排 + 回调，关注的是「等待与唤醒的编排」而非互斥 |
| **会阻塞主线程吗？** | 设好回调后主线程可继续做别的，不调用 `join/get` 就不阻塞——这正是优于 Future 的点 |

## 五、相关页面

- [[wiki/编程/java并发编程/多线程/使用 Future]] — Future 的基础用法与缺陷
- [[wiki/编程/java并发编程/多线程/使用 CompletableFuture]] — 从使用角度讲回调与串行/并行编排
- [[wiki/编程/java基础/java新特性/Java 8 你知道有什么新特性？]] — CompletableFuture 作为 Java 8 新特性的定位
- [[wiki/编程/java基础/java新特性/Lambda 表达式基础]] — supplier/consumer/function 的 lambda 写法