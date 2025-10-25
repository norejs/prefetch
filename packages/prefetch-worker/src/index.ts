// Service Worker 主入口文件
// 支持消息初始化的 Service Worker

// Service Worker 主入口文件
// 支持消息初始化的 Service Worker

import type { 
  ServiceWorkerConfig, 
  FetchHandler,
  InitMessage,
  InitSuccessMessage,
  InitErrorMessage,
  HealthCheckMessage,
  HealthResponseMessage
} from './types.js';
import setupWorker from './setup.js';
import { logger } from './utils/logger.js';

// Service Worker 类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};

// 标记是否已经初始化
let isInitialized = false;

// 默认配置
const defaultConfig: ServiceWorkerConfig = {
  apiMatcher: '/api/*'
};

// 动态处理函数变量
let handleFetchEventImpl: FetchHandler | null = null;

// 在初始化阶段就注册 fetch 事件监听器
self.addEventListener('fetch', function(event: FetchEvent) {
  // 如果没有初始化或没有处理函数，直接返回（不拦截）
  if (!isInitialized || !handleFetchEventImpl) {
    return;
  }
  
  const response = handleFetchEventImpl(event);
  if (response) {
    return event.respondWith(response);
  }
  
  return;
});

// 监听来自主线程的消息
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('prefetch-worker: received message', event.data);
  
  if (event.data && event.data.type === 'PREFETCH_INIT') {
    try {
      if (isInitialized) {
        console.log('prefetch-worker: already initialized, sending success response');
        
        // 发送已初始化成功的消息
        const source = event.source || event.ports?.[0];
        if (source) {
          const response: InitSuccessMessage = {
            type: 'PREFETCH_INIT_SUCCESS',
            config: {
              ...defaultConfig,
              ...event.data.config
            },
            message: 'Already initialized'
          };
          source.postMessage(response);
        }
        return;
      }
      
      const config: ServiceWorkerConfig = {
        ...defaultConfig,
        ...event.data.config
      };
      
      console.log('prefetch-worker: initializing with config', config);
      
      // 将字符串转换为正则表达式
      const apiMatcher = typeof config.apiMatcher === 'string' 
        ? new RegExp(config.apiMatcher) 
        : config.apiMatcher;
      
      // 调用 setupWorker 并获取处理函数
      const handleFetchEvent = setupWorker({
        apiMatcher,
        ...config
      });
      
      if (handleFetchEvent) {
        handleFetchEventImpl = handleFetchEvent;
      }
      
      isInitialized = true;
      console.log('prefetch-worker: initialization completed');
      
      // 发送初始化完成的消息回主线程
      const source = event.source || event.ports?.[0];
      if (source) {
        const response: InitSuccessMessage = {
          type: 'PREFETCH_INIT_SUCCESS',
          config: config
        };
        source.postMessage(response);
      }
      
    } catch (error) {
      console.error('prefetch-worker: initialization failed', error);
      
      // 发送初始化失败的消息回主线程
      const source = event.source || event.ports?.[0];
      if (source) {
        const response: InitErrorMessage = {
          type: 'PREFETCH_INIT_ERROR',
          error: error instanceof Error ? error.message : String(error)
        };
        source.postMessage(response);
      }
      
      self.registration.unregister();
    }
  }
  
  // 健康检查
  if (event.data && event.data.type === 'PREFETCH_HEALTH_CHECK') {
    const source = event.source || event.ports?.[0];
    if (source) {
      const response: HealthResponseMessage = {
        type: 'PREFETCH_HEALTH_RESPONSE',
        loaded: true,
        initialized: isInitialized,
        attempts: 0
      };
      source.postMessage(response);
    }
  }
});

// 如果没有收到初始化消息，使用默认配置自动初始化
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('prefetch-worker: install event');
  
  // 延迟一下，给主线程发送初始化消息的机会
  setTimeout(() => {
    if (!isInitialized) {
      console.log('prefetch-worker: auto-initializing with default config');
      
      try {
        const apiMatcher = new RegExp(defaultConfig.apiMatcher as string);
        handleFetchEventImpl = setupWorker({
          apiMatcher
        });
        isInitialized = true;
        console.log('prefetch-worker: auto-initialization completed');
      } catch (error) {
        console.error('prefetch-worker: auto-initialization failed', error);
        self.registration.unregister();
      }
    }
  }, 1000); // 1秒延迟
});

// 激活事件
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('prefetch-worker: activate event');
  
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('prefetch-worker: activated and controlling clients');
    })
  );
});

// 错误处理
self.addEventListener('error', (event: ErrorEvent) => {
  logger.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logger.error('Unhandled promise rejection:', event.reason);
});

console.log('prefetch-worker: loaded, waiting for initialization message');

// 导出类型和函数供其他格式使用
export { setupWorker };
export type { ServiceWorkerConfig, FetchHandler };
export * from './types.js';