// modules/cache-manager-esm.js - ES Module 缓存管理器
console.log('Cache Manager ESM: 加载ES Module缓存管理器');

import { logger } from './utils-esm.js';

export class CacheManager {
    constructor(cacheName = 'esm-sw-cache-v1') {
        this.cacheName = cacheName;
        this.initialized = false;
        logger.log(`缓存管理器创建: ${cacheName}`);
    }
    
    // 初始化
    async initialize() {
        try {
            await caches.open(this.cacheName);
            this.initialized = true;
            logger.log('缓存管理器初始化成功');
            return true;
        } catch (error) {
            logger.error('缓存管理器初始化失败', error);
            return false;
        }
    }
    
    // 获取缓存信息
    async getInfo() {
        try {
            const cacheNames = await caches.keys();
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            
            return {
                type: 'esm',
                cacheName: this.cacheName,
                initialized: this.initialized,
                availableCaches: cacheNames,
                cachedRequests: keys.length,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            logger.error('获取缓存信息失败', error);
            return {
                type: 'esm',
                error: error.message,
                lastUpdated: new Date().toISOString()
            };
        }
    }
    
    // 缓存响应
    async put(request, response) {
        try {
            // 检查 URL 协议，只缓存 http/https 请求
            const url = new URL(request.url);
            if (!['http:', 'https:'].includes(url.protocol)) {
                logger.log(`跳过缓存不支持的协议: ${url.protocol} - ${request.url}`);
                return false;
            }
            
            const cache = await caches.open(this.cacheName);
            await cache.put(request, response.clone());
            logger.log(`响应已缓存: ${request.url}`);
            return true;
        } catch (error) {
            logger.error('缓存响应失败', error);
            return false;
        }
    }
    
    // 获取缓存响应
    async get(request) {
        try {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(request);
            
            if (response) {
                logger.log(`从缓存返回响应: ${request.url}`);
                return response;
            }
            
            return null;
        } catch (error) {
            logger.error('获取缓存响应失败', error);
            return null;
        }
    }
    
    // 删除缓存项
    async delete(request) {
        try {
            const cache = await caches.open(this.cacheName);
            const deleted = await cache.delete(request);
            logger.log(`缓存项删除${deleted ? '成功' : '失败'}: ${request.url}`);
            return deleted;
        } catch (error) {
            logger.error('删除缓存项失败', error);
            return false;
        }
    }
    
    // 清理过期缓存
    async cleanup() {
        try {
            const cacheNames = await caches.keys();
            const deletePromises = cacheNames
                .filter(name => name !== this.cacheName && name.startsWith('esm-sw-cache'))
                .map(name => caches.delete(name));
            
            const results = await Promise.all(deletePromises);
            logger.log(`缓存清理完成，删除了 ${results.filter(Boolean).length} 个旧缓存`);
            return true;
        } catch (error) {
            logger.error('缓存清理失败', error);
            return false;
        }
    }
    
    // 缓存优先策略
    async cacheFirst(request) {
        try {
            // 检查 URL 协议，只处理 http/https 请求
            const url = new URL(request.url);
            if (!['http:', 'https:'].includes(url.protocol)) {
                logger.log(`跳过缓存不支持的协议: ${url.protocol} - ${request.url}`);
                return fetch(request);
            }
            
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
            logger.error('缓存优先策略失败', error);
            throw error;
        }
    }
    
    // 网络优先策略
    async networkFirst(request) {
        try {
            // 先尝试从网络获取
            const networkResponse = await fetch(request);
            
            // 缓存成功的响应
            if (networkResponse.ok) {
                await this.put(request, networkResponse);
            }
            
            return networkResponse;
        } catch (error) {
            logger.warn(`网络请求失败，尝试缓存: ${error.message}`);
            
            // 网络失败，尝试从缓存获取
            const cachedResponse = await this.get(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            throw error;
        }
    }
    
    // 仅网络策略
    async networkOnly(request) {
        return fetch(request);
    }
    
    // 仅缓存策略
    async cacheOnly(request) {
        const cachedResponse = await this.get(request);
        if (!cachedResponse) {
            throw new Error('No cached response available');
        }
        return cachedResponse;
    }
    
    // 获取缓存统计
    async getStats() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            
            const stats = {
                type: 'esm',
                cacheName: this.cacheName,
                totalRequests: keys.length,
                cacheSize: 0,
                requests: [],
                byMethod: {},
                byType: {}
            };
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const size = parseInt(response.headers.get('content-length') || '0');
                    const contentType = response.headers.get('content-type') || 'unknown';
                    
                    stats.cacheSize += size;
                    stats.requests.push({
                        url: request.url,
                        method: request.method,
                        size: size,
                        contentType: contentType
                    });
                    
                    // 按方法统计
                    stats.byMethod[request.method] = (stats.byMethod[request.method] || 0) + 1;
                    
                    // 按类型统计
                    const type = contentType.split('/')[0];
                    stats.byType[type] = (stats.byType[type] || 0) + 1;
                }
            }
            
            return stats;
        } catch (error) {
            logger.error('获取缓存统计失败', error);
            return { 
                type: 'esm',
                error: error.message 
            };
        }
    }
    
    // 批量操作
    async batchPut(requests) {
        const results = [];
        for (const { request, response } of requests) {
            const result = await this.put(request, response);
            results.push({ request: request.url, success: result });
        }
        return results;
    }
    
    // 批量删除
    async batchDelete(requests) {
        const results = [];
        for (const request of requests) {
            const result = await this.delete(request);
            results.push({ request: request.url, success: result });
        }
        return results;
    }
}

// 导出默认实例
export const defaultCacheManager = new CacheManager();

console.log('Cache Manager ESM: ✅ ES Module缓存管理器加载完成');