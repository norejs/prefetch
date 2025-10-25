// modules/cache-manager-classic.js - 传统模式缓存管理器
console.log('Cache Manager Classic: 加载传统缓存管理器');

// 全局缓存管理器
self.cacheManager = {
    cacheName: 'classic-sw-cache-v1',
    
    // 获取缓存信息
    getInfo: async function() {
        try {
            const cacheNames = await caches.keys();
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            
            return {
                type: 'classic',
                cacheName: this.cacheName,
                availableCaches: cacheNames,
                cachedRequests: keys.length,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Cache Manager Classic: 获取缓存信息失败', error);
            return {
                type: 'classic',
                error: error.message,
                lastUpdated: new Date().toISOString()
            };
        }
    },
    
    // 缓存响应
    put: async function(request, response) {
        try {
            const cache = await caches.open(this.cacheName);
            await cache.put(request, response.clone());
            console.log('Cache Manager Classic: 响应已缓存', request.url);
            return true;
        } catch (error) {
            console.error('Cache Manager Classic: 缓存响应失败', error);
            return false;
        }
    },
    
    // 获取缓存响应
    get: async function(request) {
        try {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(request);
            
            if (response) {
                console.log('Cache Manager Classic: 从缓存返回响应', request.url);
                return response;
            }
            
            return null;
        } catch (error) {
            console.error('Cache Manager Classic: 获取缓存响应失败', error);
            return null;
        }
    },
    
    // 删除缓存项
    delete: async function(request) {
        try {
            const cache = await caches.open(this.cacheName);
            const deleted = await cache.delete(request);
            console.log('Cache Manager Classic: 缓存项删除', deleted ? '成功' : '失败', request.url);
            return deleted;
        } catch (error) {
            console.error('Cache Manager Classic: 删除缓存项失败', error);
            return false;
        }
    },
    
    // 清理过期缓存
    cleanup: async function() {
        try {
            const cacheNames = await caches.keys();
            const deletePromises = cacheNames
                .filter(name => name !== this.cacheName && name.startsWith('classic-sw-cache'))
                .map(name => caches.delete(name));
            
            await Promise.all(deletePromises);
            console.log('Cache Manager Classic: 缓存清理完成');
            return true;
        } catch (error) {
            console.error('Cache Manager Classic: 缓存清理失败', error);
            return false;
        }
    },
    
    // 缓存优先策略
    cacheFirst: async function(request) {
        try {
            // 先尝试从缓存获取
            const cachedResponse = await this.get(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // 缓存未命中，从网络获取
            const networkResponse = await fetch(request);
            
            // 缓存成功的响应
            if (networkResponse.ok) {
                await this.put(request, networkResponse);
            }
            
            return networkResponse;
        } catch (error) {
            console.error('Cache Manager Classic: 缓存优先策略失败', error);
            throw error;
        }
    },
    
    // 网络优先策略
    networkFirst: async function(request) {
        try {
            // 先尝试从网络获取
            const networkResponse = await fetch(request);
            
            // 缓存成功的响应
            if (networkResponse.ok) {
                await this.put(request, networkResponse);
            }
            
            return networkResponse;
        } catch (error) {
            console.warn('Cache Manager Classic: 网络请求失败，尝试缓存', error.message);
            
            // 网络失败，尝试从缓存获取
            const cachedResponse = await this.get(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            throw error;
        }
    },
    
    // 获取缓存统计
    getStats: async function() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            
            const stats = {
                type: 'classic',
                totalRequests: keys.length,
                cacheSize: 0,
                requests: []
            };
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const size = response.headers.get('content-length') || 0;
                    stats.cacheSize += parseInt(size) || 0;
                    stats.requests.push({
                        url: request.url,
                        method: request.method,
                        size: size
                    });
                }
            }
            
            return stats;
        } catch (error) {
            console.error('Cache Manager Classic: 获取缓存统计失败', error);
            return { 
                type: 'classic',
                error: error.message 
            };
        }
    }
};

console.log('Cache Manager Classic: ✅ 传统缓存管理器加载完成');