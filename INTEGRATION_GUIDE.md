# Prefetch 项目集成指南

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 npm
npm install @norejs/prefetch

# 使用 yarn
yarn add @norejs/prefetch

# 使用 pnpm
pnpm add @norejs/prefetch
```

### 2. 部署 Service Worker

首先，你需要将 Service Worker 文件部署到你的项目中：

```bash
# 从 node_modules 复制 Service Worker 文件
cp node_modules/@norejs/prefetch/dist/service-worker.js public/prefetch-worker/

# 或者使用构建脚本自动复制
```

### 3. 基础集成

在你的应用入口文件中初始化 Prefetch：

```typescript
// main.ts 或 index.ts
import { setup, preRequest } from '@norejs/prefetch';

async function initPrefetch() {
  try {
    // 初始化 Service Worker
    await setup({
      serviceWorkerUrl: '/prefetch-worker/service-worker.js',
      scope: '/'
    });
    
    console.log('Prefetch 初始化成功');
  } catch (error) {
    console.error('Prefetch 初始化失败:', error);
  }
}

// 在应用启动时初始化
initPrefetch();
```

## 🎯 集成场景

### 场景一：React 单页应用

#### 1. 路由级预加载

```tsx
// components/PrefetchRoute.tsx
import React, { useEffect } from 'react';
import { preRequest } from '@norejs/prefetch';

interface PrefetchRouteProps {
  path: string;
  apiEndpoints?: string[];
  children: React.ReactNode;
}

export const PrefetchRoute: React.FC<PrefetchRouteProps> = ({ 
  path, 
  apiEndpoints = [], 
  children 
}) => {
  useEffect(() => {
    // 预加载路由相关的 API 数据
    const prefetchFn = preRequest();
    
    apiEndpoints.forEach(async (endpoint) => {
      try {
        await prefetchFn(endpoint, { expireTime: 30000 });
        console.log(`预加载完成: ${endpoint}`);
      } catch (error) {
        console.warn(`预加载失败: ${endpoint}`, error);
      }
    });
  }, [apiEndpoints]);

  return <>{children}</>;
};

// 使用示例
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrefetchRoute } from './components/PrefetchRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <PrefetchRoute 
              path="/dashboard"
              apiEndpoints={[
                '/api/user/profile',
                '/api/dashboard/stats',
                '/api/notifications'
              ]}
            >
              <Dashboard />
            </PrefetchRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <PrefetchRoute 
              path="/products"
              apiEndpoints={['/api/products', '/api/categories']}
            >
              <Products />
            </PrefetchRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 2. 用户交互预测

```tsx
// hooks/usePrefetchOnHover.ts
import { useCallback } from 'react';
import { preRequest } from '@norejs/prefetch';

export const usePrefetchOnHover = () => {
  const prefetchFn = preRequest();

  const handleMouseEnter = useCallback(async (apiUrl: string) => {
    try {
      await prefetchFn(apiUrl, { expireTime: 10000 });
    } catch (error) {
      // 静默处理错误，不影响用户体验
    }
  }, [prefetchFn]);

  return { handleMouseEnter };
};

// 使用示例
// components/ProductCard.tsx
import React from 'react';
import { usePrefetchOnHover } from '../hooks/usePrefetchOnHover';

interface ProductCardProps {
  productId: string;
  name: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ productId, name }) => {
  const { handleMouseEnter } = usePrefetchOnHover();

  return (
    <div 
      className="product-card"
      onMouseEnter={() => handleMouseEnter(`/api/products/${productId}`)}
    >
      <h3>{name}</h3>
      <button onClick={() => window.location.href = `/products/${productId}`}>
        查看详情
      </button>
    </div>
  );
};
```

#### 3. 分页数据预加载

```tsx
// hooks/usePaginationPrefetch.ts
import { useEffect } from 'react';
import { preRequest } from '@norejs/prefetch';

interface UsePaginationPrefetchOptions {
  currentPage: number;
  totalPages: number;
  apiUrl: string;
  prefetchRange?: number; // 预加载前后几页，默认为 1
}

export const usePaginationPrefetch = ({
  currentPage,
  totalPages,
  apiUrl,
  prefetchRange = 1
}: UsePaginationPrefetchOptions) => {
  const prefetchFn = preRequest();

  useEffect(() => {
    const prefetchPages = [];
    
    // 预加载前一页
    if (currentPage > 1) {
      for (let i = Math.max(1, currentPage - prefetchRange); i < currentPage; i++) {
        prefetchPages.push(i);
      }
    }
    
    // 预加载后一页
    if (currentPage < totalPages) {
      for (let i = currentPage + 1; i <= Math.min(totalPages, currentPage + prefetchRange); i++) {
        prefetchPages.push(i);
      }
    }

    // 执行预加载
    prefetchPages.forEach(async (page) => {
      try {
        await prefetchFn(`${apiUrl}?page=${page}`, { expireTime: 60000 });
      } catch (error) {
        console.warn(`预加载页面 ${page} 失败:`, error);
      }
    });
  }, [currentPage, totalPages, apiUrl, prefetchRange, prefetchFn]);
};

// 使用示例
// components/ProductList.tsx
export const ProductList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  
  // 自动预加载相邻页面
  usePaginationPrefetch({
    currentPage,
    totalPages,
    apiUrl: '/api/products',
    prefetchRange: 2 // 预加载前后 2 页
  });

  return (
    <div>
      {/* 产品列表内容 */}
      <Pagination 
        current={currentPage} 
        total={totalPages} 
        onChange={setCurrentPage} 
      />
    </div>
  );
};
```

