# @norejs/prefetch-worker

一个现代化的 Service Worker 库，支持智能的 API 请求缓存和预请求功能。使用 Rollup 构建，支持 ESM、UMD 和 IIFE 多种格式。

## ✨ 特性

- 🔄 **请求去重**: 自动合并相同的并发请求
- 📦 **智能缓存**: 支持预请求和普通请求的统一缓存机制
- ⚡ **性能优化**: Promise 级别的请求复用
- 🎛️ **灵活配置**: 支持消息初始化和默认配置
- 🔧 **动态劫持**: fetch 事件监听器在脚本初始化时注册，通过函数变量实现动态处理
- 🐛 **调试友好**: 详细的日志输出
- 📦 **多格式支持**: ESM、UMD、IIFE 三种构建格式
- 🔥 **热重载**: 开发模式下支持热重载
- 🛠️ **TypeScript**: 完整的 TypeScript 支持

## 📦 安装

```bash
npm install @norejs/prefetch-worker
```

## 🏗️ 构建格式

### ESM (推荐用于现代浏览器)
```javascript
// 支持 ES Module 的现代浏览器
navigator.serviceWorker.register('/service-worker.esm.js', { 
  type: 'module' 
});
```

### UMD (用于 importScripts)
```javascript
// 在 Service Worker 中使用 importScripts
importScripts('/prefetch-worker.umd.js');
const handler = PrefetchWorker.setup(config);
```

### IIFE (独立文件)
```javascript
// 直接注册独立的 Service Worker 文件
navigator.serviceWorker.register('/service-worker.js');
```

## 🚀 使用方法

### 1. 基本用法（使用 @norejs/prefetch）

```javascript
import { setup } from '@norejs/prefetch';

// 初始化 Service Worker
await setup({
  serviceWorkerUrl: '/service-worker.esm.js',
  scope: '/',
  apiMatcher: '/api/*',
  defaultExpireTime: 30000,
  maxCacheSize: 100,
  debug: true
});
```

### 2. 直接使用 Service Worker

#### ESM 格式
```javascript
// sw.js (ES Module)
import { setupWorker } from '@norejs/prefetch-worker/esm';

const handler = setupWorker({
  apiMatcher: /\/api\/.*/,
  defaultExpireTime: 30000,
  debug: true
});

self.addEventListener('fetch', handler);
```

#### UMD 格式
```javascript
// sw.js (传统方式)
importScripts('/prefetch-worker.umd.js');

const handler = PrefetchWorker.setup({
  apiMatcher: '/api/*',
  defaultExpireTime: 30000,
  debug: true
});

self.addEventListener('fetch', handler);
```

## ⚙️ 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `apiMatcher` | `string \| RegExp` | `'/api/*'` | API 匹配规则 |
| `requestToKey` | `function` | 内置函数 | 请求转换为缓存键的函数 |
| `defaultExpireTime` | `number` | `0` | 默认过期时间（毫秒），0 表示不缓存 |
| `maxCacheSize` | `number` | `100` | 最大缓存数量 |
| `debug` | `boolean` | `false` | 是否开启调试模式 |
| `allowCrossOrigin` | `boolean` | `false` | 是否允许跨域请求 |
| `autoSkipWaiting` | `boolean` | `true` | 是否自动跳过等待 |

## 🔧 开发

### 构建命令

```bash
# 开发构建
npm run build:dev

# 生产构建
npm run build:prod

# 监听模式构建
npm run build:watch

# 清理构建文件
npm run clean
```

### 开发服务器

```bash
# 启动开发服务器
npm run dev

# 启动开发服务器 + 监听构建
npm run dev:watch

# 仅启动服务器（需要先构建）
npm run dev:server
```

开发服务器特性：
- 🌐 **端口**: 18003
- 🔥 **热重载**: 文件变化自动重新构建
- 📡 **WebSocket**: 实时通知客户端更新
- 🔍 **健康检查**: `/health` 端点
- 📋 **文件列表**: `/files` 端点
- 🔨 **手动构建**: `POST /build` 端点

### 热重载客户端

在开发模式下，可以在主页面中包含热重载客户端：

```html
<!-- 仅在开发模式下包含 -->
<script src="/hot-reload-client.js"></script>
```

