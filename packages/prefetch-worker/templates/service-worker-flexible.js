/**
 * Prefetch Worker - 灵活配置模板
 * 
 * 支持多种环境和配置方式的 Service Worker 模板
 * 
 * 环境检测：
 * - 开发环境：localhost, 127.0.0.1, 包含 'dev' 的域名, 有端口号
 * - 测试环境：包含 'test', 'staging', 'qa' 的域名
 * - 生产环境：其他情况
 */

console.log('Service Worker: Loading with flexible configuration');

// === 编译时环境变量 ===
const NODE_ENV = '__NODE_ENV__'; // 'development' | 'test' | 'production'
const PACKAGE_VERSION = '__PACKAGE_VERSION__'; // 包版本号
const IMPORT_METHOD = '__IMPORT_METHOD__'; // 'esm' | 'importScripts'

// === 环境检测 ===
const isDevelopment = NODE_ENV === 'development';
const isTesting = NODE_ENV === 'test';
const isProduction = NODE_ENV === 'production';

// === CDN 地址配置 ===
let CDN_BASE;

if (isDevelopment) {
  // 开发环境：使用本地开发服务器
  CDN_BASE = 'http://localhost:18003';
} else if (isTesting) {
  // 测试环境：使用 esm.sh 的 beta 版本
  CDN_BASE = `https://esm.sh/@norejs/prefetch-worker@beta`;
} else {
  // 生产环境：使用 esm.sh 的稳定版本
  CDN_BASE = `https://esm.sh/@norejs/prefetch-worker@${PACKAGE_VERSION || 'latest'}`;
}

console.log(`Service Worker: Environment - ${NODE_ENV}`);
console.log(`Service Worker: CDN Base - ${CDN_BASE}`);
console.log(`Service Worker: Import method - ${IMPORT_METHOD}`);

// === 动态导入 ===
if (IMPORT_METHOD === 'esm') {
  // ESM 方式导入
  import(`${CDN_BASE}/dist/prefetch-worker.esm.js`)
    .then(({ setupLifecycle, initializePrefetchWorker }) => {
      console.log('Service Worker: ESM modules loaded successfully');
      
      // 设置生命周期管理
      const cleanupLifecycle = setupLifecycle({
        autoSkipWaiting: true,
        autoClaimClients: true
      });

      // 监听主进程初始化 - 不传配置参数，等待主进程发送 PREFETCH_INIT 消息
      const cleanupPrefetch = initializePrefetchWorker();

      console.log('Service Worker: Prefetch worker setup complete, waiting for configuration from main thread');

      // 保存清理函数到全局
      self.prefetchWorkerCleanup = () => {
        cleanupPrefetch();
        cleanupLifecycle();
      };
    })
    .catch((error) => {
      console.error('Service Worker: Failed to load ESM modules:', error);
      // 降级到 importScripts
      fallbackToImportScripts();
    });
} else {
  // importScripts 方式导入
  loadWithImportScripts();
}

// === 降级处理 ===
function fallbackToImportScripts() {
  console.log('Service Worker: Falling back to importScripts method');
  loadWithImportScripts();
}

function loadWithImportScripts() {
  try {
    // 使用 importScripts 导入
    importScripts(`${CDN_BASE}/dist/prefetch-worker.umd.js`);
    
    // 检查是否成功导入
    if (typeof PrefetchWorker === 'undefined') {
      throw new Error('PrefetchWorker not found after importScripts');
    }
    
    console.log('Service Worker: UMD module loaded successfully');
    
    // 设置生命周期管理
    const cleanupLifecycle = PrefetchWorker.setupLifecycle({
      autoSkipWaiting: true,
      autoClaimClients: true
    });

    // 监听主进程初始化 - 不传配置参数，等待主进程发送 PREFETCH_INIT 消息
    const cleanupPrefetch = PrefetchWorker.initializePrefetchWorker();

    console.log('Service Worker: Prefetch worker setup complete, waiting for configuration from main thread');

    // 保存清理函数到全局
    self.prefetchWorkerCleanup = () => {
      cleanupPrefetch();
      cleanupLifecycle();
    };
    
  } catch (error) {
    console.error('Service Worker: Failed to load with importScripts:', error);
    console.error('Service Worker: Prefetch functionality will not be available');
  }
}

// === 可选：添加自定义逻辑 ===
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CUSTOM_MESSAGE') {
    console.log('Service Worker: Custom message received', event.data);
    // 处理自定义消息
  }
  
  // 环境信息查询
  if (event.data?.type === 'GET_ENVIRONMENT_INFO') {
    const source = event.source || event.ports?.[0];
    if (source) {
      source.postMessage({
        type: 'ENVIRONMENT_INFO_RESPONSE',
        environment: {
          nodeEnv: NODE_ENV,
          packageVersion: PACKAGE_VERSION,
          isDevelopment,
          isTesting,
          isProduction,
          cdnBase: CDN_BASE,
          importMethod: IMPORT_METHOD
        }
      });
    }
  }
});

// === 错误处理 ===
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker: Ready and waiting for requests');