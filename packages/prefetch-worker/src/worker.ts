/**
 * Service Worker 入口文件
 * 
 * 完整的 Service Worker，包含生命周期管理和消息监听
 */

import { setupLifecycle } from './lifecycle.js';
import { initializePrefetchWorker } from './main.js';

// 设置生命周期管理
setupLifecycle({
  autoSkipWaiting: true,
  autoClaimClients: true
});

// 智能初始化（等待主进程配置）
initializePrefetchWorker();