import type { ServiceWorkerConfig } from './types.js';
import type { GlobalFetchHandler } from './handleFetch.js';
import { setupMessageListener } from './messageListener.js';
import { getGlobalHandler } from './main.js';
import { isServiceWorkerContext } from './env.js';

// 默认配置
const defaultConfig: ServiceWorkerConfig = {
  apiMatcher: '/api/*'
};

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

  const globalHandler = getGlobalHandler();
  if (!globalHandler) {
    throw new Error('Global handler should be initialized by main() function');
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

    // 配置全局处理器
    globalHandler.configure(finalConfig);

    console.log('prefetch-worker: initialized and ready');

    // 返回清理函数
    return () => {
      console.log('prefetch-worker: cleaning up immediate initialization');
      globalHandler.clearCache();
    };
  } else {
    // 无配置：等待主进程消息
    console.log('prefetch-worker: no config provided, waiting for main thread initialization');
    return setupMessageListener(globalHandler, defaultConfig);
  }
}