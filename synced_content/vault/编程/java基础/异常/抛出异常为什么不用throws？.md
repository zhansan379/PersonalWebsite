---
title: 抛出异常为什么不用 throws？
tags:
  - Java
  - 异常
  - throws
  - try-catch
  - 异常处理
created: 2026-08-22
updated: 2026-08-22
---

# 抛出异常为什么不用 throws？

> 核心一句话：**能决定怎么处理 → try-catch；不能决定 / 不该这层处理 / 吞了反而错 → throws。** 当异常是未检查异常（`RuntimeException`/`Error`）或已在方法内部捕获处理时，就不需要在方法签名上用 `throws` 声明。

## 一、什么时候不需要 throws

如果异常是**未检查异常**或在方法内部**被捕获和处理**了，就不需要 `throws`。

### 1. 未检查异常（Unchecked Exceptions）

继承自 `RuntimeException` 或 `Error` 的异常，编译器**不强制**要求异常处理，因此无需在方法签名中用 `throws` 声明。

示例：`NullPointerException`、`ArrayIndexOutOfBoundsException`。

### 2. 方法内部已捕获处理

另一种情况：在方法内部捕获了可能抛出的异常并处理掉，而不是通过 `throws` 传递到调用者。此时方法能处理异常，无需在签名中声明 `throws`。

## 二、决策路径（核心）

```
        这个异常，当前这层/方法能否决定怎么处理？
        ┌─────────────────────────────┴─────────────────────────┐
      【不能决定】                                              【能决定】
 无法决定后续怎么办、不该在这层处理、      │           知道失败后该怎么办
 或处理会干扰正常流程/返回值             │     处理方式是什么？
        │                     ┌────────┼─────────┬──────────┐
  用 throws 上抛          【转换/包装】【消化/降级】【清理/兜底】
  给调用方                转成业务异常  吞掉或返回  落到 finally
                           (ServiceException) 降级值(null) 清理资源
```

## 三、用 throws —— 把处理责任让给调用方

| 触发条件 | 项目真实例子 |
|---------|------------|
| **纯工具方法，无业务语义**，读失败不知道怎样处理 | `MinerUResultUnpacker.readAll(...) throws IOException` —— 只是"读字节" |
| **接口抽象**，不同实现异常类型不统一，接口只约定"可能失败" | `ModelCaller.call(C client, ModelTarget target) throws Exception` —— `@FunctionalInterface` |
| **边界层（Controller）整体上抛**，统一由全局异常处理器兜底 | `KnowledgeDocumentController.file(...) throws Exception` |
| **被迫声明**（框架签名规定抛 Throwable，吞了反而吞掉被代理方法的异常） | `IdempotentConsumeAspect.idempotentConsume(...) throws Throwable` —— `ProceedingJoinPoint.proceed()` |

> 核心信号：**"我处理不了 / 不该我处理 / 吞了反而错" → throws**

## 四、用 try-catch —— 这一层能决定结果

| 触发条件 | 项目真实例子 |
|---------|------------|
| **把底层异常翻译成统一业务异常**，对外暴露统一错误码 | `unpackZip`: `catch (IOException e) { throw new ServiceException("MinerU zip 解压失败: ..."); }` |
| **可容忍的小失败**，失败返回 null/降级值即可 | `HttpClientHelper.parseContentLength`: `catch (NumberFormatException ignore) { return null; }` |
| **需要"写日志 + 转换"两步**才能满足层内约定 | `ExcelDocumentParser.parse`: `catch (Exception e) { log.error(...); throw new ServiceException(...); }` |
| **finally 里清理资源**，清理失败不能覆盖主流程结果 | `RemoteFileFetcher.uploadViaTemp`: `finally { try deleteIfExists catch log.warn }` |

> 核心信号：**"我知道失败后该怎么办" → try-catch 就地处理**

## 五、同类操作的对照（最能体现选择逻辑）

**对照 1：MinerUResultUnpacker**
- 用 `throws`：`readAll(...) throws IOException` —— 工具方法，传播受检异常
- 用 try-catch：`unpackZip` 里 `catch (IOException) -> throw ServiceException` —— 业务边界，统一包装

