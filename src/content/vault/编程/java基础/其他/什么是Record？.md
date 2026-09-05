Record是一种新型的类声明，它充当着“透明数据载体”的角色。其语法极其简洁：
public record User(String username, String email, int age) {}
就是这样一行代码！编译器会为我们自动生成：
• 所有字段的私有final字段。
• 一个全参构造器。
• 每个字段的公共getter方法（注意，方法名就是字段本身，如 user.username()）。
• 自动实现的 equals()、hashCode() 和 toString() 方法。
Record的优势与适用场景
1. 代码极简： 一行定义替代数十行样板代码，极大提高了开发效率和代码可读性。
2. 不可变性： Record的组件默认为 final，这使得Record实例天生就是不可变对象，这在并发编程中非常安全。
3. 意图明确： 当你使用Record时，你就是在向阅读代码的人明确宣告：“这是一个不可变的数据载体。”