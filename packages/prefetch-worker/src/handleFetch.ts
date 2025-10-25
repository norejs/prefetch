import type { ServiceWorkerConfig, CacheItem } from './types.js';
import { createLogger } from './utils/logger.js';
import requestToKey from './utils/requestToKey.js';

// 请求头常量
export const HeadName = 'X-Prefetch-Request-Type';
export const HeadValue = 'prefetch';
export const ExpireTimeHeadName = 'X-Prefetch-Expire-Time';

// 全局处理器接口
export interface GlobalFetchHandler {
  (event: FetchEvent): void;
  configure(config: ServiceWorkerConfig): void;
  isInitialized(): boolean;
  clearCache(): void;
  getCacheStats(): { size: number; entries: number };
}

// 处理器状态接口
interface HandlerState {
  mode: 'pass-through' | 'active' | 'error';
  config: ServiceWorkerConfig | null;
  initialized: boolean;
  errorCount: number;
  lastError?: Error;
}

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

// ==================== 全局处理器实现 ====================

// 全局状态
let globalState: HandlerState & { activeHandler: any } = {
  mode: 'pass-through',
  config: null,
  initialized: false,
  errorCount: 0,
  activeHandler: null
};

/**
 * 主 fetch 事件处理器 - 支持状态切换
 */
function globalFetchHandler(event: FetchEvent): void {
  try {
    // pass-through 模式：直接放行
    if (globalState.mode === 'pass-through') {
      return;
    }

    // error 模式：记录错误并放行
    if (globalState.mode === 'error') {
      if (globalState.config?.debug) {
        console.warn('prefetch-worker: in error mode, passing through request', {
          url: event.request.url,
          errorCount: globalState.errorCount,
          lastError: globalState.lastError?.message
        });
      }
      return;
    }

    // active 模式：使用配置的处理器
    if (globalState.mode === 'active' && globalState.activeHandler) {
      globalState.activeHandler(event);
      return;
    }

    // 默认放行
    return;
  } catch (error) {
    // 捕获全局错误，切换到错误模式
    globalState.mode = 'error';
    globalState.errorCount++;
    globalState.lastError = error instanceof Error ? error : new Error(String(error));

    if (globalState.config?.debug) {
      console.error('prefetch-worker: global handler error', error);
    }

    // 错误时放行请求
    return;
  }
}





// 添加方法到全局处理器
Object.assign(globalFetchHandler, {
  configure: (config: ServiceWorkerConfig): void => {
    try {
      // 清理旧的处理器
      if (globalState.activeHandler && typeof globalState.activeHandler.clearCache === 'function') {
        globalState.activeHandler.clearCache();
      }

      // 创建新的处理器
      const newHandler = createFetchHandler(config);

      // 更新状态
      globalState.config = config;
      globalState.activeHandler = newHandler;
      globalState.mode = 'active';
      globalState.initialized = true;
      globalState.errorCount = 0;
      globalState.lastError = undefined;

      if (config.debug) {
        console.log('prefetch-worker: global handler configured', config);
      }
    } catch (error) {
      // 配置失败，切换到错误模式
      globalState.mode = 'error';
      globalState.errorCount++;
      globalState.lastError = error instanceof Error ? error : new Error(String(error));

      if (config.debug) {
        console.error('prefetch-worker: configuration failed', error);
      }

      throw error;
    }
  },
  isInitialized: (): boolean => {
    return globalState.initialized;
  },
  clearCache: (): void => {
    if (globalState.activeHandler && typeof globalState.activeHandler.clearCache === 'function') {
      globalState.activeHandler.clearCache();
    }
  },
  getCacheStats: (): { size: number; entries: number } => {
    if (globalState.activeHandler && typeof globalState.activeHandler.getCacheStats === 'function') {
      return globalState.activeHandler.getCacheStats();
    }
    return { size: 0, entries: 0 };
  }
});

/**
 * 创建全局 fetch 处理器
 * 在 Service Worker 启动时调用，立即注册但根据状态决定行为
 */
export function createGlobalFetchHandler(): GlobalFetchHandler {
  return globalFetchHandler as GlobalFetchHandler;
}