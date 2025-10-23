import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [swStatus, setSwStatus] = useState('未注册');
  const [prefetchStatus, setPrefetchStatus] = useState('未初始化');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    prefetchCount: 0,
    fetchCount: 0,
    cacheHits: 0
  });

  // 注册 Service Worker
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      setSwStatus('不支持');
      return;
    }

    try {
      setSwStatus('注册中...');
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      
      await navigator.serviceWorker.ready;
      setSwStatus('已激活');

      // 监听来自 Service Worker 的消息
      navigator.serviceWorker.addEventListener('message', handleSWMessage);

      // 如果 SW 已经控制页面，立即初始化
      if (navigator.serviceWorker.controller) {
        initializePrefetch();
      } else {
        // 等待 SW 控制页面
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          initializePrefetch();
        });
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setSwStatus('注册失败');
    }
  };

  const handleSWMessage = (event) => {
    const { type, data } = event.data;

    if (type === 'PREFETCH_INIT_SUCCESS') {
      setPrefetchStatus('已初始化');
      console.log('Prefetch initialized:', data);
    }

    if (type === 'PREFETCH_INIT_ERROR') {
      setPrefetchStatus('初始化失败');
      console.error('Prefetch initialization failed:', event.data.error);
    }
  };

  const initializePrefetch = () => {
    if (!navigator.serviceWorker.controller) {
      console.warn('No service worker controller');
      return;
    }

    setPrefetchStatus('初始化中...');
    navigator.serviceWorker.controller.postMessage({
      type: 'PREFETCH_INIT',
      config: {
        apiMatcher: '/api/*',
        defaultExpireTime: 30000,
        maxCacheSize: 100,
        debug: true
      }
    });
  };

  const handlePrefetch = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      
      // 发起预请求
      await fetch('/api/products', {
        headers: {
          'X-Prefetch-Request-Type': 'prefetch',
          'X-Prefetch-Expire-Time': '30000'
        }
      });

      const duration = Date.now() - startTime;
      console.log(`Prefetch completed in ${duration}ms`);
      
      setStats(prev => ({
        ...prev,
        prefetchCount: prev.prefetchCount + 1
      }));

      alert(`预请求完成！耗时: ${duration}ms`);
    } catch (error) {
      console.error('Prefetch failed:', error);
      alert('预请求失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/products');
      const data = await response.json();
      
      const duration = Date.now() - startTime;
      const fromCache = duration < 50; // 简单判断是否来自缓存
      
      setProducts(data);
      setStats(prev => ({
        ...prev,
        fetchCount: prev.fetchCount + 1,
        cacheHits: fromCache ? prev.cacheHits + 1 : prev.cacheHits
      }));

      console.log(`Fetch completed in ${duration}ms`, fromCache ? '(from cache)' : '(from network)');
    } catch (error) {
      console.error('Fetch failed:', error);
      alert('请求失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 React CRA + Prefetch Demo</h1>
        <p>Create React App 集成 Prefetch Worker 示例</p>
      </header>

      <main className="App-main">
        <section className="status-section">
          <h2>📊 状态</h2>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-label">Service Worker</div>
              <div className={`status-value ${swStatus === '已激活' ? 'success' : ''}`}>
                {swStatus}
              </div>
            </div>
            <div className="status-card">
              <div className="status-label">Prefetch Worker</div>
              <div className={`status-value ${prefetchStatus === '已初始化' ? 'success' : ''}`}>
                {prefetchStatus}
              </div>
            </div>
          </div>
        </section>

        <section className="controls-section">
          <h2>🎮 操作</h2>
          <div className="button-group">
            <button 
              onClick={handlePrefetch}
              disabled={loading || prefetchStatus !== '已初始化'}
              className="btn btn-primary"
            >
              {loading ? '处理中...' : '预请求数据'}
            </button>
            <button 
              onClick={handleFetch}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? '处理中...' : '获取数据'}
            </button>
            <button 
              onClick={initializePrefetch}
              disabled={swStatus !== '已激活'}
              className="btn btn-info"
            >
              重新初始化
            </button>
          </div>
        </section>

        <section className="stats-section">
          <h2>📈 统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.prefetchCount}</div>
              <div className="stat-label">预请求次数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.fetchCount}</div>
              <div className="stat-label">总请求次数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.cacheHits}</div>
              <div className="stat-label">缓存命中</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.fetchCount > 0 
                  ? `${Math.round(stats.cacheHits / stats.fetchCount * 100)}%`
                  : '0%'
                }
              </div>
              <div className="stat-label">命中率</div>
            </div>
          </div>
        </section>

        {products.length > 0 && (
          <section className="data-section">
            <h2>📦 数据</h2>
            <div className="products-grid">
              {products.map((product, index) => (
                <div key={index} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                  <p className="description">{product.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="App-footer">
        <p>使用 Create React App 创建</p>
        <p>集成 @norejs/prefetch</p>
      </footer>
    </div>
  );
}

export default App;

