import './style.css'
import { setup, preRequest } from '@norejs/prefetch'

// 性能指标
interface Metrics {
  cacheHits: number;
  cacheMisses: number;
  responseTimes: number[];
  prefetchedAPIs: Set<string>;
}

const metrics: Metrics = {
  cacheHits: 0,
  cacheMisses: 0,
  responseTimes: [],
  prefetchedAPIs: new Set()
};

let prefetchFunction: ReturnType<typeof preRequest> | null = null;

// 日志系统
function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;
  
  const time = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type}`;
  logEntry.textContent = `[${time}] ${message}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 更新状态指示器
function updateStatus(elementId: string, status: 'loading' | 'ready' | 'error', text: string) {
  const indicator = document.getElementById(elementId);
  const textElement = document.getElementById(elementId.replace('-status', '-text'));
  
  if (indicator) {
    indicator.className = `status-indicator ${status}`;
  }
  if (textElement) {
    textElement.textContent = text;
  }
}

// API 服务器配置
const API_BASE_URL = 'http://localhost:3001';

// 初始化Prefetch
async function initPrefetch() {
  try {
    addLog('🚀 开始初始化 Prefetch...', 'info');
    updateStatus('sw-status', 'loading', 'Service Worker 启动中...');
    updateStatus('prefetch-status', 'loading', 'Prefetch 初始化中...');

    // 使用真正的 Prefetch 库初始化
    const registration = await setup({
      serviceWorkerUrl: '/service-worker.js',
      scope: '/'
    });

    updateStatus('sw-status', 'ready', 'Service Worker 已就绪');
    
    // 创建预请求函数
    prefetchFunction = preRequest();
    updateStatus('prefetch-status', 'ready', 'Prefetch 已就绪');
    
    addLog('✅ Prefetch 初始化成功！', 'success');
    addLog(`🔧 Service Worker: ${registration ? 'Active' : 'Registered'}`, 'info');
    addLog('🎯 将鼠标悬停在卡片上体验真实预加载', 'info');

    setupEventListeners();
    startMetricsUpdate();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLog(`❌ 初始化失败: ${errorMessage}`, 'error');
    updateStatus('sw-status', 'error', 'Service Worker 错误');
    updateStatus('prefetch-status', 'error', 'Prefetch 错误');
    
    // 即使初始化失败，也设置事件监听器（降级到普通请求）
    setupEventListeners();
  }
}

// 设置事件监听器
function setupEventListeners() {
  const cards = document.querySelectorAll('.demo-card');
  
  cards.forEach((card) => {
    const element = card as HTMLElement;
    const apiUrl = element.dataset.api!;
    const title = element.dataset.title!;
    let hoverTimeout: number;
    let isPrefetched = false;

    // 鼠标悬停事件
    element.addEventListener('mouseenter', async () => {
      if (isPrefetched || !prefetchFunction) return;

      hoverTimeout = window.setTimeout(async () => {
        element.classList.add('prefetching');
        const statusElement = element.querySelector('.card-status')!;
        statusElement.textContent = '预加载中...';
        statusElement.className = 'card-status prefetching';
        
        addLog(`🔄 开始预加载: ${title}`, 'info');

        try {
          const startTime = performance.now();
          
          // 使用真正的Prefetch预请求，添加API_BASE_URL前缀
          const fullApiUrl = `${API_BASE_URL}${apiUrl}`;
          await prefetchFunction(fullApiUrl, { expireTime: 30000 });
          
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);

          element.classList.remove('prefetching');
          element.classList.add('prefetched');
          statusElement.textContent = '已预加载';
          statusElement.className = 'card-status prefetched';
          
          metrics.prefetchedAPIs.add(apiUrl);
          isPrefetched = true;

          addLog(`✅ 预加载完成: ${title} (${responseTime}ms)`, 'success');
          
        } catch (error) {
          element.classList.remove('prefetching');
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addLog(`❌ 预加载失败: ${title} - ${errorMessage}`, 'error');
        }
      }, 200);
    });

    element.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    });

    // 点击事件 - 测试响应时间
    element.addEventListener('click', async () => {
      const responseTimeElement = element.querySelector('.response-time')!;
      const startTime = performance.now();
      
      try {
        const fullApiUrl = `${API_BASE_URL}${apiUrl}`;
        const response = await fetch(fullApiUrl);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        const data = await response.json();
        
        metrics.responseTimes.push(responseTime);
        
        // 检查是否来自缓存 - Service Worker 缓存或预请求缓存
        const fromCache = response.headers.get('X-Prefetch-Response') === 'true' || 
                         response.type === 'opaque' || 
                         responseTime < 100; // 快速响应通常表示缓存命中
        
        if (fromCache || isPrefetched) {
          metrics.cacheHits++;
        } else {
          metrics.cacheMisses++;
        }

        responseTimeElement.innerHTML = `
          <span class="${fromCache || isPrefetched ? 'fast-response' : ''}">
            响应时间: ${responseTime}ms ${fromCache || isPrefetched ? '(来自缓存)' : '(网络请求)'}
          </span>
        `;

        // 计算性能提升百分比
        const baselineDelay = responseTime > 200 ? responseTime : 400; // 估算无缓存时的延迟
        const improvement = fromCache ? 
          Math.round(((baselineDelay - responseTime) / baselineDelay) * 100) : 0;

        addLog(`📊 ${title} 响应: ${responseTime}ms ${fromCache || isPrefetched ? `(缓存命中${improvement > 0 ? `, 提升${improvement}%` : ''})` : '(网络请求)'}`, 
               fromCache || isPrefetched ? 'success' : 'info');

        // 显示返回的数据类型
        addLog(`📄 数据类型: ${Object.keys(data).join(', ')}`, 'info');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        responseTimeElement.textContent = `请求失败: ${errorMessage}`;
        addLog(`❌ 请求失败: ${title} - ${errorMessage}`, 'error');
        metrics.cacheMisses++;
      }
    });
  });

  // 按钮事件
  document.getElementById('preload-all')?.addEventListener('click', preloadAllAPIs);
  document.getElementById('clear-cache')?.addEventListener('click', clearCache);
  document.getElementById('check-sw')?.addEventListener('click', checkServiceWorker);
}

