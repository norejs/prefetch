/**
 * Prefetch Worker - ESM 模板
 * 
 * 使用 ESM 方式导入 prefetch-worker，适用于现代浏览器
 * 
 * 使用方法：
 * 1. 复制此文件到项目 public 目录
 * 2. 注册 Service Worker：navigator.serviceWorker.register('/service-worker.js')
 * 3. 主进程发送配置消息进行初始化
 */

// ==================== 配置区域 ====================
// 调试模式 - 可替换标识: {{DEBUG_MODE}}
const DEBUG_MODE = false;

// CDN 配置 - 可替换标识: {{CDN_BASE}}
const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@norejs/prefetch-worker@latest/dist';

// 本地路径 - 可替换标识: {{LOCAL_BASE}}  
const LOCAL_BASE = '/node_modules/@norejs/prefetch-worker/dist';

// ==================== 路径选择 ====================
// 根据调试模式选择路径：调试模式用本地，生产模式用 CDN
const basePath = DEBUG_MODE ? LOCAL_BASE : CDN_BASE;

if (DEBUG_MODE) {
  console.log('[PrefetchWorker] Using path:', basePath);
}

// ==================== 导入和初始化 ====================
// 初始化函数
async function initialize() {
  try {
    if (DEBUG_MODE) {
      console.log('[PrefetchWorker] Loading from:', basePath);
    }

    // 导入 prefetch-worker 核心功能
    const {
      setupLifecycle,
      initializePrefetchWorker
    } = await import(`${basePath}/service-worker.esm.js`);

    if (DEBUG_MODE) {
      console.log('[PrefetchWorker] ESM modules loaded successfully');
    }

    // 设置生命周期管理 - 可替换标识: {{LIFECYCLE_CONFIG}}
    const cleanupLifecycle = setupLifecycle({
      autoSkipWaiting: true,
      autoClaimClients: true,
      debug: DEBUG_MODE
    });

    // 初始化预取功能（等待主进程配置）
    const cleanupPrefetch = initializePrefetchWorker();

    if (DEBUG_MODE) {
      console.log('[PrefetchWorker] Initialization complete, waiting for main thread config');
    }

    // 返回清理函数
    return () => {
      cleanupPrefetch();
      cleanupLifecycle();
    };

  } catch (error) {
    console.error('[PrefetchWorker] Failed to initialize:', error);
    throw error;
  }
}

// 立即初始化
initialize().then(cleanup => {
  // 存储清理函数供外部使用
  self.prefetchWorkerCleanup = cleanup;
}).catch(error => {
  console.error('[PrefetchWorker] Initialization failed:', error);
});

// ==================== 清理函数 ====================
// 清理函数由 initialize() 返回并存储在 self.prefetchWorkerCleanup

// ==================== 自定义扩展区域 ====================
// 可替换标识: {{CUSTOM_LISTENERS}}
// 在这里添加自定义的消息监听器或其他 Service Worker 功能

// ==================== 错误处理 ====================
if (DEBUG_MODE) {
  self.addEventListener('error', (event) => {
    console.error('[PrefetchWorker] Service Worker error:', event.error);
  });

  self.addEventListener('unhandledrejection', (event) => {
    console.error('[PrefetchWorker] Unhandled rejection:', event.reason);
  });
}