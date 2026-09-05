
• set集合特点：Set集合中的元素是唯一的，不会出现重复的元素。
• set实现原理：Set 集合通过内部的数据结构来实现元素的无重复，不同实现去重方式不同：
◦ HashSet / LinkedHashSet：底层是哈希表，插入元素时先用 hashCode() 定位桶，再用 equals()比较是否已存在相同元素，存在则不再插入；
◦ TreeSet：底层是红黑树，插入元素时不调用 hashCode/equals，而是用 Comparable.compareTo()（自然排序）或自定义 Comparator.compare() 的返回值是否为 0 来判断是否重复。