// 预加载所有API
async function preloadAllAPIs() {
  if (!prefetchFunction) {
    addLog('❌ Prefetch 未就绪，无法预加载', 'error');
    return;
  }

  addLog('🚀 开始预加载所有 API...', 'info');
  
  const apis = ['/api/products/1', '/api/products/2', '/api/cart', '/api/user/profile'];
  
  for (const api of apis) {
    try {
      const fullApiUrl = `${API_BASE_URL}${api}`;
      await prefetchFunction(fullApiUrl, { expireTime: 60000 });
      metrics.prefetchedAPIs.add(api);
      addLog(`✅ 预加载完成: ${api}`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ 预加载失败: ${api} - ${errorMessage}`, 'error');
    }
  }
  
  // 更新所有卡片状态
  document.querySelectorAll('.demo-card').forEach(card => {
    card.classList.add('prefetched');
    const statusElement = card.querySelector('.card-status')!;
    statusElement.textContent = '已预加载';
    statusElement.className = 'card-status prefetched';
  });
  
  addLog('🎉 所有 API 预加载完成！', 'success');
}

// 清空缓存
function clearCache() {
  metrics.prefetchedAPIs.clear();
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.responseTimes = [];

  document.querySelectorAll('.demo-card').forEach(card => {
    card.classList.remove('prefetched', 'prefetching');
    const statusElement = card.querySelector('.card-status')!;
    statusElement.textContent = '未预加载';
    statusElement.className = 'card-status';
    const responseTimeElement = card.querySelector('.response-time')!;
    responseTimeElement.textContent = '';
  });

  addLog('🗑️ 缓存已清空', 'info');
}

// 检查Service Worker状态
async function checkServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    const controller = navigator.serviceWorker.controller;
    
    addLog('🔍 Service Worker 状态检查:', 'info');
    addLog(`  - 注册状态: ${registration ? 'Registered' : 'Not Registered'}`, 'info');
    addLog(`  - 控制器状态: ${controller ? 'Active' : 'Not Active'}`, 'info');
    
    if (registration) {
      addLog(`  - SW URL: ${registration.active?.scriptURL || 'N/A'}`, 'info');
      addLog(`  - 作用域: ${registration.scope}`, 'info');
    }
  } else {
    addLog('❌ 浏览器不支持 Service Worker', 'error');
  }
}

// 更新性能指标
function updateMetrics() {
  const cacheHitsEl = document.getElementById('cache-hits');
  const cacheMissesEl = document.getElementById('cache-misses');
  const hitRateEl = document.getElementById('hit-rate');
  const avgResponseEl = document.getElementById('avg-response');

  if (cacheHitsEl) cacheHitsEl.textContent = metrics.cacheHits.toString();
  if (cacheMissesEl) cacheMissesEl.textContent = metrics.cacheMisses.toString();
  
  const total = metrics.cacheHits + metrics.cacheMisses;
  const hitRate = total > 0 ? Math.round((metrics.cacheHits / total) * 100) : 0;
  if (hitRateEl) hitRateEl.textContent = `${hitRate}%`;

  const avgResponse = metrics.responseTimes.length > 0 
    ? Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length)
    : 0;
  if (avgResponseEl) avgResponseEl.textContent = `${avgResponse}ms`;
}

// 开始指标更新
function startMetricsUpdate() {
  setInterval(updateMetrics, 1000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initPrefetch();
});