import type { ServiceWorkerConfig, CacheItem } from './types.js';
import { createLogger } from './utils/logger.js';
import requestToKey from './utils/requestToKey.js';

// 请求头常量
export const HeadName = 'X-Prefetch-Request-Type';
export const HeadValue = 'prefetch';
export const ExpireTimeHeadName = 'X-Prefetch-Expire-Time';

/**
 * 创建 fetch 事件处理器
 * 直接返回可以作为 addEventListener('fetch', handler) 的函数
 */
export function createFetchHandler(config: ServiceWorkerConfig): (event: FetchEvent) => void {
  const preRequestCache = new Map<string, CacheItem>();
  let cachedNums = 0;

  const {
    apiMatcher,
    requestToKey: customRequestToKey = requestToKey,
    defaultExpireTime = 0,
    maxCacheSize = 100,
    debug = false,
    allowCrossOrigin = false
  } = config;

  const logger = createLogger(debug);

  logger.info('prefetch: createFetchHandler', {
    apiMatcher,
    requestToKey: customRequestToKey,
    defaultExpireTime,
    maxCacheSize,
    allowCrossOrigin
  });

  /**
   * 主 fetch 事件处理器 - 直接作为 addEventListener 的回调
   */
  function fetchEventHandler(event: FetchEvent): void {
    try {
      const request = event.request;

      // Skip cross-origin requests, like those for Google Analytics.
      if (request.mode === 'navigate') return;

      // Opening the DevTools triggers the "only-if-cached" request
      // that cannot be handled by the worker. Bypass such requests.
      if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

      const url = request?.url;
      const method = request?.method?.toLowerCase();
      const isApiMethod = ['get', 'post', 'patch'].includes(method);

      // 检查是否匹配 API 规则
      let isApi = false;
      if (typeof apiMatcher === 'string') {
        // 字符串匹配，支持通配符
        const pattern = apiMatcher.replace(/\*/g, '.*');
        const regex = new RegExp(pattern);
        isApi = regex.test(url || '');
      } else if (apiMatcher instanceof RegExp) {
        // 正则表达式匹配
        isApi = apiMatcher.test(url || '');
      } else {
        // 默认按方法匹配
        isApi = isApiMethod;
      }

      if (!url || !isApi) return;

      // 使用 event.respondWith 处理匹配的请求
      event.respondWith(handleApiRequest(event));
    } catch (error) {
      logger.error('fetch error', error);
      // 发生错误时，让请求正常通过
      return;
    }
  }

  /**
   * 处理 API 请求
   */
  async function handleApiRequest(event: FetchEvent): Promise<Response> {
    try {
      const request = event.request.clone();
      const headers = request.headers;
      const method = request.method?.toLowerCase();
      const isPreRequest = headers.get(HeadName) === HeadValue;
      const expireTime = Number(headers.get(ExpireTimeHeadName)) || defaultExpireTime;

      // DELETE 方法不进行缓存，直接透传
      if (method === 'delete') {
        logger.info('prefetch: DELETE method, bypass cache', request.url);
        return fetch(event.request);
      }

      const cacheKey = await customRequestToKey(request.clone());
      logger.info('prefetch: cacheKey', request.url, cacheKey);

      if (!cacheKey) return fetch(event.request);

      const cache = preRequestCache.get(cacheKey);

      // 检查是否有有效的缓存（不管是预请求还是普通请求）
      if (cache && cache.expire > Date.now()) {
        // 如果有完成的响应，直接返回
        if (cache.response) {
          logger.info('prefetch: cache hit (response)', request.url);
          return cache.response.clone();
        }

        // 如果有正在进行的请求，等待并复用
        if (cache.requestPromise) {
          logger.info('prefetch: cache hit (promise)', request.url);
          try {
            const response = await cache.requestPromise;
            return response.clone();
          } catch (error) {
            // 如果正在进行的请求失败，清除缓存并重新发起请求
            preRequestCache.delete(cacheKey);
            cachedNums--;
            logger.error('prefetch: cached promise failed', error);
            return fetch(event.request.clone());
          }
        }
      } else if (cache && cache.expire <= Date.now()) {
        // 缓存过期，清除
        preRequestCache.delete(cacheKey);
        cachedNums--;
      }

      // 创建新的请求
      const fetchPromise = fetch(request.clone());

      // 如果缓存中没有这个请求或请求已过期，创建新的缓存项
      if (!cache || cache.expire <= Date.now()) {
        const newExpireTime = isPreRequest && expireTime ? expireTime : defaultExpireTime;

        if (newExpireTime > 0) {
          logger.info('prefetch: creating new cache entry', request.url);
          clearCacheWhenOversize();

          // 创建带有 requestPromise 的缓存项，以便其他并发请求可以复用
          preRequestCache.set(cacheKey, {
            expire: Date.now() + newExpireTime,
            requestPromise: fetchPromise.then((response) => {
              const returnResponse = response.clone();

              // 请求成功后，更新缓存中的 response
              if (response.status === 200) {
                const existingCache = preRequestCache.get(cacheKey);
                if (existingCache && existingCache.expire > Date.now()) {
                  preRequestCache.set(cacheKey, {
                    expire: existingCache.expire,
                    response: response.clone()
                  });
                }
              }

              return returnResponse;
            }).catch((error) => {
              // 请求失败，清除缓存
              preRequestCache.delete(cacheKey);
              cachedNums--;
              throw error;
            })
          });

          cachedNums++;
        }
      }

      // 等待请求完成并返回响应
      try {
        const response = await fetchPromise;
        logger.info('prefetch: response received', response.status, request.url);
        return response;
      } catch (error) {
        logger.error('prefetch: fetch failed', error);
        throw error;
      }
    } catch (error) {
      logger.error('prefetch: error', error);
      return fetch(event.request);
    }
  }

  /**
   * 清理过期缓存
   */
  function clearCacheWhenOversize() {
    if (cachedNums <= maxCacheSize) return;

    logger.info('clearCache');
    preRequestCache.forEach((cache, key) => {
      if (cache && cache.expire < Date.now()) {
        preRequestCache.delete(key);
        cachedNums--;
      }
    });
  }

  // 添加清理和统计方法到处理器函数上
  Object.assign(fetchEventHandler, {
    clearCache: () => {
      preRequestCache.clear();
      cachedNums = 0;
    },
    getCacheStats: () => ({
      size: cachedNums,
      entries: preRequestCache.size
    })
  });

  return fetchEventHandler;
}