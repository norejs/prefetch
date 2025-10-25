import { createGlobalFetchHandler, type GlobalFetchHandler } from './handleFetch.js';
import { isServiceWorkerContext } from './env.js';

// Service Worker 类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};

// 全局处理器实例
let globalHandler: GlobalFetchHandler | null = null;

/**
 * 主初始化函数
 * 在 Service Worker 环境中自动注册全局处理器
 * 必须同步执行以确保 fetch 监听器在 SW 启动时立即注册
 */
export function main(): void {
  if (!isServiceWorkerContext) {
    // 非 Service Worker 环境，跳过初始化
    return;
  }

  if (globalHandler) {
    // 已经初始化过，跳过
    return;
  }

  try {
    // 创建并注册全局处理器
    globalHandler = createGlobalFetchHandler();
    self.addEventListener('fetch', globalHandler);
    console.log('prefetch-worker: global fetch handler registered on module load');
  } catch (error) {
    console.error('prefetch-worker: failed to initialize global handler', error);
  }
}

/**
 * 获取全局处理器实例
 * 供其他模块使用
 */
export function getGlobalHandler(): GlobalFetchHandler | null {
  return globalHandler;
}

