import { useState, useEffect } from 'react'

function ServiceWorkerManager({ onLog, onRegistration, swRegistration }) {
  const [swStatus, setSWStatus] = useState('未注册')
  const [swSupported, setSWSupported] = useState(false)

  useEffect(() => {
    // 检查浏览器支持
    if ('serviceWorker' in navigator) {
      setSWSupported(true)
      onLog('✅ 浏览器支持 Service Worker', 'success')

      // 设置消息监听
      navigator.serviceWorker.addEventListener('message', handleSWMessage)

      // 检查现有注册
      checkExistingRegistration()
    } else {
      setSWSupported(false)
      onLog('❌ 浏览器不支持 Service Worker', 'error')
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
      }
    }
  }, [])

  const handleSWMessage = (event) => {
    const data = event.data

    if (data.type === 'PREFETCH_INIT_SUCCESS') {
      onLog(`✅ Prefetch 初始化成功`, 'success')
    } else if (data.type === 'PREFETCH_INIT_ERROR') {
      onLog(`❌ Prefetch 初始化失败: ${data.error}`, 'error')
    } else if (data.type === 'DYNAMIC_FETCH_HANDLER_ADDED') {
      onLog(`⚠️ ${data.method === 'esm-import' ? 'ESM 动态导入' : '直接添加'}: ${data.warning}`, 'warning')
      if (data.moduleTest) {
        onLog(`📦 模块测试: ${data.moduleTest.message}`, 'info')
      }
      if (data.result) {
        onLog(`📋 结果: ${data.result.warning}`, 'info')
      }
      onLog(`💡 请检查浏览器控制台是否有 fetch 事件监听器警告`, 'info')
    } else if (data.type === 'DYNAMIC_FETCH_ERROR') {
      onLog(`❌ ${data.method === 'esm-import' ? 'ESM 动态导入' : '直接添加'}失败: ${data.error}`, 'error')
    } else if (data.type === 'FETCH_HANDLERS_STATUS') {
      onLog(`📊 Fetch 处理器状态:`, 'info')
      onLog(`  - 正确的处理器: ${data.correctHandlerActive ? '✅ 活跃' : '❌ 未活跃'}`, 'info')
      onLog(`  - 动态处理器: ${data.dynamicHandlerActive ? '⚠️ 已添加但可能被忽略' : '❌ 未添加'}`, 'info')
      onLog(`  - 模块拦截器: ${data.interceptorActive ? '✅ 活跃' : '❌ 未活跃'}`, 'info')
      if (data.interceptorConfig) {
        onLog(`  - 拦截器类型: ${data.interceptorConfig.handlerType}`, 'info')
      }
      onLog(`  - ${data.message}`, 'info')
    } else if (data.type === 'INTERCEPTOR_TEST_RESULT') {
      onLog(`🎯 拦截器测试结果:`, 'success')
      onLog(`  - 模块加载: ${data.testResult.moduleLoaded ? '✅' : '❌'}`, 'info')
      onLog(`  - 处理器添加: ${data.testResult.fetchHandlerAdded ? '✅' : '❌'}`, 'info')
      onLog(`  - 测试URL: ${data.testResult.testUrl}`, 'info')
      onLog(`  - ${data.message}`, 'info')
    } else if (data.type === 'INTERCEPTOR_TEST_ERROR') {
      onLog(`❌ 拦截器测试失败: ${data.error}`, 'error')
    } else if (data.type === 'ASYNC_INIT_TEST_RESULT') {
      onLog(`🔄 异步初始化测试结果:`, 'success')
      onLog(`  - 添加位置: ${data.config.addedAt}`, 'info')
      onLog(`  - 异步延迟: ${data.config.asyncDelay}ms`, 'info')
      onLog(`  - 时间戳: ${new Date(data.config.timestamp).toLocaleTimeString()}`, 'info')
      onLog(`  - ${data.message}`, 'info')
    } else if (data.type === 'ASYNC_INIT_TEST_ERROR') {
      onLog(`❌ 异步初始化测试失败: ${data.error}`, 'error')
    } else {
      onLog(`📨 收到SW消息: ${JSON.stringify(data)}`, 'info')
    }
  }

  const checkExistingRegistration = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        onRegistration(registration)
        const sw = registration.active || registration.installing || registration.waiting
        if (sw) {
          setSWStatus(`运行中 (${sw.state})`)
          onLog(`✅ 发现现有 Service Worker: ${sw.state}`, 'success')
        }
      }
    } catch (error) {
      onLog(`❌ 检查现有注册失败: ${error.message}`, 'error')
    }
  }

  const registerSW = async () => {
    try {
      onLog('🔄 注册 Service Worker...', 'info')

      const registration = await navigator.serviceWorker.register('/sw-module.js', {
        type: 'module'
      })

      onRegistration(registration)
      setSWStatus('已注册')
      onLog('✅ Service Worker 注册成功', 'success')

      // 监听状态变化
      if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          setSWStatus(`${e.target.state}`)
          onLog(`🔄 Service Worker 状态: ${e.target.state}`, 'info')
        })
      }

    } catch (error) {
      onLog(`❌ Service Worker 注册失败: ${error.message}`, 'error')
    }
  }

  const unregisterSW = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        onRegistration(null)
        setSWStatus('未注册')
        onLog('✅ Service Worker 注销成功', 'success')
      } else {
        onLog('⚠️ 没有找到已注册的 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ Service Worker 注销失败: ${error.message}`, 'error')
    }
  }

  const checkSWStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const sw = registration.active || registration.installing || registration.waiting
        if (sw) {
          setSWStatus(`运行中 (${sw.state})`)
          onLog(`✅ Service Worker 状态: ${sw.state}`, 'success')
          onLog(`📄 脚本URL: ${sw.scriptURL}`, 'info')
        }
      } else {
        setSWStatus('未注册')
        onLog('⚠️ 没有找到 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ 检查状态失败: ${error.message}`, 'error')
    }
  }



  if (!swSupported) {
    return (
      <div className="demo-section">
        <h3>❌ Service Worker 管理</h3>
        <p className="status-text error">
          当前浏览器不支持 Service Worker
        </p>
      </div>
    )
  }

  return (
    <div className="demo-section">
      <h3>🔧 Service Worker 管理</h3>

      <p className="status-text">
        状态: <strong>{swStatus}</strong>
      </p>

      <div className="button-group">
        <button onClick={registerSW} disabled={!!swRegistration}>
          注册 Service Worker
        </button>
        <button onClick={unregisterSW} disabled={!swRegistration}>
          注销 Service Worker
        </button>
      </div>
    </div>
  )
}

export default ServiceWorkerManager