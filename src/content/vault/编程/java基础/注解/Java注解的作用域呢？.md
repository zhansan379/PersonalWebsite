

注解的作用域（Scope）指的是注解可以应用在哪些程序元素上，由元注解 @Target 配合 ElementType枚举来指定。在 Java 21 中，ElementType 共有 12 种取值：
1. TYPE：类、接口、枚举、注解类型
2. FIELD：字段（包括枚举常量）
3. METHOD：方法
4. PARAMETER：方法或构造器的参数
5. CONSTRUCTOR：构造方法
6. LOCAL_VARIABLE：局部变量
7. ANNOTATION_TYPE：注解类型本身（即元注解）
8. PACKAGE：包（写在 package-info.java 中）
9. TYPE_PARAMETER：类型参数声明（Java 8 新增，用于泛型形参上）
10. TYPE_USE：任何使用类型的地方（Java 8 新增，常用于配合 Checker Framework 做类型检查）
11. MODULE：模块（Java 9 模块系统引入）
12. RECORD_COMPONENT：记录类组件（Java 16 引入 record 时新增）
其中最常用的是 TYPE、FIELD、METHOD、PARAMETER 这几种。如果定义注解时不显式指定 @Target，那么该注解默认可以用于上述除 TYPE_PARAMETER 和 TYPE_USE 之外的所有位置。