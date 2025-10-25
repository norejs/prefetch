// sw-module.js - 简化的 ES Module Service Worker
console.log('Module SW: 开始加载ES Module Service Worker');

// 导入 prefetch-worker ES 模块 (CDN方式)
import { initializePrefetchWorker } from 'http://localhost:18003/prefetch-worker.esm.js';

console.log('Module SW: ✅ prefetch-worker ES Module 导入成功');

// 初始化 prefetch-worker (不传入配置，等待主进程配置)
initializePrefetchWorker();
console.log('Module SW: ✅ prefetch-worker 初始化完成，等待主进程配置');

console.log('Module SW: ✅ ES Module Service Worker 加载完成');