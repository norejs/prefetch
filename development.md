- apps demo
- packages
-- prefetch 对外暴露接口，用于发起预请求
-- prefetch-worker 运行在serviceWorker 中的代码
-- swiftcom 用于主进程和serviceWorker之间的通信

# serviceWorker API
## setup
如何将serviceWorker 集成到项目中
MSW，提供CLI，将serviceWorker 脚本拷贝到项目中

## 如何提供个性化的serviceWorker
### 编译时提供个性化的serviceWorker
1. 编写代码，然后通过编译工具，将代码编译成serviceWorker
### 运行时提供个性化的serviceWorker

1. node项目,next,remix,express
提供中间件，可以直接使用,

