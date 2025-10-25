# TypeScript Service Worker 最佳实践

## 🎯 核心原则

### 1. 正确的类型声明

```typescript
// 声明 Service Worker 全局作用域
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};
```

### 2. 事件类型处理

```typescript
// ✅ 正确的事件类型
self.addEventListener('message', (event: MessageEvent) => {
  // 安全的 source 访问
  const source = event.source || event.ports?.[0];
  if (source) {
    source.postMessage(response);
  }
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(doInstallWork());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});
```

### 3. TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "WebWorker", "DOM"],
    "module": "ESNext",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## 🔧 常见问题解决

### 问题 1: Property 'source' does not exist on type 'Event'

```typescript
// ❌ 错误
self.addEventListener('message', (event) => {
  event.source.postMessage(data); // 类型错误
});

// ✅ 正确
self.addEventListener('message', (event: MessageEvent) => {
  const source = event.source || event.ports?.[0];
  if (source) {
    source.postMessage(data);
  }
});
```

### 问题 2: Property 'registration' does not exist

```typescript
// ❌ 错误
self.registration.unregister(); // 类型错误

// ✅ 正确 - 添加类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
};

self.registration.unregister(); // 现在正常工作
```

### 问题 3: Property 'waitUntil' does not exist

```typescript
// ❌ 错误
self.addEventListener('install', (event) => {
  event.waitUntil(promise); // 类型错误
});

// ✅ 正确
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(promise);
});
```

## 📦 推荐的项目结构

```
src/
├── types/
│   ├── service-worker.d.ts    # Service Worker 类型定义
│   └── index.ts               # 导出所有类型
├── utils/
│   ├── logger.ts              # 日志工具
│   └── cache.ts               # 缓存工具
├── handlers/
│   ├── fetch.ts               # Fetch 事件处理
│   ├── message.ts             # 消息事件处理
│   └── lifecycle.ts           # 生命周期事件处理
└── index.ts                   # 主入口文件
```

## 🎨 代码模板

### Service Worker 主文件模板

```typescript
/// <reference lib="webworker" />

// 类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};

// 生命周期事件
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('SW: Install');
  event.waitUntil(
    // 安装逻辑
    Promise.resolve()
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('SW: Activate');
  event.waitUntil(
    self.clients.claim()
  );
});

// Fetch 事件
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    handleFetch(event.request)
  );
});

// 消息事件
self.addEventListener('message', (event: MessageEvent) => {
  const source = event.source || event.ports?.[0];
  if (source && event.data) {
    handleMessage(event.data, source);
  }
});

// 错误处理
self.addEventListener('error', (event: ErrorEvent) => {
  console.error('SW Error:', event.error);
});

self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('SW Unhandled Rejection:', event.reason);
});
```

### 消息处理模板

```typescript
interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

function handleMessage(
  message: ServiceWorkerMessage, 
  source: MessagePort | ServiceWorker | Client
) {
  switch (message.type) {
    case 'INIT':
      source.postMessage({
        type: 'INIT_SUCCESS',
        data: { initialized: true }
      });
      break;
      
    case 'PING':
      source.postMessage({
        type: 'PONG',
        data: { timestamp: Date.now() }
      });
      break;
      
    default:
      console.warn('Unknown message type:', message.type);
  }
}
```

### Fetch 处理模板

```typescript
async function handleFetch(request: Request): Promise<Response> {
  try {
    // 缓存策略
    if (request.method === 'GET') {
      return await cacheFirst(request);
    }
    
    // API 请求
    if (request.url.includes('/api/')) {
      return await networkFirst(request);
    }
    
    // 默认网络请求
    return await fetch(request);
    
  } catch (error) {
    console.error('Fetch error:', error);
    return new Response('Network error', { status: 503 });
  }
}

async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}
```

## 🛠️ 调试技巧

### 1. 类型检查

```bash
# 只进行类型检查，不生成文件
npx tsc --noEmit

# 监听模式类型检查
npx tsc --noEmit --watch
```

### 2. 开发者工具

```typescript
// 添加调试信息
if (typeof self !== 'undefined' && self.location?.hostname === 'localhost') {
  console.log('SW: Development mode');
  
  // 开发模式下的额外日志
  self.addEventListener('fetch', (event: FetchEvent) => {
    console.log('SW Fetch:', event.request.url);
  });
}
```

### 3. 类型断言（谨慎使用）

```typescript
// 当确定类型时可以使用断言
const messageEvent = event as MessageEvent;
const source = messageEvent.source as ServiceWorker;

// 更安全的方式
if ('source' in event && event.source) {
  (event.source as ServiceWorker).postMessage(data);
}
```

## 📚 参考资源

- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [TypeScript Handbook - Working with the DOM](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html)
- [Web Workers API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [TypeScript lib.d.ts files](https://github.com/microsoft/TypeScript/tree/main/lib)

## 🎯 最佳实践总结

1. **始终使用正确的事件类型**: `MessageEvent`, `FetchEvent`, `ExtendableEvent`
2. **安全访问事件属性**: 使用可选链和类型检查
3. **声明 Service Worker 全局作用域**: 确保 `self` 有正确的类型
4. **使用 TypeScript 严格模式**: 启用所有严格检查选项
5. **添加错误处理**: 监听 `error` 和 `unhandledrejection` 事件
6. **模块化代码**: 将不同功能拆分到不同文件中
7. **添加类型注释**: 为复杂的函数和接口添加详细的类型定义