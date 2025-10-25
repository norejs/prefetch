# Prefetch Worker 使用示例

## 🚀 ESM 模板（推荐，无需构建）

### 使用 ESM 模板

使用 `service-worker.js` 模板，纯 ESM 导入，适用于现代浏览器：

```javascript
// 1. 复制 templates/service-worker.js 到你的项目根目录

// 2. 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
      
      // 发送配置消息
      if (registration.active) {
        registration.active.postMessage({
          type: 'PREFETCH_CONFIG',
          config: {
            enablePrefetch: true,
            cacheStrategy: 'cache-first',
            prefetchRules: [
              { pattern: /\/api\/.*\.json$/, priority: 'high' },
              { pattern: /\.(js|css)$/, priority: 'medium' }
            ]
          }
        });
      }
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
```

**ESM 模板特性：**
- 🚀 **纯 ESM 导入**，性能最佳
- 🌐 **调试模式控制**：DEBUG_MODE 决定使用本地还是 CDN
- 🛠️ **动态配置**：支持主进程实时配置
- 🔧 **可替换标识**：方便自定义配置
- 🎯 **简单易用**：复制即用，无需构建

### 零配置使用

```javascript
// 最简单的使用方式 - 复制文件即可
// service-worker.js 会自动：
// 1. 使用 ESM 导入 prefetch-worker
// 2. 选择合适的资源路径（本地/CDN）
// 3. 等待主进程配置

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

### 自定义配置

```javascript
// 注册后发送配置
navigator.serviceWorker.register('/service-worker.js')
  .then(registration => {
    // 等待 Service Worker 激活
    navigator.serviceWorker.ready.then(() => {
      registration.active.postMessage({
        type: 'PREFETCH_CONFIG',
        config: {
          enablePrefetch: true,
          cacheStrategy: 'network-first',
          prefetchRules: [
            { pattern: /\/api\/users\/.*/, priority: 'high' },
            { pattern: /\/api\/posts\/.*/, priority: 'medium' },
            { pattern: /\.(jpg|png|webp)$/, priority: 'low' }
          ]
        }
      });
    });
  });
```

## 🎯 智能初始化 `initializePrefetchWorker`（需要构建）

`initializePrefetchWorker` 方法会根据是否传入配置来智能决定初始化方式：

### 方式1：立即初始化（传入配置）

```javascript
// Service Worker 文件
import { initializePrefetchWorker } from '/dist/prefetch-worker.esm.js';

// 传入配置 -> 立即初始化，不等待主进程
initializePrefetchWorker({
  apiMatcher: '/api/v1/*',
  debug: true,
  defaultExpireTime: 10 * 60 * 1000,
  maxCacheSize: 50
});

console.log('预请求功能已启用');
```

### 方式2：等待主进程初始化（不传配置）

```javascript
// Service Worker 文件
import { initializePrefetchWorker } from '/dist/prefetch-worker.esm.js';

// 不传配置 -> 等待主进程发送配置消息
initializePrefetchWorker();

console.log('等待主进程配置...');
```

```javascript
// 主进程文件
import { setupPrefetchWorker } from '@norejs/prefetch';

// 发送配置到 Service Worker
await setupPrefetchWorker({
  apiMatcher: '/api/*',
  debug: process.env.NODE_ENV === 'development',
  defaultExpireTime: 5 * 60 * 1000
});

console.log('预请求功能已配置');
```

## 🔧 模块化组合使用

### 最小集成（只添加预请求功能）

```javascript
// 适用于已有 Service Worker，只想添加预请求功能
import { createFetchHandler } from '/dist/prefetch-worker.esm.js';

const handler = createFetchHandler({
  apiMatcher: '/api/*',
  defaultExpireTime: 5 * 60 * 1000
});

self.addEventListener('fetch', handler);
```

### 完全自定义组合

```javascript
import { 
  setupLifecycle, 
  setupMessageListener, 
  createFetchHandler 
} from '/dist/prefetch-worker.esm.js';

