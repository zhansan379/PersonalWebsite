
HandlerMapping：
• 作用：HandlerMapping负责将请求映射到处理器（Controller）。
• 功能：根据请求的URL、请求参数等信息，找到处理请求的 Controller。
• 类型：Spring提供了多种HandlerMapping实现，如BeanNameUrlHandlerMapping、RequestMappingHandlerMapping等。
• 工作流程：根据请求信息确定要请求的处理器(Controller)。HandlerMapping可以根据URL、请求参数等规则确定对应的处理器。
HandlerAdapter：
• 作用：HandlerAdapter负责调用处理器(Controller)来处理请求。
• 功能：处理器(Controller)可能有不同的接口类型（Controller接口、HttpRequestHandler接口等），HandlerAdapter根据处理器的类型来选择合适的方法来调用处理器。
• 类型：Spring提供了多个HandlerAdapter实现，用于适配不同类型的处理器。
• 工作流程：根据处理器的接口类型，选择相应的HandlerAdapter来调用处理器。
工作流程：
1. 当客户端发送请求时，HandlerMapping根据请求信息找到对应的处理器(Controller)。
2. HandlerAdapter根据处理器的类型选择合适的方法来调用处理器。
3. 处理器执行相应的业务逻辑，生成ModelAndView。
4. HandlerAdapter将处理器的执行结果包装成ModelAndView。
5. 视图解析器根据ModelAndView找到对应的视图进行渲染。
6. 将渲染后的视图返回给客户端。
HandlerMapping和HandlerAdapter协同工作，通过将请求映射到处理器，并调用处理器来处理请求，实现了请求处理的流程。它们的灵活性使得在Spring MVC中可以支持多种处理器和处理方式，提高了框架的扩展性和适应性。