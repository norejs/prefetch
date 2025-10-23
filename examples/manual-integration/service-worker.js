// 示例：手动集成 Prefetch Worker 到现有 Service Worker

console.log('Service Worker: Loading...');

// ============================================
// 现有的 Service Worker 逻辑
// ============================================

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Service Worker: Activated and controlling clients');
    })
  );
});

// 现有的缓存策略（示例）
const CACHE_NAME = 'my-app-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ============================================
// Prefetch Worker 集成
// ============================================

(function() {
  'use strict';
  
  const PREFETCH_CONFIG = {
    // 使用 esm.sh CDN
    cdnUrl: 'https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js',
    
    // 本地降级文件
    fallbackUrl: '/prefetch-worker.umd.js',
    
    // 加载超时
    timeout: 5000,
    
    // 最大重试次数
    maxRetries: 2,
    
    // Prefetch 配置
    prefetchConfig: {
      apiMatcher: '/api/*',
      defaultExpireTime: 30000,
      maxCacheSize: 100,
      debug: true
    }
  };
  
  let prefetchHandler = null;
  let loadAttempts = 0;
  let isLoading = false;
  
  /**
   * 加载 Prefetch Worker
   */
  function loadPrefetchWorker() {
    if (isLoading) {
      console.log('[Prefetch] Already loading...');
      return false;
    }
    
    if (loadAttempts >= PREFETCH_CONFIG.maxRetries) {
      console.error('[Prefetch] Max load attempts reached');
      return false;
    }
    
    isLoading = true;
    loadAttempts++;
    
    try {
      const startTime = Date.now();
      console.log(`[Prefetch] Loading from CDN (attempt ${loadAttempts})...`);
      
      // 从 CDN 加载
      importScripts(PREFETCH_CONFIG.cdnUrl);
      
      const loadTime = Date.now() - startTime;
      console.log(`[Prefetch] ✓ Loaded successfully in ${loadTime}ms`);
      
      // 验证加载成功
      if (!self.PrefetchWorker) {
        throw new Error('PrefetchWorker not found in global scope');
      }
      
      isLoading = false;
      return true;
      
    } catch (error) {
      console.warn(`[Prefetch] ✗ Load attempt ${loadAttempts} failed:`, error.message);
      isLoading = false;
      
      // 重试
      if (loadAttempts < PREFETCH_CONFIG.maxRetries) {
        console.log('[Prefetch] Retrying...');
        return loadPrefetchWorker();
      }
      
      // 尝试降级到本地文件
      if (PREFETCH_CONFIG.fallbackUrl) {
        try {
          console.log('[Prefetch] Trying fallback URL...');
          importScripts(PREFETCH_CONFIG.fallbackUrl);
          
          if (self.PrefetchWorker) {
            console.log('[Prefetch] ✓ Loaded from fallback');
            return true;
          }
        } catch (fallbackError) {
          console.error('[Prefetch] ✗ Fallback also failed:', fallbackError.message);
        }
      }
      
      return false;
    }
  }
  
  /**
   * 初始化 Prefetch Handler
   */
  function initializePrefetch(config) {
    if (!self.PrefetchWorker) {
      console.error('[Prefetch] PrefetchWorker not available');
      return null;
    }
    
    try {
      const mergedConfig = {
        ...PREFETCH_CONFIG.prefetchConfig,
        ...config
      };
      
      console.log('[Prefetch] Initializing with config:', mergedConfig);
      
      const handler = self.PrefetchWorker.setup(mergedConfig);
      
      console.log('[Prefetch] ✓ Initialized successfully');
      return handler;
      
    } catch (error) {
      console.error('[Prefetch] ✗ Initialization failed:', error);
      return null;
    }
  }
  
  /**
   * 消息处理
   */
  self.addEventListener('message', (event) => {
    if (!event.data) return;
    
    // 初始化消息
    if (event.data.type === 'PREFETCH_INIT') {
      console.log('[Prefetch] Received INIT message');
      
      if (!prefetchHandler) {
        if (loadPrefetchWorker()) {
          prefetchHandler = initializePrefetch(event.data.config || {});
          
          // 通知主线程
          if (event.source && prefetchHandler) {
            event.source.postMessage({
              type: 'PREFETCH_INIT_SUCCESS',
              config: event.data.config
            });
          } else if (event.source) {
            event.source.postMessage({
              type: 'PREFETCH_INIT_ERROR',
              error: 'Failed to initialize Prefetch Worker'
            });
          }
        }
      }
    }
    
    // 健康检查
    if (event.data.type === 'PREFETCH_HEALTH_CHECK') {
      if (event.source) {
        event.source.postMessage({
          type: 'PREFETCH_HEALTH_RESPONSE',
          loaded: !!self.PrefetchWorker,
          initialized: !!prefetchHandler,
          attempts: loadAttempts
        });
      }
    }
  });
  
  /**
   * Fetch 事件处理
   */
  self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // 1. 优先使用 Prefetch 处理 API 请求
    if (prefetchHandler) {
      try {
        const response = prefetchHandler(event);
        if (response) {
          console.log('[Prefetch] Handling request:', request.url);
          return event.respondWith(response);
        }
      } catch (error) {
        console.error('[Prefetch] Fetch handler error:', error);
      }
    }
    
    // 2. 现有的静态资源缓存策略
    if (request.destination === 'image' || 
        request.destination === 'style' || 
        request.destination === 'script') {
      
      return event.respondWith(
        caches.match(request).then((response) => {
          if (response) {
            console.log('Cache hit:', request.url);
            return response;
          }
          
          return fetch(request).then((response) => {
            // 缓存成功的响应
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
      );
    }
    
    // 3. 默认：直接透传
  });
  
  console.log('[Prefetch] Integration loaded, waiting for INIT message');
  
})();

// ============================================
// End of Prefetch Worker Integration
// ============================================

console.log('Service Worker: Setup complete');