// 1. 自定义生命周期管理
const cleanupLifecycle = setupLifecycle({
  autoSkipWaiting: false, // 不自动跳过等待
  autoClaimClients: true,
  onInstall: async (event) => {
    // 自定义安装逻辑
    console.log('自定义安装逻辑');
    await caches.open('my-custom-cache');
  },
  onActivate: async (event) => {
    // 自定义激活逻辑
    console.log('自定义激活逻辑');
  }
});

// 2. 设置消息监听（等待主进程配置）
const cleanupMessageListener = setupMessageListener();

// 3. 或者直接创建 fetch 处理器
// const handler = createFetchHandler({ apiMatcher: '/api/*' });
// self.addEventListener('fetch', handler);

// 组合清理函数
const cleanup = () => {
  cleanupMessageListener();
  cleanupLifecycle();
};
```

### 混合模式（生命周期 + 立即初始化）

```javascript
import { setupLifecycle, initializePrefetchWorker } from '/dist/prefetch-worker.esm.js';

// 管理 Service Worker 生命周期
const cleanupLifecycle = setupLifecycle({
  autoSkipWaiting: true,
  autoClaimClients: true
});

// 立即启用预请求功能
const cleanupPrefetch = initializePrefetchWorker({
  apiMatcher: '/api/*',
  debug: true
});

// 组合清理
const cleanup = () => {
  cleanupPrefetch();
  cleanupLifecycle();
};
```

## 🚀 常用组合模式

### 完整托管模式

```javascript
import { setupLifecycle, initializePrefetchWorker } from '/dist/prefetch-worker.esm.js';

// 生命周期管理 + 等待主进程配置
// 适用于完全由 prefetch-worker 管理的 Service Worker
setupLifecycle({ autoSkipWaiting: true, autoClaimClients: true });
initializePrefetchWorker(); // 等待主进程配置
```

### 托管但静态配置

```javascript
import { setupLifecycle, initializePrefetchWorker } from '/dist/prefetch-worker.esm.js';

// 生命周期管理 + 立即初始化
// 适用于需要 SW 管理但配置固定的场景
setupLifecycle({ autoSkipWaiting: true, autoClaimClients: true });
initializePrefetchWorker({
  apiMatcher: '/api/v1/*',
  debug: false,
  defaultExpireTime: 10 * 60 * 1000
});
```

### 最小集成

```javascript
import { initializePrefetchWorker } from '/dist/prefetch-worker.esm.js';

// 仅添加预请求功能，不管理生命周期
// 适用于现有 Service Worker 添加预请求功能
initializePrefetchWorker({
  apiMatcher: '/api/*'
});
```

## 📋 使用场景对比

| 场景 | 推荐方法 | 特点 |
|------|----------|------|
| 新项目，无 SW | `setupLifecycle() + initializePrefetchWorker()` | 完全托管 |
| 新项目，静态配置 | `setupLifecycle() + initializePrefetchWorker(config)` | 托管 + 静态配置 |
| 现有 SW，添加预请求 | `initializePrefetchWorker(config)` | 立即启用 |
| 现有 SW，主进程控制 | `initializePrefetchWorker()` | 等待主进程 |
| 现有 SW，最小改动 | `createFetchHandler(config)` | 只添加处理器 |
| 完全自定义 | 模块化组合 | 最大灵活性 |

## 🎨 importScripts 使用方式

```javascript
// Service Worker 文件
importScripts('/dist/prefetch-worker.umd.js');

// 方式1：立即初始化
PrefetchWorker.initializePrefetchWorker({
  apiMatcher: '/api/*',
  debug: true
});

// 方式2：等待主进程
PrefetchWorker.initializePrefetchWorker();

// 方式3：完整托管
PrefetchWorker.setupLifecycle({ autoSkipWaiting: true, autoClaimClients: true });
PrefetchWorker.initializePrefetchWorker();

// 方式4：模块化组合
PrefetchWorker.setupLifecycle({ autoSkipWaiting: true });
PrefetchWorker.setupMessageListener();
```