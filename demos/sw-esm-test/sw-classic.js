// sw-classic.js - 传统Service Worker (使用importScripts)
console.log('Classic SW: 开始加载传统Service Worker');

// 使用importScripts导入模块
try {
    importScripts('./modules/utils-classic.js');
    importScripts('./modules/cache-manager-classic.js');
    console.log('Classic SW: ✅ 所有模块导入成功');
} catch (error) {
    console.error('Classic SW: ❌ 模块导入失败:', error);
}

// 安装事件
self.addEventListener('install', (event) => {
    console.log('Classic SW: 安装中...');
    self.skipWaiting();
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('Classic SW: 激活中...');
    event.waitUntil(
        self.clients.claim().then(() => {
            console.log('Classic SW: ✅ 已激活并控制所有客户端');
            
            // 通知客户端SW已准备就绪
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_READY',
                        swType: 'classic',
                        timestamp: Date.now()
                    });
                });
            });
        })
    );
});

// Fetch事件处理
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 拦截API请求
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }
    
    // 其他请求直接透传
});

// 处理API请求
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams;
    
    console.log('Classic SW: 处理API请求:', pathname);
    
    let responseData = {
        swType: 'classic',
        timestamp: Date.now(),
        pathname: pathname,
        method: request.method
    };
    
    switch (pathname) {
        case '/api/test':
            responseData.message = 'Classic Service Worker 基础测试成功';
            responseData.type = searchParams.get('type') || 'unknown';
            
            // 使用导入的工具函数（如果可用）
            if (typeof self.classicUtils !== 'undefined') {
                responseData.utils = self.classicUtils.getInfo();
            }
            break;
            
        case '/api/module':
            responseData.message = 'Classic Service Worker 模块功能测试';
            responseData.note = '使用 importScripts 导入的模块';
            
            // 使用缓存管理器（如果可用）
            if (typeof self.cacheManager !== 'undefined') {
                responseData.cacheInfo = await self.cacheManager.getInfo();
            }
            break;
            
        case '/api/importmap':
            responseData.message = 'Classic Service Worker 不支持 Import Maps';
            responseData.note = 'Import Maps 仅在 ES Module 模式下可用';
            responseData.alternative = '使用 importScripts 替代';
            break;
            
        default:
            responseData.message = 'Unknown API endpoint';
            responseData.error = 'Endpoint not found';
    }
    
    return new Response(JSON.stringify(responseData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-SW-Type': 'classic'
        }
    });
}

// 消息处理
self.addEventListener('message', (event) => {
    console.log('Classic SW: 收到消息:', event.data);
    
    if (event.data && event.data.type === 'TEST_MESSAGE') {
        // 回复消息
        event.source.postMessage({
            type: 'MESSAGE_REPLY',
            swType: 'classic',
            originalMessage: event.data,
            reply: 'Classic Service Worker 收到消息',
            timestamp: Date.now()
        });
    }
});

console.log('Classic SW: ✅ Service Worker 加载完成');