或者手动使用：

```javascript
import { ServiceWorkerHotReload } from '@norejs/prefetch-worker/hot-reload';

const hotReload = new ServiceWorkerHotReload({
  serverUrl: 'ws://localhost:18003',
  debug: true
});

hotReload.connect();
```

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix
```

## 📁 项目结构

```
packages/prefetch-worker/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── setup.ts              # 设置函数
│   ├── dev-server.ts         # 开发服务器
│   ├── hot-reload-client.ts  # 热重载客户端
│   ├── types.ts              # 类型定义
│   └── utils/
│       ├── logger.ts         # 日志工具
│       └── requestToKey.ts   # 请求键生成
├── dist/
│   ├── service-worker.esm.js # ESM 格式
│   ├── prefetch-worker.umd.js# UMD 格式
│   ├── service-worker.js     # IIFE 格式
│   ├── dev-server.js         # 开发服务器
│   └── types/                # TypeScript 声明文件
├── rollup.config.js          # Rollup 配置
├── tsconfig.json             # TypeScript 配置
├── .eslintrc.js              # ESLint 配置
└── package.json              # 包配置
```

## 🔄 HTTP 方法支持

### 支持缓存的方法 ✅
- **GET**: 查询操作，适合缓存
- **POST**: 提交操作，支持请求去重
- **PATCH**: 更新操作，支持缓存

### 不支持缓存的方法 ❌
- **DELETE**: 删除操作，每次都真实执行

## 🔀 请求复用机制

Service Worker 会自动处理并发的相同请求：

```javascript
// 同时发起的相同请求会被合并
Promise.all([
  fetch('/api/users'),    // 发起真实请求
  fetch('/api/users'),    // 复用第一个请求的 Promise
  fetch('/api/users')     // 复用第一个请求的 Promise
]);
```

## 🎯 预请求功能

配合 `@norejs/prefetch` 使用预请求功能：

```javascript
import { preFetch } from '@norejs/prefetch';

// 直接预请求数据
await preFetch('/api/products', {
  expireTime: 30000  // 30 秒过期时间
});

// 实际请求时会从缓存返回
const response = await fetch('/api/products');
```

## 🐛 调试

开启调试模式后，可以在浏览器控制台看到详细的日志：

```
[2024-01-01T12:00:00.000Z] [prefetch-worker] received message {type: "PREFETCH_INIT", config: {...}}
[2024-01-01T12:00:00.001Z] [prefetch-worker] initializing with config {apiMatcher: "/api", ...}
[2024-01-01T12:00:00.002Z] [prefetch-worker] initialization completed
[2024-01-01T12:00:01.000Z] [prefetch-worker] cache hit (response) /api/products
[2024-01-01T12:00:01.001Z] [prefetch-worker] cache hit (promise) /api/users
```

## 🔧 技术实现

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

### 构建系统

使用 Rollup 构建系统，相比 Rsbuild 的优势：

- ✅ **专为库设计**: 更适合构建 Service Worker
- ✅ **多格式支持**: 原生支持 ESM、UMD、IIFE
- ✅ **更小体积**: 生成的代码更紧凑
- ✅ **更好的 Tree Shaking**: 更精确的依赖分析
- ✅ **Service Worker 优化**: 专门的 Service Worker 构建优化

## ⚠️ 注意事项

1. **首次加载**: Service Worker 首次安装时可能需要刷新页面才能拦截请求
2. **HTTPS**: Service Worker 只能在 HTTPS 或 localhost 下运行
3. **作用域**: Service Worker 只能拦截其作用域内的请求
4. **缓存策略**: DELETE 请求永远不会被缓存，确保数据一致性
5. **动态劫持**: fetch 监听器在脚本评估时注册，但处理逻辑通过函数变量动态设置

## 🌐 兼容性

- Chrome 91+ (ESM 支持)
- Firefox 89+ (ESM 支持)
- Safari 15+ (ESM 支持)
- Edge 91+ (ESM 支持)
- 所有支持 Service Worker 的浏览器 (UMD/IIFE 格式)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关链接

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Rollup](https://rollupjs.org/)
- [@norejs/prefetch](../prefetch/README.md)