import { useState } from 'react'

function ESMTester({ onLog, swRegistration }) {
  const [testing, setTesting] = useState(false)

  const testESMFeatures = async () => {
    if (!swRegistration) {
      onLog('⚠️ 请先注册 Service Worker', 'warning')
      return
    }

    setTesting(true)
    
    try {
      onLog('🧪 开始测试 ES Module 功能...', 'info')
      
      // 测试 API 请求
      const apiUrl = `/api/test.json?timestamp=${Date.now()}`
      const apiResponse = await fetch(apiUrl)
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        onLog(`✅ API 请求测试成功: ${apiData.message}`, 'success')
      } else {
        onLog(`⚠️ API 请求返回: ${apiResponse.status}`, 'warning')
      }
      
      // 测试 CSS 资源
      const cssUrl = `/styles/test.css?timestamp=${Date.now()}`
      const cssResponse = await fetch(cssUrl)
      if (cssResponse.ok) {
        onLog(`✅ CSS 资源测试成功: ${cssResponse.status}`, 'success')
      } else {
        onLog(`⚠️ CSS 请求返回: ${cssResponse.status}`, 'warning')
      }
      
      onLog('🎉 ES Module 功能测试完成', 'success')
      
    } catch (error) {
      onLog(`❌ ES Module 功能测试失败: ${error.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  const testCacheStrategy = async () => {
    if (!swRegistration) {
      onLog('⚠️ 请先注册 Service Worker', 'warning')
      return
    }

    try {
      onLog('🧪 测试缓存策略...', 'info')
      
      // 第一次请求 - 应该从网络获取
      const url = `/api/cache-test.json?v=1`
      const response1 = await fetch(url)
      onLog(`📥 第一次请求: ${response1.status} (从网络获取)`, 'info')
      
      // 第二次请求 - 应该从缓存获取
      const response2 = await fetch(url)
      onLog(`📥 第二次请求: ${response2.status} (应该来自缓存)`, 'info')
      
      onLog('✅ 缓存策略测试完成', 'success')
      
    } catch (error) {
      onLog(`❌ 缓存策略测试失败: ${error.message}`, 'error')
    }
  }

  const testDynamicImport = async () => {
    try {
      if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({
          type: 'TEST_MESSAGE',
          data: 'Dynamic Import Test Data',
          timestamp: Date.now()
        })
        
        onLog('🔄 动态导入测试消息已发送', 'info')
      } else {
        onLog('⚠️ 没有活跃的 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ 动态导入测试失败: ${error.message}`, 'error')
    }
  }

  const getServiceWorkerStats = async () => {
    try {
      if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({
          type: 'GET_STATS',
          timestamp: Date.now()
        })
        
        onLog('📊 统计信息请求已发送', 'info')
      } else {
        onLog('⚠️ 没有活跃的 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ 获取统计信息失败: ${error.message}`, 'error')
    }
  }

  return (
    <div className="demo-section">
      <h3>🧪 ES Module 功能测试</h3>
      
      <div className="button-group">
        <button 
          onClick={testESMFeatures}
          disabled={!swRegistration || testing}
        >
          {testing ? '测试中...' : '测试 ESM 功能'}
        </button>
        
        <button 
          onClick={testCacheStrategy}
          disabled={!swRegistration}
        >
          测试缓存策略
        </button>
        
        <button 
          onClick={testDynamicImport}
          disabled={!swRegistration}
        >
          测试动态导入
        </button>
        
        <button 
          onClick={getServiceWorkerStats}
          disabled={!swRegistration}
        >
          获取统计信息
        </button>
      </div>
      
      {swRegistration ? (
        <p className="status-text success">
          ✅ Service Worker 已就绪，可以进行 ES Module 测试
        </p>
      ) : (
        <p className="status-text warning">
          请先注册 Service Worker 才能进行测试
        </p>
      )}
    </div>
  )
}

export default ESMTester