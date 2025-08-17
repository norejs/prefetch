# Prefetch Worker

一个支持消息初始化的 Service Worker，用于实现智能的 API 请求缓存和预请求功能。

## 特性

- 🔄 **请求去重**: 自动合并相同的并发请求
- 📦 **智能缓存**: 支持预请求和普通请求的统一缓存机制
- ⚡ **性能优化**: Promise 级别的请求复用
- 🎛️ **灵活配置**: 支持消息初始化和默认配置
- 🔧 **动态劫持**: fetch 事件监听器在脚本初始化时注册，通过函数变量实现动态处理
- 🐛 **调试友好**: 详细的日志输出

## 安装

```bash
npm install @norejs/prefetch-worker
```

## 复制 Service Worker 文件

```bash
# 复制到 public 目录
prefetch-worker install --dir public

# 或者复制到自定义目录
prefetch-worker install --dir assets
```

## 使用方法

### 1. 基本用法（使用 @norejs/prefetch）

```javascript
import { setup } from '@norejs/prefetch'

// 初始化 Service Worker
await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '/api',           // API 匹配规则，默认 '/api'
  defaultExpireTime: 30000,     // 默认过期时间 30 秒
  maxCacheSize: 100,            // 最大缓存数量
  debug: true                   // 开启调试模式
})
```

### 2. 手动初始化（发送消息）

```javascript
// 注册 Service Worker
const registration = await navigator.serviceWorker.register('/service-worker.js')

// 等待激活
await new Promise((resolve) => {
  if (navigator.serviceWorker.controller) {
    resolve()
  } else {
    navigator.serviceWorker.addEventListener('controllerchange', resolve)
  }
})

// 发送初始化消息
navigator.serviceWorker.controller.postMessage({
  type: 'PREFETCH_INIT',
  config: {
    apiMatcher: '/api/v1',        // 自定义 API 匹配规则
    defaultExpireTime: 60000,     // 60 秒过期时间
    maxCacheSize: 200,            // 最大缓存 200 个请求
    debug: false                  // 关闭调试模式
  }
})
```

### 3. 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `apiMatcher` | `string \| RegExp` | `'/api'` | API 请求匹配规则 |
| `defaultExpireTime` | `number` | `0` | 默认缓存过期时间（毫秒） |
| `maxCacheSize` | `number` | `100` | 最大缓存数量 |
| `debug` | `boolean` | `false` | 是否开启调试模式 |

## HTTP 方法支持

### 支持缓存的方法 ✅
- **GET**: 查询操作，适合缓存
- **POST**: 提交操作，支持请求去重
- **PATCH**: 更新操作，支持缓存

### 不支持缓存的方法 ❌
- **DELETE**: 删除操作，每次都真实执行

## 请求复用机制

Service Worker 会自动处理并发的相同请求：

```javascript
// 同时发起的相同请求会被合并
Promise.all([
  fetch('/api/users'),    // 发起真实请求
  fetch('/api/users'),    // 复用第一个请求的 Promise
  fetch('/api/users')     // 复用第一个请求的 Promise
])
```

## 预请求功能

配合 `@norejs/prefetch` 使用预请求功能：

```javascript
import { createPreRequest } from '@norejs/prefetch'

const preRequest = createPreRequest()

// 预请求数据
await preRequest('/api/products', {
  expireTime: 30000  // 30 秒过期时间
})

// 实际请求时会从缓存返回
const response = await fetch('/api/products')
```

## 调试

开启调试模式后，可以在浏览器控制台看到详细的日志：

```
prefetch-worker: received message {type: "PREFETCH_INIT", config: {...}}
prefetch-worker: initializing with config {apiMatcher: "/api", ...}
prefetch-worker: initialization completed
prefetch: cache hit (response) /api/products
prefetch: cache hit (promise) /api/users
```

## 自动初始化

如果没有收到初始化消息，Service Worker 会在 install 事件后 1 秒自动使用默认配置初始化：

```javascript
// 默认配置
{
  apiMatcher: '/api'
}
```

## 消息类型

### 发送给 Service Worker

```javascript
// 初始化消息
{
  type: 'PREFETCH_INIT',
  config: {
    apiMatcher: '/api',
    defaultExpireTime: 30000,
    maxCacheSize: 100,
    debug: true
  }
}
```

### 从 Service Worker 接收

```javascript
// 初始化成功
{
  type: 'PREFETCH_INIT_SUCCESS',
  config: { /* 实际使用的配置 */ }
}

// 初始化失败
{
  type: 'PREFETCH_INIT_ERROR',
  error: 'Error message'
}
```

## 技术实现

### 动态劫持机制

Service Worker 采用动态劫持的方式来解决 `fetch` 事件监听器必须在脚本初始评估阶段注册的限制：

```javascript
// 在脚本加载时就注册 fetch 事件监听器
self.addEventListener('fetch', function (event) {
    // 如果没有初始化或没有处理函数，直接返回（不拦截）
    if (!isInitialized || !handleFetchEventImpl) {
        return;
    }
    
    // 调用动态处理函数
    event.respondWith(handleFetchEventImpl(event));
});

// 初始化时设置处理函数
handleFetchEventImpl = setupWorker(config);
```

### 处理流程

1. **脚本加载**: 注册 `fetch` 事件监听器，但不执行任何处理逻辑
2. **收到初始化消息**: 调用 `setupWorker` 获取处理函数
3. **设置处理函数**: 将返回的函数赋值给 `handleFetchEventImpl`
4. **开始拦截**: 后续请求通过动态函数进行处理

这种设计确保了：
- 符合 Service Worker 规范要求
- 支持动态配置和初始化
- 避免了"Event handler must be added on initial evaluation"错误

## 注意事项

1. **首次加载**: Service Worker 首次安装时可能需要刷新页面才能拦截请求
2. **HTTPS**: Service Worker 只能在 HTTPS 或 localhost 下运行
3. **作用域**: Service Worker 只能拦截其作用域内的请求
4. **缓存策略**: DELETE 请求永远不会被缓存，确保数据一致性
5. **动态劫持**: fetch 监听器在脚本评估时注册，但处理逻辑通过函数变量动态设置

## 兼容性

- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+
