// sw-module.js - ES Module Service Worker
console.log('Module SW: 开始加载ES Module Service Worker');

// 使用ES Module导入
import { moduleUtils } from './modules/utils-esm.js';
import { CacheManager } from './modules/cache-manager-esm.js';
import { ApiHandler } from './modules/api-handler-esm.js';
import * as prefetch from "./modules/prefetch-worker.js"
console.log('prefetch',prefetch)
console.log('Module SW: ✅ ES Module 导入成功');

// 初始化模块
const cacheManager = new CacheManager('esm-sw-cache-v1');
const apiHandler = new ApiHandler(cacheManager);

// 安装事件
self.addEventListener('install', (event) => {
    console.log('Module SW: 安装中...');
    
    event.waitUntil(
        (async () => {
            // 初始化缓存
            await cacheManager.initialize();
            console.log('Module SW: 缓存管理器初始化完成');
            
            // 跳过等待
            self.skipWaiting();
        })()
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('Module SW: 激活中...');
    
    event.waitUntil(
        (async () => {
            // 清理旧缓存
            await cacheManager.cleanup();
            
            // 控制所有客户端
            await self.clients.claim();
            console.log('Module SW: ✅ 已激活并控制所有客户端');
            
            // 通知客户端SW已准备就绪
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_READY',
                    swType: 'module',
                    timestamp: Date.now(),
                    features: {
                        esModules: true,
                        dynamicImport: true,
                        topLevelAwait: true
                    }
                });
            });
        })()
    );
});

// Fetch事件处理
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 拦截API请求
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(apiHandler.handleRequest(event.request));
        return;
    }
    
    // 静态资源缓存策略
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
        event.respondWith(cacheManager.cacheFirst(event.request));
        return;
    }
    
    // 其他请求直接透传
});

// 消息处理
self.addEventListener('message', async (event) => {
    console.log('Module SW: 收到消息:', event.data);
    
    if (event.data && event.data.type === 'TEST_MESSAGE') {
        // 使用动态导入测试
        try {
            const { dynamicFeature } = await import('./modules/dynamic-feature.js');
            const result = dynamicFeature(event.data.data);
            
            // 回复消息
            event.source.postMessage({
                type: 'MESSAGE_REPLY',
                swType: 'module',
                originalMessage: event.data,
                reply: 'ES Module Service Worker 收到消息',
                dynamicResult: result,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Module SW: 动态导入失败:', error);
            event.source.postMessage({
                type: 'MESSAGE_ERROR',
                swType: 'module',
                error: error.message,
                timestamp: Date.now()
            });
        }
    }
});

// 错误处理
self.addEventListener('error', (event) => {
    console.error('Module SW: 全局错误:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Module SW: 未处理的Promise拒绝:', event.reason);
});

console.log('Module SW: ✅ ES Module Service Worker 加载完成');