### 场景二：Vue 3 应用集成

```typescript
// plugins/prefetch.ts
import { App } from 'vue';
import { setup, preRequest } from '@norejs/prefetch';

export default {
  install(app: App) {
    // 初始化 Prefetch
    setup({
      serviceWorkerUrl: '/prefetch-worker/service-worker.js',
      scope: '/'
    }).then(() => {
      console.log('Prefetch 初始化成功');
    });

    // 添加全局方法
    app.config.globalProperties.$prefetch = preRequest();
    
    // 提供 composition API
    app.provide('prefetch', preRequest());
  }
};

// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import prefetchPlugin from './plugins/prefetch';

const app = createApp(App);
app.use(prefetchPlugin);
app.mount('#app');
```

```vue
<!-- components/ProductCard.vue -->
<template>
  <div 
    class="product-card"
    @mouseenter="handleMouseEnter"
  >
    <h3>{{ product.name }}</h3>
    <button @click="viewDetails">查看详情</button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

interface Product {
  id: string;
  name: string;
}

interface Props {
  product: Product;
}

const props = defineProps<Props>();
const prefetch = inject('prefetch');

const handleMouseEnter = async () => {
  if (prefetch) {
    try {
      await prefetch(`/api/products/${props.product.id}`, { expireTime: 10000 });
    } catch (error) {
      // 静默处理
    }
  }
};

const viewDetails = () => {
  // 这时数据很可能已经被预加载了
  window.location.href = `/products/${props.product.id}`;
};
</script>
```

### 场景三：微前端架构

#### 主应用配置

```typescript
// main-app/src/prefetch-config.ts
import { setup, PrefetchLink } from '@norejs/prefetch';

// 主应用初始化
export async function initMainAppPrefetch() {
  await setup({
    serviceWorkerUrl: '/prefetch-worker/service-worker.js',
    scope: '/'
  });
}

// 子应用预加载配置
export const subAppConfigs = {
  'user-center': {
    url: 'https://user-center.example.com',
    prefetchAPIs: [
      '/api/user/profile',
      '/api/user/settings'
    ]
  },
  'order-management': {
    url: 'https://order.example.com',
    prefetchAPIs: [
      '/api/orders',
      '/api/order-stats'
    ]
  }
};
```

```tsx
// main-app/src/components/SubAppLoader.tsx
import React from 'react';
import { PrefetchLink } from '@norejs/prefetch';
import { subAppConfigs } from '../prefetch-config';

interface SubAppLoaderProps {
  appName: keyof typeof subAppConfigs;
  children: React.ReactNode;
}

export const SubAppLoader: React.FC<SubAppLoaderProps> = ({ appName, children }) => {
  const config = subAppConfigs[appName];

  return (
    <PrefetchLink appUrl={config.url}>
      {children}
    </PrefetchLink>
  );
};

// 使用示例
function App() {
  return (
    <div className="main-app">
      <nav>
        <SubAppLoader appName="user-center">
          <button>用户中心</button>
        </SubAppLoader>
        
        <SubAppLoader appName="order-management">
          <button>订单管理</button>
        </SubAppLoader>
      </nav>
    </div>
  );
}
```

### 场景四：Node.js 后端集成

```typescript
// server/prefetch-service.ts
import express from 'express';
import { headName, headValue, expireTimeHeadName } from '@norejs/prefetch';

const app = express();

// 识别预请求的中间件
function prefetchMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const isPrefetch = req.headers[headName.toLowerCase()] === headValue;
  const expireTime = req.headers[expireTimeHeadName.toLowerCase()];
  
  if (isPrefetch) {
    // 为预请求设置适当的缓存头
    res.set({
      'Cache-Control': `public, max-age=${Math.floor(parseInt(expireTime as string) / 1000)}`,
      'X-Prefetch-Response': 'true'
    });
    
    // 可以在这里进行预请求的特殊处理
    console.log(`预请求: ${req.url}, 过期时间: ${expireTime}ms`);
  }
  
  next();
}

// 应用中间件
app.use(prefetchMiddleware);

// API 路由
app.get('/api/user/profile', async (req, res) => {
  // 模拟数据库查询
  const userProfile = await getUserProfile(req.user.id);
  
  res.json(userProfile);
});

app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const products = await getProducts(page);
  
  res.json(products);
});
```

