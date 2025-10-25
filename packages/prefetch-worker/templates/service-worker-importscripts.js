/**
 * Prefetch Worker - importScripts 模板
 * 
 * 这是一个完整的 Service Worker 模板，使用 importScripts 方式导入 prefetch-worker
 * 适用于所有支持 Service Worker 的浏览器环境
 * 
 * 使用方法：
 * 1. 将此文件复制到你的项目 public 目录
 * 2. 在主进程中注册：navigator.serviceWorker.register('/service-worker.js')
 * 3. 在主进程中发送配置消息进行初始化
 */

console.log('Service Worker: Loading with importScripts support');

// 编译时环境变量（构建工具会替换这些变量）
const NODE_ENV = '__NODE_ENV__'; // 'development' | 'test' | 'production'
const PACKAGE_VERSION = '__PACKAGE_VERSION__'; // 包版本号

// 根据编译时环境变量选择 CDN 地址
let CDN_BASE;

if (NODE_ENV === 'development') {
  // 开发环境：使用本地开发服务器
  CDN_BASE = 'http://localhost:18003';
} else if (NODE_ENV === 'test') {
  // 测试环境：使用 esm.sh 的 beta 版本
  CDN_BASE = `https://esm.sh/@norejs/prefetch-worker@beta`;
} else {
  // 生产环境：使用 esm.sh 的稳定版本
  CDN_BASE = `https://esm.sh/@norejs/prefetch-worker@${PACKAGE_VERSION || 'latest'}`;
}

console.log(`Service Worker: Environment - ${NODE_ENV}`);
console.log(`Service Worker: CDN Base - ${CDN_BASE}`);

// 导入 prefetch-worker UMD 版本
importScripts(`${CDN_BASE}/dist/prefetch-worker.umd.js`);

// 检查是否成功导入
if (typeof PrefetchWorker === 'undefined') {
  console.error('Service Worker: Failed to load PrefetchWorker');
} else {
  console.log('Service Worker: PrefetchWorker loaded successfully');
  
  // 设置生命周期管理
  const cleanupLifecycle = PrefetchWorker.setupLifecycle({
    autoSkipWaiting: true,
    autoClaimClients: true
  });

  // 监听主进程初始化 - 不传配置参数，等待主进程发送 PREFETCH_INIT 消息
  const cleanupPrefetch = PrefetchWorker.initializePrefetchWorker();

  console.log('Service Worker: Prefetch worker setup complete, waiting for configuration from main thread');

  // 组合清理函数（可选，用于手动清理）
  self.prefetchWorkerCleanup = () => {
    cleanupPrefetch();
    cleanupLifecycle();
  };
  
  console.log('Service Worker: Prefetch worker initialized, waiting for configuration from main thread');
}

// 可选：添加自定义逻辑
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CUSTOM_MESSAGE') {
    console.log('Service Worker: Custom message received', event.data);
    // 处理自定义消息
  }
});

// 可选：添加其他 Service Worker 功能
// 例如：推送通知、后台同步等

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker: Ready and waiting for requests');