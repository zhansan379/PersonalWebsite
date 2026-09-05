• "有序" 的 Set 有 TreeSet 和 LinkedHashSet，但两者"有序"的含义并不一样：
◦ TreeSet 基于红黑树实现，元素按"自然顺序（natural ordering，即 Comparable.compareTo() 定义的顺序）"或自定义 Comparator 排序存储，属于"按值排序"。
◦ LinkedHashSet 基于哈希表 + 双向链表实现，链表记录了元素的插入顺序，遍历时按插入顺序输出，属于"保留插入顺序"（注意：这不是"自然顺序"，和元素值的大小无关）。
• 记录插入顺序的集合通常指的是 LinkedHashSet，它既保证元素唯一，又能按插入顺序遍历，当你需要"去重 + 保留添加顺序"时它是首选。