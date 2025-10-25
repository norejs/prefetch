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

  const testDynamicFetchHandler = () => {
    if (!swRegistration || !swRegistration.active) {
      onLog('⚠️ Service Worker 未就绪', 'warning')
      return
    }

    onLog('🧪 方法1：直接在消息处理器中添加 fetch 监听器...', 'info')
    
    swRegistration.active.postMessage({
      type: 'ADD_DYNAMIC_FETCH_HANDLER'
    })
  }

  const testESMDynamicFetch = () => {
    if (!swRegistration || !swRegistration.active) {
      onLog('⚠️ Service Worker 未就绪', 'warning')
      return
    }

    onLog('🧪 方法2：通过 ESM 动态导入模块添加 fetch 监听器...', 'info')
    
    swRegistration.active.postMessage({
      type: 'ADD_DYNAMIC_FETCH_VIA_ESM'
    })
  }

  const testFetchHandlers = () => {
    if (!swRegistration || !swRegistration.active) {
      onLog('⚠️ Service Worker 未就绪', 'warning')
      return
    }

    onLog('🧪 测试 fetch 处理器状态...', 'info')
    
    swRegistration.active.postMessage({
      type: 'TEST_FETCH_HANDLERS'
    })
  }

  const testInterceptor = () => {
    if (!swRegistration || !swRegistration.active) {
      onLog('⚠️ Service Worker 未就绪', 'warning')
      return
    }

    onLog('🎯 测试模块拦截器功能...', 'info')
    
    swRegistration.active.postMessage({
      type: 'TEST_INTERCEPTOR'
    })
  }

  const testInterceptorRequest = async () => {
    try {
      onLog('🌐 发送拦截测试请求...', 'info')
      
      const response = await fetch('/api/interceptor/test?timestamp=' + Date.now())
      
      if (response.ok) {
        const data = await response.json()
        onLog('✅ 拦截请求成功:', 'success')
        onLog(`📋 响应数据: ${JSON.stringify(data, null, 2)}`, 'info')
      } else {
        onLog(`⚠️ 拦截请求返回: ${response.status}`, 'warning')
      }
      
    } catch (error) {
      onLog(`❌ 拦截请求失败: ${error.message}`, 'error')
    }
  }

  const testAsyncInit = () => {
    if (!swRegistration || !swRegistration.active) {
      onLog('⚠️ Service Worker 未就绪', 'warning')
      return
    }

    onLog('🔄 测试异步初始化状态...', 'info')
    
    swRegistration.active.postMessage({
      type: 'TEST_ASYNC_INIT'
    })
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
      
      <div className="test-section">
        <h4>🧪 Fetch 监听器警告测试</h4>
        <div className="button-group">
          <button 
            onClick={testDynamicFetchHandler}
            disabled={!swRegistration}
          >
            ⚠️ 方法1：直接添加
          </button>
          
          <button 
            onClick={testESMDynamicFetch}
            disabled={!swRegistration}
          >
            📦 方法2：ESM 动态导入
          </button>
          
          <button 
            onClick={testFetchHandlers}
            disabled={!swRegistration}
          >
            📊 检查状态
          </button>
        </div>
        
        <div className="button-group">
          <button 
            onClick={testInterceptor}
            disabled={!swRegistration}
          >
            🎯 测试模块拦截器
          </button>
          
          <button 
            onClick={testInterceptorRequest}
            disabled={!swRegistration}
          >
            🌐 发送拦截请求
          </button>
          
          <button 
            onClick={testAsyncInit}
            disabled={!swRegistration}
          >
            🔄 测试异步初始化
          </button>
        </div>
        
        <p className="test-description">
          <strong>🎯 模块拦截器</strong>：在异步 main 函数中添加 fetch 监听器（正确方式）<br/>
          <strong>⚠️ 方法1-2</strong>：运行时动态添加 fetch 监听器（会触发警告）<br/>
          <strong>🌐 拦截请求</strong>：访问 <code>/api/interceptor/test</code> 验证拦截器工作<br/>
          <strong>🔄 异步初始化</strong>：测试异步 main 函数的初始化状态
        </p>
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