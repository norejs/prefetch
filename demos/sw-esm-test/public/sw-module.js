// sw-module.js - ES Module Service Worker with Prefetch Worker Integration
console.log('Module SW: 开始加载ES Module Service Worker');

// 使用ES Module导入本地模块
import { moduleUtils } from './modules/utils-esm.js';
import { CacheManager } from './modules/cache-manager-esm.js';
import { ApiHandler } from './modules/api-handler-esm.js';

console.log('Module SW: ✅ 本地 ES Module 导入成功');

// 初始化本地模块
const cacheManager = new CacheManager('esm-sw-cache-v1');
const apiHandler = new ApiHandler(cacheManager);

// Prefetch Worker 相关变量
let prefetchWorkerCleanup = null;

// 初始化 Prefetch Worker
async function initializePrefetchWorker() {
  try {
    console.log('Module SW: 开始初始化 Prefetch Worker...');
    
    // 使用测试环境 CDN 地址
    const CDN_BASE = 'http://localhost:18003';
    const { 
      setupLifecycle, 
      initializePrefetchWorker 
    } = await import(`${CDN_BASE}/service-worker.esm.js`);
    
    console.log('Module SW: ✅ Prefetch Worker 模块加载成功');
    
    // 设置生命周期管理（不自动管理，因为我们有自己的生命周期）
    const cleanupLifecycle = setupLifecycle({
      autoSkipWaiting: false,
      autoClaimClients: false,
      debug: true
    });
    
    // 初始化预取功能（等待主进程配置）
    const cleanupPrefetch = initializePrefetchWorker();
    
    // 组合清理函数
    prefetchWorkerCleanup = () => {
      cleanupPrefetch();
      cleanupLifecycle();
    };
    
    console.log('Module SW: ✅ Prefetch Worker 初始化完成，等待主进程配置');
    
  } catch (error) {
    console.error('Module SW: Prefetch Worker 初始化失败:', error);
  }
}

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Module SW: 安装中...');
  
  event.waitUntil(
    (async () => {
      // 初始化缓存
      await cacheManager.initialize();
      console.log('Module SW: 缓存管理器初始化完成');
      
      // 初始化 Prefetch Worker
      await initializePrefetchWorker();
      
      // 跳过等待
      self.skipWaiting();
    })()
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Module SW: 激活中...');
  
  event.waitUntil(
    (async () => {
      // 清理旧缓存
      await cacheManager.cleanup();
      
      // 控制所有客户端
      await self.clients.claim();
      console.log('Module SW: ✅ 已激活并控制所有客户端');
      
      // 通知客户端SW已准备就绪
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_READY',
          swType: 'module',
          timestamp: Date.now(),
          features: {
            esModules: true,
            dynamicImport: true,
            topLevelAwait: true,
            prefetchWorker: !!prefetchWorkerCleanup
          }
        });
      });
    })()
  );
});

// Fetch事件处理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 拦截API请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiHandler.handleRequest(event.request));
    return;
  }
  
  // 静态资源缓存策略
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(cacheManager.cacheFirst(event.request));
    return;
  }
  
  // 其他请求直接透传
});

// 消息处理
self.addEventListener('message', async (event) => {
  console.log('Module SW: 收到消息:', event.data);
  
  // 处理 Prefetch Worker 配置消息
  if (event.data && event.data.type === 'PREFETCH_CONFIG') {
    console.log('Module SW: 收到 Prefetch Worker 配置:', event.data.config);
    // Prefetch Worker 会自动处理这个消息
    return;
  }
  
  // 处理测试消息
  if (event.data && event.data.type === 'TEST_MESSAGE') {
    // 使用动态导入测试
    try {
      const { dynamicFeature } = await import('./modules/dynamic-feature.js');
      const result = dynamicFeature(event.data.data);
      
      // 回复消息
      event.source.postMessage({
        type: 'MESSAGE_REPLY',
        swType: 'module',
        originalMessage: event.data,
        reply: 'ES Module Service Worker 收到消息',
        dynamicResult: result,
        prefetchWorkerActive: !!prefetchWorkerCleanup,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Module SW: 动态导入失败:', error);
      event.source.postMessage({
        type: 'MESSAGE_ERROR',
        swType: 'module',
        error: error.message,
        timestamp: Date.now()
      });
    }
  }
  
  // 处理 Prefetch Worker 测试消息
  if (event.data && event.data.type === 'TEST_PREFETCH') {
    event.source.postMessage({
      type: 'PREFETCH_STATUS',
      swType: 'module',
      prefetchWorkerActive: !!prefetchWorkerCleanup,
      timestamp: Date.now()
    });
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Module SW: 全局错误:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Module SW: 未处理的Promise拒绝:', event.reason);
});

console.log('Module SW: ✅ ES Module Service Worker 加载完成');