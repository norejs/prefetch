# Prefetch Worker 集成指南

## 概述

Prefetch Worker 现在支持通过 `importScripts` 从 esm.sh CDN 加载，无需完全替换现有的 Service Worker。

## 快速开始

### 方式一：创建新的 Service Worker

如果你的项目还没有 Service Worker：

```bash
# 使用交互式工具
npx @norejs/prefetch integrate --interactive

# 或直接创建
npx @norejs/prefetch integrate --create --output public/service-worker.js
```

### 方式二：集成到现有 Service Worker

如果你已经有 Service Worker：

```bash
# 集成到现有文件
npx @norejs/prefetch integrate \
  --input public/service-worker.js \
  --output public/service-worker-integrated.js
```

### 方式三：手动集成

在你现有的 Service Worker 文件末尾添加：

```javascript
// 你现有的 Service Worker 代码
self.addEventListener('install', (event) => {
  // 现有安装逻辑
});

self.addEventListener('activate', (event) => {
  // 现有激活逻辑
});

// ============================================
// 添加 Prefetch Worker 集成
// ============================================

(function() {
  'use strict';
  
  // 从 esm.sh 加载 Prefetch Worker
  const CDN_URL = 'https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js';
  
  let prefetchHandler = null;
  
  // 加载脚本
  try {
    importScripts(CDN_URL);
    console.log('[Prefetch] Loaded from esm.sh');
  } catch (error) {
    console.error('[Prefetch] Failed to load:', error);
  }
  
  // 监听初始化消息
  self.addEventListener('message', (event) => {
    if (event.data?.type === 'PREFETCH_INIT' && self.PrefetchWorker) {
      prefetchHandler = self.PrefetchWorker.setup({
        apiMatcher: '/api/*',
        defaultExpireTime: 30000,
        maxCacheSize: 100,
        debug: false,
        ...event.data.config
      });
      
      console.log('[Prefetch] Initialized');
    }
  });
  
  // Fetch 处理
  self.addEventListener('fetch', (event) => {
    if (prefetchHandler) {
      const response = prefetchHandler(event);
      if (response) {
        return event.respondWith(response);
      }
    }
    // 你现有的 fetch 处理逻辑
  });
  
})();
```

## 客户端初始化

在你的应用中初始化 Prefetch：

```javascript
import { setup, preFetch } from '@norejs/prefetch';

// 注册 Service Worker 并初始化 Prefetch
async function initializePrefetch() {
  try {
    // 注册 Service Worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    
    // 等待 Service Worker 激活
    await navigator.serviceWorker.ready;
    
    // 发送初始化消息
    navigator.serviceWorker.controller?.postMessage({
      type: 'PREFETCH_INIT',
      config: {
        apiMatcher: '/api/*',
        defaultExpireTime: 30000,
        maxCacheSize: 100,
        debug: process.env.NODE_ENV === 'development'
      }
    });
    
    console.log('Prefetch initialized');
    
  } catch (error) {
    console.error('Prefetch initialization failed:', error);
  }
}

// 在应用启动时调用
initializePrefetch();

// 使用预请求
async function loadProducts() {
  // 预请求数据
  await preFetch('/api/products', { expireTime: 60000 });
  
  // 实际请求会从缓存返回
  const response = await fetch('/api/products');
  const products = await response.json();
  
  return products;
}
```

## 配置选项

### Prefetch 配置

```typescript
interface PrefetchConfig {
  // API 匹配规则（字符串或正则表达式）
  apiMatcher?: string | RegExp;
  
  // 默认缓存过期时间（毫秒）
  defaultExpireTime?: number;
  
  // 最大缓存数量
  maxCacheSize?: number;
  
  // 是否开启调试模式
  debug?: boolean;
}
```

### CLI 工具选项

```bash
# 创建新的 Service Worker
prefetch integrate --create --output <file>

# 集成到现有 Service Worker
prefetch integrate --input <file> --output <file>

# 交互式模式
prefetch integrate --interactive

# 验证集成
prefetch integrate --verify <file>

# 自定义配置
prefetch integrate --create --output public/sw.js --config '{"apiMatcher":"/api/*","debug":true}'
```

