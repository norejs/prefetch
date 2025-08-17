import setupWorker from './setup';

declare var self: ServiceWorkerGlobalScope;

// 标记是否已经初始化
let isInitialized = false;

// 默认配置
const defaultConfig = {
    apiMatcher: '/api'
};

// 监听来自主线程的消息
self.addEventListener('message', (event) => {
    console.log('prefetch-worker: received message', event.data);
    
    if (event.data && event.data.type === 'PREFETCH_INIT') {
        try {
            if (isInitialized) {
                console.log('prefetch-worker: already initialized, skipping');
                return;
            }
            
            const config = { ...defaultConfig, ...event.data.config };
            console.log('prefetch-worker: initializing with config', config);
            
            // 将字符串转换为正则表达式
            const apiMatcher = typeof config.apiMatcher === 'string' 
                ? new RegExp(config.apiMatcher) 
                : config.apiMatcher;
            
            setupWorker({
                apiMatcher,
                ...config
            });
            
            isInitialized = true;
            console.log('prefetch-worker: initialization completed');
            
            // 发送初始化完成的消息回主线程
            if (event.source) {
                event.source.postMessage({
                    type: 'PREFETCH_INIT_SUCCESS',
                    config: config
                });
            }
        } catch (error) {
            console.error('prefetch-worker: initialization failed', error);
            
            // 发送初始化失败的消息回主线程
            if (event.source) {
                event.source.postMessage({
                    type: 'PREFETCH_INIT_ERROR',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            
            self.registration.unregister();
        }
    }
});

// 如果没有收到初始化消息，使用默认配置自动初始化
self.addEventListener('install', () => {
    console.log('prefetch-worker: install event');
    
    // 延迟一下，给主线程发送初始化消息的机会
    setTimeout(() => {
        if (!isInitialized) {
            console.log('prefetch-worker: auto-initializing with default config');
            try {
                const apiMatcher = new RegExp(defaultConfig.apiMatcher);
                setupWorker({
                    apiMatcher
                });
                isInitialized = true;
                console.log('prefetch-worker: auto-initialization completed');
            } catch (error) {
                console.error('prefetch-worker: auto-initialization failed', error);
                self.registration.unregister();
            }
        }
    }, 1000); // 1秒延迟
});

console.log('prefetch-worker: loaded, waiting for initialization message');