**对照 2：HttpClientHelper（同一个文件）**
- 用 `throws`：`readWithLimit(...) throws IOException` —— 主数据读取，失败必须传播
- 用 try-catch：`parseContentLength` `catch (NumberFormatException) { return null; }` —— 容错头字段，失败就地消化

> 结论：**能否决定处理 / 是否可容忍失败** 决定了选哪种。

## 六、throw 业务异常之后的完整处理链路

项目中业务代码 `throw new ServiceException(...)` 后自己**不接**，异常沿方法栈一路向上：

```
业务代码 throw new ServiceException(...)
   │  （沿调用栈上抛，当前层不 catch）
Controller 方法（声明 throws Exception，继续上抛）
   │  ▼ 到达 Spring MVC 边界，被捕获
GlobalExceptionHandler（@RestControllerAdvice + @ExceptionHandler(AbstractException.class)）
   ├── 记录日志 log.error
   ├── Results.failure(ex)  ← 读取 ServiceException 的 errorCode / errorMessage
   ▼
返回统一 JSON：{ code: errorCode, message: errorMessage, data: null }
```

**关键点：**

- **谁兜底**：`GlobalExceptionHandler`。`@RestControllerAdvice` + `@ExceptionHandler(value = AbstractException.class)` 精确命中所有继承 `AbstractException` 的异常（`ServiceException` / `ClientException` / `RemoteException`）。异常在这里统一收口，前端看到的是业务错误的 JSON 而非原始堆栈。
- **日志两级**：有 `getCause()` 时连根因一起打；无 cause 时**截取前 5 栈帧**拼进日志，避免整个堆栈刷屏。
- **`Results.failure(ex)`**：从异常对象取 `getErrorCode()` / `getErrorMessage()` 塞进响应体 `code` / `message` —— 业务错误码最终原样透传给前端。

### 兜底层级（信号由强到弱）

| 异常类型 | 命中方法 | 响应 |
|---------|---------|------|
| `ServiceException` / `ClientException` / `RemoteException` | `abstractException` | 带业务 code |
| `NotLoginException` | `notLoginException` | "未登录或登录已过期" |
| `NotRoleException` | `notRoleException` | "权限不足" |
| `MaxUploadSizeExceededException` | `maxUploadSizeExceededException` | 大小超限提示 |
| 其他所有未捕获 | `defaultErrorHandler`（`@ExceptionHandler(Throwable.class)`） | 通用兜底 |

## 七、项目自定义异常体系（catch 后的"翻译目标"）

```
java.lang.RuntimeException
        ↑
AbstractException  (framework .../exception/AbstractException.java)
  ├── 统一持有 errorCode / errorMessage
  ├── ServiceException   —— 业务异常（最常用）
  ├── ClientException   —— 客户端错误
  └── RemoteException   —— 远程调用异常
```

其他：
- `infra-ai .../http/ModelClientException` —— extends RuntimeException，带 errorType + statusCode
- `bootstrap .../rag/config/validation/RetrievalConfigException` —— extends RuntimeException，配置校验用

**项目惯例**：上层 try-catch 的典型目的就是把底层异常"翻译/包装"成这几个业务异常，保持对外错误模型一致。

## 八、最佳实践小结

1. **能用 throws 就 throws**：受检异常（如 `IOException`）在无业务语义的方法里直接上抛，到业务边界统一处理。
2. **try-catch 一定做点什么**：要么转换（throw ServiceException）、要么降级（return null）、要么清理（finally），否则空 catch 吞异常是坏味道。
3. **try-with-resources 管资源**：让流/连接一定被关闭，异常再统一外抛或转换。
4. **业务边界统一收口**：所有业务异常继承 `AbstractException`，配合 `GlobalExceptionHandler` + `Result<T>` 统一响应结构，前端只按 `code` 判断。
5. **Controller 不重复 catch**：整体 `throws Exception` 交给全局异常通知兜底。

## 九、相关页面

- [[Java异常处理有哪些？]] — try-catch / throw / throws / finally 四种手段
- [[介绍一下Java异常]] — 异常体系与受检/非受检分类