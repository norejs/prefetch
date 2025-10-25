import type {
  ServiceWorkerConfig,
  InitSuccessMessage,
  InitErrorMessage,
  HealthResponseMessage
} from './types.js';
import type { GlobalFetchHandler } from './handleFetch.js';
import { isServiceWorkerContext } from './env.js';

// Service Worker 类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};

/**
 * 设置消息监听器，等待主进程发送配置消息
 * 专注于监听主进程消息并动态配置 fetch 处理器
 * @param globalHandler 全局处理器实例
 * @param defaultConfig 默认配置
 * @returns 清理函数
 */
export function setupMessageListener(
  globalHandler: GlobalFetchHandler,
  defaultConfig: ServiceWorkerConfig
): () => void {
  if (!isServiceWorkerContext) {
    throw new Error('setupMessageListener can only be called in Service Worker context');
  }

  if (!globalHandler) {
    throw new Error('Global handler is required');
  }

  // 消息处理器
  const messageHandler = (event: ExtendableMessageEvent) => {
    console.log('prefetch-worker: received message', event.data);

    if (event.data?.type === 'PREFETCH_INIT') {
      try {
        const newConfig: ServiceWorkerConfig = {
          ...defaultConfig,
          ...event.data.config
        };

        console.log('prefetch-worker: initializing with message config', newConfig);
        globalHandler.configure(newConfig);

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
          initialized: globalHandler.isInitialized(),
          attempts: 0
        };
        source.postMessage(response);
      }
    }

    // 获取缓存统计
    if (event.data?.type === 'PREFETCH_GET_STATS') {
      const source = event.source || event.ports?.[0];
      if (source) {
        const stats = globalHandler.getCacheStats();
        source.postMessage({
          type: 'PREFETCH_STATS_RESPONSE',
          stats
        });
      }
    }

    // 清理缓存
    if (event.data?.type === 'PREFETCH_CLEAR_CACHE') {
      globalHandler.clearCache();
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
    globalHandler.clearCache();
    self.removeEventListener('message', messageHandler);
  };
}