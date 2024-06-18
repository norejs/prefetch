import { createLogger } from 'utils/log';
import { default as defaultRequestToKey } from './utils/requestToKey';
declare var self: ServiceWorkerGlobalScope & {
    _setuped: symbol;
};

export const HeadName = 'X-Prefetch-Request-Type';
export const HeadValue = 'prefetch';
export const ExpireTimeHeadName = 'X-Prefetch-Expire-Time';

export type ICacheItem = {
    expire: number;
    response: Response;
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
    if ((self._setuped = setupSymbol)) {
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

    const logger = createLogger(debug);

    self.addEventListener('install', (event) => {
        if (autoSkipWaiting) {
            self.skipWaiting();
            self?.clients?.claim?.();
        }
    });

    self.addEventListener('fetch', function(_event) {
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
            const isApi = url?.match(apiMatcher);
            logger.info('prefetch: fetch', url, { isApi });
            if (!url || !isApi) {
                return;
            }
            event.respondWith(handleFetchEvent(event));
        } catch (error) {}
    });

    async function handleFetchEvent(event: FetchEvent) {
        try {
            const request = event.request.clone();
            const headers = request.headers;
            const isPreRequest = headers.get(HeadName) === HeadValue;
            const expireTime =
                Number(headers.get(ExpireTimeHeadName)) || defaultExpireTime;
            const cacheKey = await requestToKey(request.clone());

            const cache = preRequestCache.get(cacheKey);
            if (cache && !isPreRequest) {
                if (cache.expire && cache.expire > Date.now()) {
                    return cache.response.clone();
                } else {
                    preRequestCache.delete(cacheKey);
                    cachedNums--;
                }
            }
            const response = await fetch(request);
            logger.info('prefetch: response', response);
            if (
                isPreRequest &&
                response.status === 200 &&
                cacheKey &&
                expireTime
            ) {
                logger.info('prefetch: cacheKey', cacheKey);
                clearCacheWhenOversize();
                preRequestCache.set(cacheKey, {
                    expire: Date.now() + expireTime,
                    response: response.clone(),
                });
                cachedNums++;
            }
            return response;
        } catch (error) {
            return fetch(event.request);
        }
    }

    function clearCacheWhenOversize() {
        if (cachedNums > maxCacheSize) {
            return;
        }
        logger.info('clearCache');
        Object.keys(preRequestCache).forEach((key) => {
            const cache = preRequestCache.get(key);
            if (cache && cache.expire < Date.now()) {
                preRequestCache.delete(key);
                cachedNums--;
            }
        });
    }
}
