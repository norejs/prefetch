// Prefetch Service Worker
importScripts('https://cdn.jsdelivr.net/npm/@flightsingle/prefetch-worker@latest/dist/index.umd.js');

// Initialize prefetch worker
if (typeof setupPrefetchWorker !== 'undefined') {
  setupPrefetchWorker({
    debug: true,
    cacheStrategy: 'networkFirst'
  });
  console.log('[SW] Prefetch worker initialized');
} else {
  console.error('[SW] Prefetch worker not found');
}
