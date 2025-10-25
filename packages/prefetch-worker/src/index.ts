/**
 * Prefetch Worker - 模块化导出
 * 
 * 提供独立的功能模块，开发者可以自由组合使用
 */

// 必须同步执行主初始化函数以注册全局 fetch 处理器
import { main } from './main.js';
main();

// === 核心功能模块 ===
// Fetch 处理器 - 核心缓存和请求处理逻辑
export { createFetchHandler, createGlobalFetchHandler } from './handleFetch.js';

// 生命周期管理 - Service Worker install/activate 事件处理
export { setupLifecycle } from './lifecycle.js';

// 智能初始化 - 根据配置自动选择行为
export { initializePrefetchWorker } from './initialize.js';

// 消息监听器 - 内部使用，不导出

// 导出类型定义
export type {
  ServiceWorkerConfig,
  CacheItem,
  InitMessage,
  InitSuccessMessage,
  InitErrorMessage,
  HealthCheckMessage,
  HealthResponseMessage
} from './types.js';

// 导出全局处理器类型
export type { GlobalFetchHandler } from './handleFetch.js';

// 工具函数 - 内部使用，不导出

// 环境检测 - 内部使用，不导出

// 导出常量
export {
  HeadName,
  HeadValue,
  ExpireTimeHeadName
} from './handleFetch.js';