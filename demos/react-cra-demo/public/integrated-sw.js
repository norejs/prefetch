// 现有的 Service Worker
console.log('Existing Service Worker loaded');

// 现有的缓存策略
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  console.log('Installing existing SW...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Activating existing SW...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 现有的 fetch 处理逻辑
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});



// ============================================
// Prefetch Worker Integration
// Version: 0.1.0-alpha.11
// Generated: 2025-10-23T08:27:40.800Z
// ============================================

(function() {
  'use strict';
  
  const PREFETCH_CONFIG = {
    // CDN URL - 使用 esm.sh 提供的 UMD 格式
    cdnUrl: 'https://esm.sh/@norejs/prefetch-worker@0.1.0-alpha.11/dist/prefetch-worker.umd.js',
    
    // 本地降级文件（可选）
    fallbackUrl: '/prefetch-worker.umd.js',
    
    // 加载超时时间（毫秒）
    timeout: 5000,
    
    // 最大重试次数
    maxRetries: 2,
    
    // Prefetch 配置
    prefetchConfig: {}
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
      
      // 同步加载脚本
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
   * 消息处理 - 支持延迟加载
   */
  self.addEventListener('message', (event) => {
    if (!event.data) return;
    
    // 初始化消息
    if (event.data.type === 'PREFETCH_INIT') {
      console.log('[Prefetch] Received INIT message');
      
      if (!prefetchHandler) {
        // 延迟加载：只在需要时加载
        if (loadPrefetchWorker()) {
          prefetchHandler = initializePrefetch(event.data.config || {});
          
          // 通知主线程初始化完成
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
  const originalFetchHandler = self.onfetch;
  
  self.addEventListener('fetch', (event) => {
    // 优先使用 Prefetch 处理
    if (prefetchHandler) {
      try {
        const response = prefetchHandler(event);
        if (response) {
          return event.respondWith(response);
        }
      } catch (error) {
        console.error('[Prefetch] Fetch handler error:', error);
      }
    }
    
    // 调用原有的 fetch 处理逻辑（如果存在）
    if (originalFetchHandler) {
      return originalFetchHandler.call(self, event);
    }
  });
  
  console.log('[Prefetch] Integration loaded, waiting for INIT message');
  
})();

// ============================================
// End of Prefetch Worker Integration
// ============================================
