// Service Worker for Travel Booking App
console.log('Travel Booking SW: 开始加载 Service Worker')

// 导入 prefetch-worker
importScripts('https://unpkg.com/@norejs/prefetch-worker@latest/dist/prefetch-worker.umd.js')

// 初始化 prefetch worker
if (typeof PrefetchWorker !== 'undefined') {
  console.log('Travel Booking SW: 初始化 PrefetchWorker')
  
  // 创建 fetch 处理器
  const handler = PrefetchWorker.createFetchHandler({
    apiMatcher: '/api/*',
    defaultExpireTime: 5 * 60 * 1000, // 5分钟缓存
    maxCacheSize: 100,
    debug: true
  })
  
  // 注册 fetch 事件监听器
  self.addEventListener('fetch', handler)
  
  console.log('Travel Booking SW: PrefetchWorker 初始化完成')
} else {
  console.warn('Travel Booking SW: PrefetchWorker 未找到，使用基础缓存策略')
  
  // 基础缓存策略
  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        caches.open('travel-api-cache').then(cache => {
          return cache.match(event.request).then(response => {
            if (response) {
              console.log('Travel Booking SW: 缓存命中', event.request.url)
              return response
            }
            
            return fetch(event.request).then(fetchResponse => {
              if (fetchResponse.ok) {
                cache.put(event.request, fetchResponse.clone())
              }
              return fetchResponse
            })
          })
        })
      )
    }
  })
}

// Service Worker 生命周期事件
self.addEventListener('install', (event) => {
  console.log('Travel Booking SW: 安装中...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Travel Booking SW: 激活中...')
  event.waitUntil(self.clients.claim())
})

// 消息处理
self.addEventListener('message', (event) => {
  console.log('Travel Booking SW: 收到消息', event.data)
  
  if (event.data && event.data.type === 'PREFETCH_INIT') {
    console.log('Travel Booking SW: 处理 Prefetch 初始化')
    
    // 发送初始化成功响应
    event.source.postMessage({
      type: 'PREFETCH_INIT_SUCCESS',
      config: event.data.config,
      message: 'Travel Booking Prefetch 初始化成功'
    })
  }
})

console.log('Travel Booking SW: Service Worker 加载完成')