/**
 * Prefetch Worker - 模块化导出
 * 
 * 提供独立的功能模块，开发者可以自由组合使用
 */

// === 核心功能模块 ===
// Fetch 处理器 - 核心缓存和请求处理逻辑
export { createFetchHandler } from './handleFetch.js';

// 生命周期管理 - Service Worker install/activate 事件处理
export { setupLifecycle } from './lifecycle.js';

// 消息监听器 - 监听主进程配置消息
export { setupMessageListener } from './main.js';

// 智能初始化 - 根据配置自动选择行为
export { initializePrefetchWorker } from './main.js';

// 导出类型定义
export type {
  ServiceWorkerConfig,
  FetchHandler,
  CacheItem,
  InitMessage,
  InitSuccessMessage,
  InitErrorMessage,
  HealthCheckMessage,
  HealthResponseMessage
} from './types.js';

// 导出工具函数
export { createLogger } from './utils/logger.js';
export { default as requestToKey } from './utils/requestToKey.js';

// 导出环境检测
export * from './env.js';

// 导出常量
export {
  HeadName,
  HeadValue,
  ExpireTimeHeadName
} from './handleFetch.js';