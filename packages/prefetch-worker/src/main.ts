import type {
  ServiceWorkerConfig,
  InitSuccessMessage,
  InitErrorMessage,
  HealthResponseMessage
} from './types.js';
import { createFetchHandler } from './handleFetch.js';
import { isServiceWorkerContext } from './env.js';

// Service Worker 类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};

// 默认配置
const defaultConfig: ServiceWorkerConfig = {
  apiMatcher: '/api/*'
};

/**
 * 设置消息监听器，等待主进程发送配置消息
 * 专注于监听主进程消息并动态配置 fetch 处理器
 * @param config 初始配置选项
 * @returns 清理函数
 */
export function setupMessageListener(config: Partial<ServiceWorkerConfig> = {}): () => void {
  if (!isServiceWorkerContext) {
    throw new Error('initializePrefetchWorker can only be called in Service Worker context');
  }

  let currentConfig: ServiceWorkerConfig = {
    ...defaultConfig,
    ...config
  };

  let fetchHandler: any = null;
  let isInitialized = false;

  // 初始化 fetch 处理器
  function setupFetchHandler(newConfig: ServiceWorkerConfig) {
    // 如果已经有处理器，先移除
    if (fetchHandler) {
      self.removeEventListener('fetch', fetchHandler);
      (fetchHandler as any).clearCache?.();
    }

    // 创建新的 fetch 处理器
    fetchHandler = createFetchHandler(newConfig);
    self.addEventListener('fetch', fetchHandler);
    currentConfig = newConfig;
    isInitialized = true;

    console.log('prefetch-worker: fetch handler setup with config', newConfig);
  }

  // 消息处理器
  const messageHandler = (event: ExtendableMessageEvent) => {
    console.log('prefetch-worker: received message', event.data);

    if (event.data?.type === 'PREFETCH_INIT') {
      try {
        const newConfig: ServiceWorkerConfig = {
          ...currentConfig,
          ...event.data.config
        };

        console.log('prefetch-worker: initializing with message config', newConfig);
        setupFetchHandler(newConfig);

        // 发送成功响应
        const source = event.source || event.ports?.[0];
        if (source) {
          const response: InitSuccessMessage = {
            type: 'PREFETCH_INIT_SUCCESS',
            config: newConfig
          };
          source.postMessage(response);
        }

      } catch (error) {
        console.error('prefetch-worker: initialization failed', error);

        // 发送错误响应
        const source = event.source || event.ports?.[0];
        if (source) {
          const response: InitErrorMessage = {
            type: 'PREFETCH_INIT_ERROR',
            error: error instanceof Error ? error.message : String(error)
          };
          source.postMessage(response);
        }
      }
    }

    // 健康检查
    if (event.data?.type === 'PREFETCH_HEALTH_CHECK') {
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

    // 获取缓存统计
    if (event.data?.type === 'PREFETCH_GET_STATS') {
      const source = event.source || event.ports?.[0];
      if (source) {
        const stats = fetchHandler ? (fetchHandler as any).getCacheStats?.() : null;
        source.postMessage({
          type: 'PREFETCH_STATS_RESPONSE',
          stats
        });
      }
    }

    // 清理缓存
    if (event.data?.type === 'PREFETCH_CLEAR_CACHE') {
      if (fetchHandler) {
        (fetchHandler as any).clearCache?.();
      }
      const source = event.source || event.ports?.[0];
      if (source) {
        source.postMessage({
          type: 'PREFETCH_CACHE_CLEARED'
        });
      }
    }
  };

  // 注册消息监听器
  self.addEventListener('message', messageHandler);

  console.log('prefetch-worker: message listener initialized, waiting for configuration from main thread');

  // 返回清理函数
  return () => {
    console.log('prefetch-worker: cleaning up message listener');

    if (fetchHandler) {
      self.removeEventListener('fetch', fetchHandler);
      (fetchHandler as any).clearCache?.();
    }

    self.removeEventListener('message', messageHandler);
    isInitialized = false;
    fetchHandler = null;
  };
}

/**
 * 智能初始化 Prefetch Worker
 * - 如果传入了配置：立即初始化，不等待主进程消息
 * - 如果没有传配置：等待主进程发送配置消息
 * @param config 配置选项（可选）
 * @returns 清理函数
 */
export function initializePrefetchWorker(config?: Partial<ServiceWorkerConfig>): () => void {
  if (!isServiceWorkerContext) {
    throw new Error('initializePrefetchWorker can only be called in Service Worker context');
  }

  // 检查是否传入了有效配置
  const hasConfig = config !== undefined && Object.keys(config).length > 0;

  if (hasConfig) {
    // 有配置：立即初始化
    const finalConfig: ServiceWorkerConfig = {
      ...defaultConfig,
      ...config
    };

    console.log('prefetch-worker: initializing immediately with provided config', finalConfig);

    // 创建 fetch 处理器
    const fetchHandler = createFetchHandler(finalConfig);

    // 直接注册 fetch 事件监听器
    self.addEventListener('fetch', fetchHandler);

    console.log('prefetch-worker: initialized and ready');

    // 返回清理函数
    return () => {
      console.log('prefetch-worker: cleaning up immediate initialization');
      self.removeEventListener('fetch', fetchHandler);
      (fetchHandler as any).clearCache?.();
    };
  } else {
    // 无配置：等待主进程消息
    console.log('prefetch-worker: no config provided, waiting for main thread initialization');
    return setupMessageListener(defaultConfig);
  }
}