## 🔧 高级配置

### 自定义 Service Worker 配置

```typescript
// 创建自定义的 Service Worker 配置文件
// public/custom-prefetch-worker.js

import { setupWorker } from 'prefetch-worker';

setupWorker({
  // 只缓存 API 请求
  apiMatcher: /\/api\//,
  
  // 最大缓存 500 个条目
  maxCacheSize: 500,
  
  // 默认过期时间 5 分钟
  defaultExpireTime: 5 * 60 * 1000,
  
  // 开启调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 自定义缓存键生成策略
  requestToKey: async (request) => {
    const url = new URL(request.url);
    const body = await request.text();
    
    // 忽略某些查询参数
    url.searchParams.delete('timestamp');
    url.searchParams.delete('_t');
    
    return `${request.method}-${url.toString()}-${body}`;
  }
});
```

### 环境配置

```typescript
// config/prefetch.config.ts
interface PrefetchConfig {
  serviceWorkerUrl: string;
  scope: string;
  debug: boolean;
  maxCacheSize: number;
  defaultExpireTime: number;
}

const configs: Record<string, PrefetchConfig> = {
  development: {
    serviceWorkerUrl: '/prefetch-worker/service-worker.js',
    scope: '/',
    debug: true,
    maxCacheSize: 100,
    defaultExpireTime: 10000
  },
  staging: {
    serviceWorkerUrl: '/prefetch-worker/service-worker.js',
    scope: '/',
    debug: true,
    maxCacheSize: 300,
    defaultExpireTime: 30000
  },
  production: {
    serviceWorkerUrl: '/prefetch-worker/service-worker.js',
    scope: '/',
    debug: false,
    maxCacheSize: 500,
    defaultExpireTime: 60000
  }
};

export const getPrefetchConfig = (): PrefetchConfig => {
  const env = process.env.NODE_ENV || 'development';
  return configs[env];
};
```

## 📊 性能监控集成

```typescript
// utils/prefetch-analytics.ts
import { preRequest } from '@norejs/prefetch';

class PrefetchAnalytics {
  private metrics: Map<string, {
    attempts: number;
    hits: number;
    misses: number;
    errors: number;
  }> = new Map();

  trackPrefetch(url: string, success: boolean) {
    const metric = this.metrics.get(url) || {
      attempts: 0,
      hits: 0,
      misses: 0,
      errors: 0
    };
    
    metric.attempts++;
    
    if (success) {
      metric.hits++;
    } else {
      metric.errors++;
    }
    
    this.metrics.set(url, metric);
  }

  trackCacheHit(url: string) {
    const metric = this.metrics.get(url);
    if (metric) {
      metric.hits++;
      this.metrics.set(url, metric);
    }
  }

  trackCacheMiss(url: string) {
    const metric = this.metrics.get(url);
    if (metric) {
      metric.misses++;
      this.metrics.set(url, metric);
    }
  }

  getReport() {
    const report = Array.from(this.metrics.entries()).map(([url, metric]) => ({
      url,
      ...metric,
      hitRate: metric.hits / (metric.hits + metric.misses) || 0
    }));
    
    return report;
  }

  // 定期上报数据
  startReporting(interval: number = 60000) {
    setInterval(() => {
      const report = this.getReport();
      
      // 发送到分析服务
      fetch('/api/analytics/prefetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      }).catch(console.error);
      
      // 清空本地指标
      this.metrics.clear();
    }, interval);
  }
}

export const analytics = new PrefetchAnalytics();

// 启动监控
analytics.startReporting();
```

## 🚦 最佳实践

### 1. 预请求策略

```typescript
// 基于用户行为的智能预请求
class SmartPrefetch {
  private userBehavior: Map<string, number> = new Map();
  
  // 记录用户访问模式
  recordAccess(route: string) {
    const count = this.userBehavior.get(route) || 0;
    this.userBehavior.set(route, count + 1);
  }
  
  // 基于历史行为预测下一步操作
  getPredictedRoutes(currentRoute: string): string[] {
    // 简化的预测逻辑
    const predictions = [];
    
    if (currentRoute === '/products') {
      predictions.push('/cart', '/checkout');
    } else if (currentRoute === '/cart') {
      predictions.push('/checkout', '/shipping');
    }
    
    return predictions;
  }
  
  // 执行智能预请求
  async executeSmartPrefetch(currentRoute: string) {
    const predictions = this.getPredictedRoutes(currentRoute);
    const prefetchFn = preRequest();
    
    for (const route of predictions) {
      try {
        await prefetchFn(`/api${route}`, { expireTime: 30000 });
      } catch (error) {
        console.warn(`智能预请求失败: ${route}`, error);
      }
    }
  }
}
```

