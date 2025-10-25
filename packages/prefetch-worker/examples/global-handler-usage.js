/**
 * 全局处理器使用示例
 * 
 * 这个示例展示了如何使用新的全局 fetch 处理器
 * 解决 Service Worker 中 fetch 监听器必须同步注册的限制
 */

// 方式1：使用 createGlobalFetchHandler 手动管理（高级用法）
import { createGlobalFetchHandler } from '@norejs/prefetch-worker';

// 注意：通常不需要手动创建，因为 main() 函数会自动注册
// 但如果需要手动控制，可以这样做：
const globalHandler = createGlobalFetchHandler();
self.addEventListener('fetch', globalHandler);

// 此时处理器处于 pass-through 模式，所有请求都会直接放行

// 稍后当收到配置时，激活处理器
globalHandler.configure({
  apiMatcher: '/api/*',
  defaultExpireTime: 5000,
  debug: true
});

// 现在处理器处于 active 模式，开始缓存匹配的请求

// 检查状态
console.log('Initialized:', globalHandler.isInitialized()); // true
console.log('Cache stats:', globalHandler.getCacheStats());

// 清理缓存
globalHandler.clearCache();

// ==========================================

// 方式2：使用 initializePrefetchWorker（推荐）
import { initializePrefetchWorker } from '@norejs/prefetch-worker';

// main() 函数立即执行，全局处理器已自动注册！

// 无配置初始化：等待主进程配置
const cleanup1 = initializePrefetchWorker();

// 或者有配置初始化：立即配置全局处理器
const cleanup2 = initializePrefetchWorker({
  apiMatcher: /\/api\/.*/,
  defaultExpireTime: 10000,
  debug: false
});

// ==========================================

// 方式3：在模板中使用（templates/service-worker.js）
// 模板已经自动处理了全局处理器的创建和注册
// 开发者只需要从主进程发送配置消息即可

// 主进程代码示例：
/*
navigator.serviceWorker.ready.then(registration => {
  registration.active.postMessage({
    type: 'PREFETCH_INIT',
    config: {
      apiMatcher: '/api/*',
      defaultExpireTime: 5000,
      debug: true
    }
  });
});
*/