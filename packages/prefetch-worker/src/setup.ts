import { createLogger } from 'utils/log';
import { default as defaultRequestToKey } from './utils/requestToKey';
declare var self: ServiceWorkerGlobalScope & {
    _setuped: symbol;
    debug: boolean;
};

export const HeadName = 'X-Prefetch-Request-Type';
export const HeadValue = 'prefetch';
export const ExpireTimeHeadName = 'X-Prefetch-Expire-Time';

export type ICacheItem = {
    expire: number;
    response?: Response;
    requestPromise?: Promise<Response>;
};

export type ISetupWorker = {
    // 通过Url匹配是否是需要缓存的请求，匹配中的请求才有可能被缓存，是否缓存取决于请求头
    apiMatcher: RegExp;
    // 缓存的最大数量
    requestToKey?: (request: Request) => Promise<string>;
    // 默认的失效时间，单位毫秒, 默认为0
    defaultExpireTime?: number;
    // 是否允许跨域, 默认为false
    allowCrossOrigin?: boolean;
    // 是否自动跳过等待，默认为true
    autoSkipWaiting?: boolean;
    // 最大缓存数量, 默认为 100
    maxCacheSize?: number;
    debug?: boolean;
};

// 用于标记是否已经初始化
const setupSymbol = Symbol('setuped');
export default function setupWorker(props: ISetupWorker) {
    console.log('prefetch setupWorker');
    if (self._setuped === setupSymbol) {
        return;
    }

    self._setuped = setupSymbol;
    const preRequestCache: Map<string, ICacheItem> = new Map();
    let cachedNums = 0;
    const {
        apiMatcher,
        requestToKey = defaultRequestToKey,
        defaultExpireTime = 0,
        autoSkipWaiting = true,
        maxCacheSize = 100,
        debug = false,
    } = props;
    if(debug){
      self.debug = debug;
    }
    const logger = createLogger(debug);
    logger.info('prefetch: setupWorker', {
        apiMatcher,
        requestToKey,
        defaultExpireTime,
        autoSkipWaiting,
        maxCacheSize,
    });

    self.addEventListener('install', (event) => {
        if (autoSkipWaiting) {
            self.skipWaiting();
            self?.clients?.claim?.();
        }
    });

    self.addEventListener('fetch', function (_event) {
        try {
            const event = _event;
            const request = event.request;
            // Skip cross-origin requests, like those for Google Analytics.
            if (request.mode === 'navigate') {
                return;
            }

            // Opening the DevTools triggers the "only-if-cached" request
            // that cannot be handled by the worker. Bypass such requests.
            if (
                request.cache === 'only-if-cached' &&
                request.mode !== 'same-origin'
            ) {
                return;
            }
            const url = request?.url;
            const method = request?.method?.toLowerCase?.();
            const isApiMetod = ['get', 'post', 'patch'].includes(method);
            const isApi = url?.match(apiMatcher) || isApiMetod;
            if (!url || !isApi) {
                return;
            }
            event.respondWith(handleFetchEvent(event));
        } catch (error) {
            logger.error('fetch error', error);
        }
    });

    async function handleFetchEvent(event: FetchEvent) {
        try {
            const request = event.request.clone();
            const headers = request.headers;
            const method = request.method?.toLowerCase?.();
            const isPreRequest = headers.get(HeadName) === HeadValue;
            const expireTime =
                Number(headers.get(ExpireTimeHeadName)) || defaultExpireTime;
            
            // DELETE 方法不进行缓存，直接透传
            if (method === 'delete') {
                logger.info('prefetch: DELETE method, bypass cache', request.url);
                return fetch(event.request);
            }
            
            const cacheKey = await requestToKey(request.clone());
            logger.info('prefetch: cacheKey', request.url, cacheKey);
            if (!cacheKey) {
                return fetch(event.request);
            }

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
                        requestPromise: fetchPromise.then(response => {
                            // 请求成功后，更新缓存为 response
                            if (response.status === 200) {
                                const existingCache = preRequestCache.get(cacheKey);
                                if (existingCache && existingCache.expire > Date.now()) {
                                    preRequestCache.set(cacheKey, {
                                        expire: existingCache.expire,
                                        response: response.clone(),
                                    });
                                }
                            }
                            return response;
                        }).catch(error => {
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

    function clearCacheWhenOversize() {
        if (cachedNums <= maxCacheSize) {
            return;
        }
        logger.info('clearCache');
        preRequestCache.forEach((cache, key) => {
            if (cache && cache.expire < Date.now()) {
                preRequestCache.delete(key);
                cachedNums--;
            }
        });
    }
}
