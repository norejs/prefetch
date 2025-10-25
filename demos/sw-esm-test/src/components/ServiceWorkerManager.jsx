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
    
    if (data.type === 'SW_READY') {
      onLog(`✅ Service Worker 就绪: ${data.swType}`, 'success')
      onLog(`🔧 功能支持: ${JSON.stringify(data.features, null, 2)}`, 'info')
    } else if (data.type === 'MESSAGE_REPLY') {
      onLog(`💬 SW 回复: ${data.reply}`, 'success')
      if (data.prefetchWorkerActive !== undefined) {
        onLog(`🚀 Prefetch Worker 状态: ${data.prefetchWorkerActive ? '活跃' : '未激活'}`, 'info')
      }
    } else if (data.type === 'PREFETCH_STATUS') {
      onLog(`🚀 Prefetch Worker 状态: ${data.prefetchWorkerActive ? '✅ 活跃' : '❌ 未激活'}`, 
            data.prefetchWorkerActive ? 'success' : 'warning')
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

  const sendTestMessage = async () => {
    try {
      if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({
          type: 'TEST_MESSAGE',
          timestamp: Date.now(),
          data: 'Hello from React app!'
        })
        onLog('📤 测试消息已发送给 Service Worker', 'info')
      } else {
        onLog('⚠️ 没有活跃的 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ 发送消息失败: ${error.message}`, 'error')
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
        <button onClick={checkSWStatus}>
          检查状态
        </button>
        <button onClick={sendTestMessage} disabled={!swRegistration}>
          发送测试消息
        </button>
      </div>
    </div>
  )
}

export default ServiceWorkerManager