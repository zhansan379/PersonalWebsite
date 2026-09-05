我常用的 String 常用方法有这些：
• 获取长度：int length()：返回字符串的长度（字符个数）。例："abc".length() → 3
• 判断内容：boolean equals(Object obj)：比较两个字符串的内容是否完全相同（区分大小写）。例："abc".equals("ABC") → false
• 截取子串：String substring(int beginIndex)：从指定索引开始截取到末尾。例："hello".substring(2) → "llo"
• 去除空格：String trim()：去除字符串首尾的空白字符（空格、制表符等）。例：" abc ".trim()→ "abc"
• 替换内容：String replace(char oldChar, char newChar)：替换所有指定字符。例："aaa".replace('a', 'b') → "bbb"
• 判断空字符串：boolean isEmpty()：判断字符串长度是否为 0（注意：null 调用会报错，需先判空）。