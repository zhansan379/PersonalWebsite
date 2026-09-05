注解本质是一个继承了Annotation的特殊接口，其具体实现类是Java运行时生成的动态代理类。
我们通过反射获取注解时，返回的是Java运行时生成的动态代理对象。

```
@MyAnno(name = "zhangsan", age = 22)
public class Demo {
    public static void main(String[] args) {
        //反射获取注解，拿到的不是我们写的类，是动态代理对象
        MyAnno anno = Demo.class.getAnnotation(MyAnno.class);
        System.out.println(anno);
        System.out.println(anno.getClass());
        System.out.println(anno.name());
        System.out.println(anno.age());
    }
}
```

```
@MyAnno(age=22, name=zhangsan)
class com.sun.proxy.$Proxy1  //重点！！动态代理生成的代理类 $Proxy
zhangsan
22
```

> com.sun.proxy.$Proxy1 就是 JDK 运行时动态生成，实现了 MyAnno 接口的代理类。

通过代理对象调用自定义注解的方法（比如上面调用 anno.name()），会最终调用AnnotationInvocationHandler的invoke方法。该方法会从memberValues这个Map中索引出对应的值。而memberValues的来源是Java常量池。