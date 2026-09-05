**ForkJoinPool** 是 Java 7 引入的一个特殊线程池（`ExecutorService` 的实现），专为**分治任务**（将大任务递归拆分成小任务并行执行）设计。它的核心精髓是 **“工作窃取”（Work-Stealing）**算法。

### 1. 核心机制：工作窃取
普通线程池所有线程共享一个任务队列，容易产生竞争。而 `ForkJoinPool` 为**每个工作线程**都维护一个独立的**双端队列（Deque）**：

- 线程执行自己队列中的任务时，采用 **LIFO（后进先出）** 策略（拿最新产生的子任务）。
- 当某个线程的队列空了，它会**随机“窃取”**其他线程队列**队尾**的任务来执行（采用 FIFO）。

这种机制能最大限度压榨 CPU，减少线程空闲等待时间。

### 2. 核心类与使用方法
要使用它，通常不直接操作 `ForkJoinPool` 的 API，而是继承其任务类：

- **`RecursiveTask<V>`**：有返回结果的任务（如求和、查找）。
- **`RecursiveAction`**：无返回结果的任务（如批量排序）。

**经典示例（计算 1 到 1 亿的和）**：
```java
class SumTask extends RecursiveTask<Long> {
    private final long[] array;
    private final int start, end;
    private static final int THRESHOLD = 10000; // 阈值

    // 构造方法省略...

    @Override
    protected Long compute() {
        if (end - start <= THRESHOLD) {
            // 足够小，直接计算
            long sum = 0;
            for (int i = start; i < end; i++) sum += array[i];
            return sum;
        } else {
            // 拆分成两个子任务
            int mid = (start + end) / 2;
            SumTask left = new SumTask(array, start, mid);
            SumTask right = new SumTask(array, mid, end);
            // fork() 异步执行， join() 获取结果
            left.fork();
            return right.compute() + left.join();
        }
    }
}

// 使用
ForkJoinPool pool = new ForkJoinPool(); // 默认并行度 = CPU核心数
Long result = pool.invoke(new SumTask(array, 0, array.length));
```

### 3. 现代 Java 中的应用（Java 8+）
你平时可能**早已在使用它**，而不自知：

- **并行流（Parallel Streams）**：`list.parallelStream().reduce(...)` 底层默认使用 `ForkJoinPool.commonPool()`。
- **CompletableFuture**：默认也使用 `ForkJoinPool.commonPool()` 作为执行器。

### 4. 重要注意事项（避坑指南）
- **计算密集型优先**：它最适合 CPU 密集型任务。如果任务涉及 IO 阻塞、锁等待或网络调用，工作窃取会失效（线程被阻塞无法窃取），建议使用自定义的普通线程池。
- **不要混用阻塞操作**：在 `compute()` 中尽量不要使用 `synchronized` 或 `Thread.sleep()`，否则会导致线程长时间被占用，影响整体吞吐量。
- **公共池风险**：`ForkJoinPool.commonPool()` 是整个 JVM 共享的，如果你的业务代码使用了并行流，而第三方库也用了，相互之间可能产生影响（任务积压）。线上环境建议根据业务创建独立的 `ForkJoinPool` 实例。
- **线程数**：默认并行度等于 `Runtime.getRuntime().availableProcessors()` - 1。可以通过 `-Djava.util.concurrent.ForkJoinPool.common.parallelism=N` 修改公共池大小（但需谨慎）。

**一句话总结**：`ForkJoinPool` 是 Java 并行计算的“涡轮增压器”，专为递归拆分的计算场景优化，通过工作窃取让多核 CPU 火力全开。对于普通业务开发，用 `parallelStream` 享受便利即可；对于核心计算框架，建议 `new ForkJoinPool()` 独立隔离。