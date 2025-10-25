import { useState } from 'react'

function PrefetchTester({ onLog, prefetchSetup, swRegistration }) {
  const [testing, setTesting] = useState(false)

  const testPrefetchStatus = async () => {
    try {
      if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({
          type: 'TEST_PREFETCH',
          timestamp: Date.now()
        })
        onLog('📤 Prefetch 状态检查消息已发送', 'info')
      } else {
        onLog('⚠️ 没有活跃的 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ 检查 Prefetch 状态失败: ${error.message}`, 'error')
    }
  }

  const testPrefetchRequests = async () => {
    if (!prefetchSetup) {
      onLog('⚠️ 请先初始化 Prefetch Worker', 'warning')
      return
    }

    setTesting(true)
    
    try {
      onLog('🧪 开始测试预取功能...', 'info')
      
      // 测试 API 请求（高优先级）
      const apiUrl = `/api/test.json?timestamp=${Date.now()}`
      const apiResponse = await fetch(apiUrl)
      if (apiResponse.ok) {
        const apiData = await apiResponse.text()
        onLog(`✅ API 预取测试成功: ${apiData.substring(0, 100)}...`, 'success')
      } else {
        onLog(`⚠️ API 请求返回: ${apiResponse.status}`, 'warning')
      }
      
      // 测试 CSS 资源（中优先级）
      const cssUrl = `/styles/test.css?timestamp=${Date.now()}`
      const cssResponse = await fetch(cssUrl)
      if (cssResponse.ok) {
        onLog(`✅ CSS 预取测试成功: ${cssResponse.status}`, 'success')
      } else {
        onLog(`⚠️ CSS 请求返回: ${cssResponse.status}`, 'warning')
      }
      
      // 测试图片资源（低优先级）
      const imgUrl = `/images/test.png?timestamp=${Date.now()}`
      const imgResponse = await fetch(imgUrl)
      if (imgResponse.ok) {
        onLog(`✅ 图片预取测试成功: ${imgResponse.status}`, 'success')
      } else {
        onLog(`⚠️ 图片请求返回: ${imgResponse.status}`, 'warning')
      }
      
      onLog('🎉 预取功能测试完成', 'success')
      
    } catch (error) {
      onLog(`❌ 预取功能测试失败: ${error.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  const testCacheStrategy = async () => {
    if (!prefetchSetup) {
      onLog('⚠️ 请先初始化 Prefetch Worker', 'warning')
      return
    }

    try {
      onLog('🧪 测试缓存策略...', 'info')
      
      // 第一次请求 - 应该从网络获取
      const url = `/api/cache-test.json?v=1`
      const response1 = await fetch(url)
      onLog(`📥 第一次请求: ${response1.status} (${response1.headers.get('cache-control') || 'no-cache-header'})`, 'info')
      
      // 第二次请求 - 应该从缓存获取
      const response2 = await fetch(url)
      onLog(`📥 第二次请求: ${response2.status} (应该来自缓存)`, 'info')
      
      onLog('✅ 缓存策略测试完成', 'success')
      
    } catch (error) {
      onLog(`❌ 缓存策略测试失败: ${error.message}`, 'error')
    }
  }

  const testDynamicConfig = async () => {
    try {
      if (swRegistration && swRegistration.active) {
        const newConfig = {
          enablePrefetch: true,
          cacheStrategy: 'network-first',
          debug: true,
          prefetchRules: [
            { pattern: /\/api\/dynamic\/.*/, priority: 'high' },
            { pattern: /\.json$/, priority: 'medium' }
          ]
        }
        
        swRegistration.active.postMessage({
          type: 'PREFETCH_CONFIG',
          config: newConfig,
          timestamp: Date.now()
        })
        
        onLog('🔄 动态配置已发送', 'info')
        onLog(`📋 新配置: ${JSON.stringify(newConfig, null, 2)}`, 'info')
      } else {
        onLog('⚠️ 没有活跃的 Service Worker', 'warning')
      }
    } catch (error) {
      onLog(`❌ 发送动态配置失败: ${error.message}`, 'error')
    }
  }

  return (
    <div className="demo-section">
      <h3>🧪 Prefetch 功能测试</h3>
      
      {!prefetchSetup && (
        <p className="status-text warning">
          请先初始化 Prefetch Worker 才能进行测试
        </p>
      )}
      
      <div className="button-group">
        <button 
          onClick={testPrefetchStatus}
          disabled={!swRegistration}
        >
          检查预取状态
        </button>
        
        <button 
          onClick={testPrefetchRequests}
          disabled={!prefetchSetup || testing}
        >
          {testing ? '测试中...' : '测试预取请求'}
        </button>
        
        <button 
          onClick={testCacheStrategy}
          disabled={!prefetchSetup}
        >
          测试缓存策略
        </button>
        
        <button 
          onClick={testDynamicConfig}
          disabled={!swRegistration}
        >
          发送动态配置
        </button>
      </div>
      
      {prefetchSetup && (
        <p className="status-text success">
          ✅ Prefetch Worker 已就绪，可以进行各种测试
        </p>
      )}
    </div>
  )
}

export default PrefetchTester