## 版本管理

### 使用固定版本（推荐生产环境）

```javascript
// 使用特定版本
importScripts('https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js');
```

### 使用最新版本（开发环境）

```javascript
// 使用最新版本
importScripts('https://esm.sh/@norejs/prefetch-worker@latest/dist/prefetch-worker.umd.js');
```

### 版本锁定

在 `package.json` 中锁定版本：

```json
{
  "dependencies": {
    "@norejs/prefetch": "^0.1.0",
    "@norejs/prefetch-worker": "1.0.1"
  }
}
```

## 降级策略

推荐配置本地降级文件：

```javascript
(function() {
  const CDN_URL = 'https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js';
  const FALLBACK_URL = '/prefetch-worker.umd.js';
  
  try {
    importScripts(CDN_URL);
    console.log('Loaded from CDN');
  } catch (error) {
    console.warn('CDN failed, using fallback');
    try {
      importScripts(FALLBACK_URL);
      console.log('Loaded from fallback');
    } catch (fallbackError) {
      console.error('All load attempts failed');
    }
  }
})();
```

准备本地降级文件：

```bash
# 下载 UMD 文件到本地
curl -o public/prefetch-worker.umd.js \
  https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js
```

## 验证集成

使用 CLI 工具验证集成是否正确：

```bash
npx @norejs/prefetch integrate --verify public/service-worker.js
```

输出示例：

```
🔍 Verifying Prefetch integration...

✅ Has Prefetch integration
✅ Has importScripts call
✅ Uses esm.sh CDN
✅ Has message handler
✅ Has fetch handler

5/5 checks passed

✅ Integration looks good!
```

## 调试

### 开启调试模式

```javascript
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH_INIT',
  config: {
    debug: true  // 开启调试日志
  }
});
```

### 查看日志

打开浏览器开发者工具 → Console，查看 Prefetch 相关日志：

```
[Prefetch] Loading from CDN (attempt 1)...
[Prefetch] ✓ Loaded successfully in 234ms
[Prefetch] Initializing with config: {...}
[Prefetch] ✓ Initialized successfully
[Prefetch] cache hit (response) /api/products
```

### 健康检查

```javascript
// 检查 Prefetch 状态
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH_HEALTH_CHECK'
});

navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'PREFETCH_HEALTH_RESPONSE') {
    console.log('Prefetch Status:', event.data);
    // {
    //   loaded: true,
    //   initialized: true,
    //   attempts: 1
    // }
  }
});
```

## 常见问题

### Q: esm.sh 加载失败怎么办？

A: 配置本地降级文件，参考上面的"降级策略"部分。

### Q: 如何更新到新版本？

A: 修改 Service Worker 中的版本号，然后重新注册 Service Worker：

```javascript
// 更新版本号
const CDN_URL = 'https://esm.sh/@norejs/prefetch-worker@1.0.2/dist/prefetch-worker.umd.js';

// 强制更新 Service Worker
navigator.serviceWorker.register('/service-worker.js', { 
  updateViaCache: 'none' 
});
```

### Q: 如何卸载 Prefetch？

A: 从 Service Worker 中删除 Prefetch 集成代码，然后重新注册：

```javascript
// 删除集成代码后
navigator.serviceWorker.getRegistration().then(registration => {
  registration?.unregister();
  window.location.reload();
});
```

### Q: 支持哪些浏览器？

A: 所有支持 Service Worker 的现代浏览器：
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

## 最佳实践

1. **生产环境使用固定版本**：避免意外的版本更新
2. **配置本地降级**：确保 CDN 失败时仍可用
3. **合理设置缓存时间**：根据 API 特性调整 `defaultExpireTime`
4. **监控加载成功率**：收集 CDN 加载统计数据
5. **渐进式部署**：先在小范围用户测试，再全量发布

## 示例项目

查看完整示例：
- [Next.js 集成示例](../demos/nextjs-prefetch-demo)
- [Vite 集成示例](../demos/vite-prefetch-demo)

## 获取帮助

- [GitHub Issues](https://github.com/yourusername/prefetch/issues)
- [文档](https://github.com/yourusername/prefetch/docs)

