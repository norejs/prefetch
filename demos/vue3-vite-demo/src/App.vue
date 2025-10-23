<template>
  <div class="app">
    <header class="app-header">
      <h1>🚀 Vue 3 + Prefetch Demo</h1>
      <p>Vue 3 + Vite 集成 Prefetch Worker 示例</p>
    </header>

    <main class="app-main">
      <section class="status-section">
        <h2>📊 状态</h2>
        <div class="status-grid">
          <div class="status-card">
            <div class="status-label">Service Worker</div>
            <div :class="['status-value', { success: swStatus === '已激活' }]">
              {{ swStatus }}
            </div>
          </div>
          <div class="status-card">
            <div class="status-label">Prefetch Worker</div>
            <div :class="['status-value', { success: prefetchStatus === '已初始化' }]">
              {{ prefetchStatus }}
            </div>
          </div>
        </div>
      </section>

      <section class="controls-section">
        <h2>🎮 操作</h2>
        <div class="button-group">
          <button 
            @click="handlePrefetch"
            :disabled="loading || prefetchStatus !== '已初始化'"
            class="btn btn-primary"
          >
            {{ loading ? '处理中...' : '预请求数据' }}
          </button>
          <button 
            @click="handleFetch"
            :disabled="loading"
            class="btn btn-secondary"
          >
            {{ loading ? '处理中...' : '获取数据' }}
          </button>
          <button 
            @click="initializePrefetch"
            :disabled="swStatus !== '已激活'"
            class="btn btn-info"
          >
            重新初始化
          </button>
        </div>
      </section>

      <section class="stats-section">
        <h2>📈 统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.prefetchCount }}</div>
            <div class="stat-label">预请求次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.fetchCount }}</div>
            <div class="stat-label">总请求次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.cacheHits }}</div>
            <div class="stat-label">缓存命中</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ hitRate }}</div>
            <div class="stat-label">命中率</div>
          </div>
        </div>
      </section>

      <section v-if="products.length > 0" class="data-section">
        <h2>📦 数据</h2>
        <div class="products-grid">
          <div v-for="(product, index) in products" :key="index" class="product-card">
            <h3>{{ product.name }}</h3>
            <p class="price">${{ product.price }}</p>
            <p class="description">{{ product.description }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>使用 Vue 3 + Vite 创建</p>
      <p>集成 @norejs/prefetch</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const swStatus = ref('未注册')
const prefetchStatus = ref('未初始化')
const products = ref([])
const loading = ref(false)
const stats = ref({
  prefetchCount: 0,
  fetchCount: 0,
  cacheHits: 0
})

const hitRate = computed(() => {
  if (stats.value.fetchCount === 0) return '0%'
  return `${Math.round(stats.value.cacheHits / stats.value.fetchCount * 100)}%`
})

onMounted(() => {
  registerServiceWorker()
})

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    swStatus.value = '不支持'
    return
  }

  try {
    swStatus.value = '注册中...'
    const registration = await navigator.serviceWorker.register('/service-worker.js')
    console.log('Service Worker registered:', registration)
    
    await navigator.serviceWorker.ready
    swStatus.value = '已激活'

    // 监听来自 Service Worker 的消息
    navigator.serviceWorker.addEventListener('message', handleSWMessage)

    // 如果 SW 已经控制页面，立即初始化
    if (navigator.serviceWorker.controller) {
      initializePrefetch()
    } else {
      // 等待 SW 控制页面
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        initializePrefetch()
      })
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    swStatus.value = '注册失败'
  }
}

const handleSWMessage = (event) => {
  const { type } = event.data

  if (type === 'PREFETCH_INIT_SUCCESS') {
    prefetchStatus.value = '已初始化'
    console.log('Prefetch initialized:', event.data)
  }

  if (type === 'PREFETCH_INIT_ERROR') {
    prefetchStatus.value = '初始化失败'
    console.error('Prefetch initialization failed:', event.data.error)
  }
}

const initializePrefetch = () => {
  if (!navigator.serviceWorker.controller) {
    console.warn('No service worker controller')
    return
  }

  prefetchStatus.value = '初始化中...'
  navigator.serviceWorker.controller.postMessage({
    type: 'PREFETCH_INIT',
    config: {
      apiMatcher: '/api/*',
      defaultExpireTime: 30000,
      maxCacheSize: 100,
      debug: true
    }
  })
}

const handlePrefetch = async () => {
  loading.value = true
  try {
    const startTime = Date.now()
    
    // 发起预请求
    await fetch('/api/products', {
      headers: {
        'X-Prefetch-Request-Type': 'prefetch',
        'X-Prefetch-Expire-Time': '30000'
      }
    })

    const duration = Date.now() - startTime
    console.log(`Prefetch completed in ${duration}ms`)
    
    stats.value.prefetchCount++

    alert(`预请求完成！耗时: ${duration}ms`)
  } catch (error) {
    console.error('Prefetch failed:', error)
    alert('预请求失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleFetch = async () => {
  loading.value = true
  try {
    const startTime = Date.now()
    
    const response = await fetch('/api/products')
    const data = await response.json()
    
    const duration = Date.now() - startTime
    const fromCache = duration < 50 // 简单判断是否来自缓存
    
    products.value = data
    stats.value.fetchCount++
    if (fromCache) {
      stats.value.cacheHits++
    }

    console.log(`Fetch completed in ${duration}ms`, fromCache ? '(from cache)' : '(from network)')
  } catch (error) {
    console.error('Fetch failed:', error)
    alert('请求失败: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #42b883;
}

.app-header p {
  color: #666;
  font-size: 1.1rem;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

section h2 {
  margin-bottom: 1.5rem;
  color: #42b883;
  font-size: 1.5rem;
}

.status-grid,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-card,
.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s;
}

.status-card:hover,
.stat-card:hover {
  transform: translateY(-2px);
}

.status-label,
.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  padding: 0.5rem;
  border-radius: 4px;
  background: #e9ecef;
}

.status-value.success {
  background: #d4edda;
  color: #155724;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #42b883;
  margin-bottom: 0.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  min-width: 150px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.product-card h3 {
  color: #42b883;
  margin-bottom: 0.5rem;
}

.product-card .price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f5576c;
  margin: 0.5rem 0;
}

.product-card .description {
  color: #666;
  font-size: 0.9rem;
}

.app-footer {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  text-align: center;
  color: #666;
}

.app-footer p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.8rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>

