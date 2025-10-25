// cache-helper.js - 缓存辅助函数
console.log('CacheHelper: 缓存辅助函数加载中...');

// 缓存名称
const CACHE_NAME = 'importscripts-demo-v1';

// 获取缓存信息
self.getCacheInfo = async function() {
    try {
        const cacheNames = await caches.keys();
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        
        return {
            availableCaches: cacheNames,
            currentCache: CACHE_NAME,
            cachedRequests: keys.length,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('CacheHelper: 获取缓存信息失败', error);
        return {
            error: error.message,
            lastUpdated: new Date().toISOString()
        };
    }
};

// 缓存响应
self.cacheResponse = async function(request, response) {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        console.log('CacheHelper: 响应已缓存', request.url);
        return true;
    } catch (error) {
        console.error('CacheHelper: 缓存响应失败', error);
        return false;
    }
};

// 从缓存获取响应
self.getCachedResponse = async function(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(request);
        
        if (response) {
            console.log('CacheHelper: 从缓存返回响应', request.url);
            return response;
        }
        
        return null;
    } catch (error) {
        console.error('CacheHelper: 获取缓存响应失败', error);
        return null;
    }
};

// 清理过期缓存
self.cleanupCache = async function() {
    try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name));
        
        await Promise.all(deletePromises);
        console.log('CacheHelper: 缓存清理完成');
        return true;
    } catch (error) {
        console.error('CacheHelper: 缓存清理失败', error);
        return false;
    }
};

// 缓存统计
self.getCacheStats = async function() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        
        const stats = {
            totalRequests: keys.length,
            cacheSize: 0,
            requests: []
        };
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const size = response.headers.get('content-length') || 0;
                stats.cacheSize += parseInt(size);
                stats.requests.push({
                    url: request.url,
                    method: request.method,
                    size: size
                });
            }
        }
        
        return stats;
    } catch (error) {
        console.error('CacheHelper: 获取缓存统计失败', error);
        return { error: error.message };
    }
};

console.log('CacheHelper: ✓ 缓存辅助函数加载完成');