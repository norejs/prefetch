import { useState } from 'react'

// 模拟 @norejs/prefetch 包的功能
const initializePrefetch = async (swRegistration, config) => {
  if (!swRegistration || !swRegistration.active) {
    throw new Error('Service Worker 未就绪')
  }

  // 发送配置到 Service Worker
  swRegistration.active.postMessage({
    type: 'PREFETCH_INIT',
    config: config
  })

  // 等待初始化确认
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('初始化超时'))
    }, 5000)

    const messageHandler = (event) => {
      if (event.data.type === 'PREFETCH_INIT_SUCCESS') {
        clearTimeout(timeout)
        navigator.serviceWorker.removeEventListener('message', messageHandler)
        resolve(event.data)
      } else if (event.data.type === 'PREFETCH_INIT_ERROR') {
        clearTimeout(timeout)
        navigator.serviceWorker.removeEventListener('message', messageHandler)
        reject(new Error(event.data.error))
      }
    }

    navigator.serviceWorker.addEventListener('message', messageHandler)
  })
}

function PrefetchManager({ onLog, swRegistration }) {
  const [prefetchInitialized, setPrefetchInitialized] = useState(false)

  const handleInitialize = async () => {
    try {
      onLog('🚀 使用 @norejs/prefetch 初始化...', 'info')
      
      const config = {
        apiMatcher: '/api/*',
        defaultExpireTime: 5 * 60 * 1000, // 5分钟缓存
        maxCacheSize: 50,
        debug: true
      }

      await initializePrefetch(swRegistration, config)
      setPrefetchInitialized(true)
      onLog('✅ Prefetch 初始化成功', 'success')
      
    } catch (error) {
      onLog(`❌ Prefetch 初始化失败: ${error.message}`, 'error')
    }
  }

  return (
    <div className="demo-section">
      <h3>🚀 @norejs/prefetch</h3>
      
      <div className="button-group">
        <button 
          onClick={handleInitialize}
          disabled={!swRegistration || prefetchInitialized}
        >
          {prefetchInitialized ? '✅ 已初始化' : '初始化 Prefetch'}
        </button>
      </div>
      
      <p className="status-text">
        状态: <strong>{prefetchInitialized ? '✅ 已初始化' : '⏳ 未初始化'}</strong>
      </p>
      
      {!swRegistration && (
        <p className="status-text warning">
          请先注册 Service Worker
        </p>
      )}
    </div>
  )
}

export default PrefetchManager