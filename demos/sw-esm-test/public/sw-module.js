// sw-module.js - 简化的 ES Module Service Worker
console.log('Module SW: 开始加载ES Module Service Worker');

// 导入 prefetch-worker ES 模块 (CDN方式)
import { initializePrefetchWorker, setupLifecycle } from 'http://localhost:18003/prefetch-worker.esm.js';

console.log('Module SW: ✅ prefetch-worker ES Module 导入成功');

// 初始化 prefetch-worker (不传入配置，等待主进程配置)
initializePrefetchWorker();
setupLifecycle();

console.log('Module SW: ✅ prefetch-worker 初始化完成，等待主进程配置');

// 消息处理器 - 仅处理 prefetch 相关消息
const messageHandler = async (event) => {
  console.log('收到消息:', event.data);

  // 处理 Prefetch 初始化
  if (event.data && event.data.type === 'PREFETCH_INIT') {
    console.log('🚀 处理 Prefetch 初始化请求...', event.data.config);

    try {
      // 模拟初始化过程
      await new Promise(resolve => setTimeout(resolve, 100));

      event.source.postMessage({
        type: 'PREFETCH_INIT_SUCCESS',
        config: event.data.config,
        message: 'Prefetch 初始化成功'
      });

      console.log('✅ Prefetch 初始化完成');

    } catch (error) {
      console.error('❌ Prefetch 初始化失败:', error);
      event.source.postMessage({
        type: 'PREFETCH_INIT_ERROR',
        error: error.message
      });
    }
  }

  // 处理 Prefetch 请求
  if (event.data && event.data.type === 'PREFETCH_REQUEST') {
    console.log('🌐 处理 Prefetch 请求:', event.data.url, event.data.options);

    // 记录预取请求，实际的 fetch 会由浏览器处理
    // 这里可以添加缓存逻辑、请求优化等
    
    console.log('📝 Prefetch 请求已记录，等待实际 fetch 调用...');
  }
};

self.addEventListener('message', messageHandler);

console.log('Module SW: ✅ ES Module Service Worker 加载完成');
console.log('Module SW: 🎯 Prefetch Worker 已准备就绪，等待主进程配置');