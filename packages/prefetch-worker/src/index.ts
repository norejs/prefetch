/**
 * Prefetch Worker - 统一导出模块
 * 
 * 简化的 API，专注于核心功能
 */

// 导出主要功能模块
export { initializePrefetchWorker, createSimpleWorker } from './main.js';
export { createFetchHandler } from './handleFetch.js';

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