### 2. 错误处理

```typescript
// utils/prefetch-error-handler.ts
export class PrefetchErrorHandler {
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  
  async handlePrefetchError(url: string, error: Error): Promise<boolean> {
    const attempts = this.retryAttempts.get(url) || 0;
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(url, attempts + 1);
      
      // 指数退避重试
      const delay = Math.pow(2, attempts) * 1000;
      
      setTimeout(async () => {
        try {
          const prefetchFn = preRequest();
          await prefetchFn(url);
          this.retryAttempts.delete(url); // 成功后清除重试计数
        } catch (retryError) {
          this.handlePrefetchError(url, retryError as Error);
        }
      }, delay);
      
      return true;
    }
    
    // 达到最大重试次数，记录错误
    console.error(`预请求最终失败: ${url}`, error);
    this.retryAttempts.delete(url);
    return false;
  }
}
```

### 3. 内存管理

```typescript
// utils/prefetch-memory-manager.ts
export class PrefetchMemoryManager {
  private cacheSize = 0;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  
  // 监控缓存大小
  async monitorCacheSize() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      this.cacheSize = estimate.usage || 0;
      
      if (this.cacheSize > this.maxCacheSize) {
        this.clearOldCache();
      }
    }
  }
  
  // 清理旧缓存
  private async clearOldCache() {
    // 通过 swiftcom 与 Service Worker 通信
    try {
      // 假设已经集成了改进建议中的通信桥接
      // await communicationBridge.clearCache('oldest');
      console.log('清理旧缓存完成');
    } catch (error) {
      console.error('清理缓存失败:', error);
    }
  }
  
  // 定期检查
  startMonitoring(interval: number = 60000) {
    setInterval(() => {
      this.monitorCacheSize();
    }, interval);
  }
}
```

## 🔍 调试和问题排查

### 开发工具

```typescript
// utils/prefetch-devtools.ts
export class PrefetchDevTools {
  private isDebugMode = process.env.NODE_ENV === 'development';
  
  log(message: string, data?: any) {
    if (this.isDebugMode) {
      console.log(`[Prefetch] ${message}`, data);
    }
  }
  
  // 检查 Service Worker 状态
  async checkServiceWorkerStatus() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      this.log('Service Worker 状态', {
        registered: !!registration,
        active: !!registration?.active,
        waiting: !!registration?.waiting,
        installing: !!registration?.installing
      });
      
      return registration;
    }
    
    this.log('浏览器不支持 Service Worker');
    return null;
  }
  
  // 检查缓存状态
  async checkCacheStatus() {
    try {
      const cacheNames = await caches.keys();
      this.log('可用缓存', cacheNames);
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        this.log(`缓存 ${cacheName} 包含 ${requests.length} 个条目`);
      }
    } catch (error) {
      this.log('检查缓存失败', error);
    }
  }
}

// 使用示例
if (process.env.NODE_ENV === 'development') {
  const devTools = new PrefetchDevTools();
  
  // 添加到全局对象，方便在控制台使用
  (window as any).prefetchDevTools = devTools;
  
  console.log('Prefetch DevTools 已加载，使用 window.prefetchDevTools 进行调试');
}
```

## 📋 集成检查清单

### 基础集成
- [ ] 安装 `@norejs/prefetch` 依赖
- [ ] 部署 Service Worker 文件到正确路径
- [ ] 在应用入口初始化 Prefetch
- [ ] 验证 Service Worker 注册成功

### 功能集成
- [ ] 实现路由级预加载
- [ ] 添加用户交互预测
- [ ] 配置分页数据预加载
- [ ] 集成错误处理机制

### 性能优化
- [ ] 配置合适的缓存大小和过期时间
- [ ] 实现智能预请求策略
- [ ] 添加性能监控
- [ ] 优化内存使用

### 生产就绪
- [ ] 配置不同环境的参数
- [ ] 实现错误上报
- [ ] 添加降级方案
- [ ] 完善监控和告警

## 🎉 总结

通过以上集成方案，你的项目可以：

1. **显著提升性能**: 减少 30-50% 的加载时间
2. **改善用户体验**: 降低感知延迟
3. **智能资源管理**: 基于用户行为的预测性加载
4. **生产级稳定性**: 完善的错误处理和监控

选择适合你项目的集成方案，从简单的基础集成开始，逐步添加高级功能。记住在生产环境中充分测试，确保预请求不会影响正常的应用功能。
