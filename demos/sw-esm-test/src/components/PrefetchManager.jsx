import { useState } from 'react'
import { setup, preFetch } from '@norejs/prefetch'

function PrefetchManager({ onLog, swRegistration }) {
  const [prefetchInitialized, setPrefetchInitialized] = useState(false)
  const [apiTestResults, setApiTestResults] = useState([])
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false)
  const [benchmarkResults, setBenchmarkResults] = useState(null)
  const [testApiServerStatus, setTestApiServerStatus] = useState('unknown') // unknown, running, stopped

  // 检查 test-api-server 状态
  const checkTestApiServerStatus = async () => {
    try {
      onLog('🔍 检查 test-api-server 状态...', 'info')
      const response = await fetch('http://localhost:18001/api/health', {
        method: 'GET',
        mode: 'cors'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestApiServerStatus('running')
        onLog('✅ test-api-server 正在运行', 'success')
        onLog(`📊 服务器运行时间: ${data.uptime?.toFixed(2)}s`, 'info')
        return true
      } else {
        setTestApiServerStatus('stopped')
        onLog('⚠️ test-api-server 响应异常', 'warning')
        return false
      }
    } catch (error) {
      setTestApiServerStatus('stopped')
      onLog('❌ test-api-server 未运行或无法访问', 'error')
      onLog('💡 提示: 请启动 test-api-server (cd test-system/api-server && pnpm start)', 'info')
      return false
    }
  }

  const handleInitialize = async () => {
    try {
      onLog('🚀 使用 @norejs/prefetch 初始化...', 'info')
      
      // 先检查 test-api-server 状态
      await checkTestApiServerStatus()
      
      const config = {
        serviceWorkerUrl: '/sw-module.js',
        scope: '/',
        apiMatcher: '/api/*',
        defaultExpireTime: 5 * 60 * 1000, // 5分钟缓存
        maxCacheSize: 50,
        debug: true
      }

      const registration = await setup(config)
      if (registration) {
        setPrefetchInitialized(true)
        onLog('✅ Prefetch 初始化成功', 'success')
      } else {
        onLog('⚠️ Prefetch 初始化返回 null', 'warning')
      }
      
    } catch (error) {
      onLog(`❌ Prefetch 初始化失败: ${error.message}`, 'error')
    }
  }

  // API 测试方法
  const testApiCall = async (endpoint, method = 'GET', data = null, usePreFetch = false) => {
    try {
      onLog(`🌐 测试 API 调用: ${method} ${endpoint} ${usePreFetch ? '(使用 preFetch)' : '(使用 fetch)'}`, 'info')
      
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Source': 'prefetch-manager'
        }
      }
      
      if (data && method !== 'GET') {
        options.body = JSON.stringify(data)
      }

      let response
      if (usePreFetch && method === 'GET') {
        // 使用 preFetch 方法（仅支持 GET 请求）
        await preFetch(endpoint, {
          expireTime: 30000 // 30秒过期时间
        })
        // preFetch 不返回响应，需要再次 fetch 获取数据
        response = await fetch(endpoint, options)
        onLog('📦 使用 preFetch 预取后再 fetch 获取数据', 'info')
      } else {
        // 使用普通 fetch
        response = await fetch(endpoint, options)
      }
      
      if (response.ok) {
        const responseData = await response.json()
        const result = {
          endpoint,
          method,
          status: response.status,
          data: responseData,
          timestamp: Date.now(),
          usedPreFetch: usePreFetch && method === 'GET'
        }
        
        setApiTestResults(prev => [result, ...prev.slice(0, 4)]) // 保留最近5条记录
        onLog(`✅ API 调用成功: ${response.status}`, 'success')
        onLog(`📋 响应数据: ${JSON.stringify(responseData, null, 2)}`, 'info')
      } else {
        onLog(`⚠️ API 调用返回: ${response.status} ${response.statusText}`, 'warning')
      }
      
    } catch (error) {
      onLog(`❌ API 调用失败: ${error.message}`, 'error')
    }
  }

  // 静态 JSON 文件测试用例
  const staticApiTestCases = [
    { name: 'API 端点列表', endpoint: '/api/index.json', method: 'GET', category: 'static' },
    { name: '用户列表', endpoint: '/api/users.json', method: 'GET', category: 'static' },
    { name: '用户详情', endpoint: '/api/users/1.json', method: 'GET', category: 'static' },
    { name: '产品列表', endpoint: '/api/products.json', method: 'GET', category: 'static' },
    { name: '订单详情', endpoint: '/api/orders/123.json', method: 'GET', category: 'static' },
    { name: '系统状态', endpoint: '/api/system/status.json', method: 'GET', category: 'static' },
    { name: '自定义测试', endpoint: '/api/custom/test.json', method: 'GET', category: 'static' }
  ]

  // test-api-server 测试用例
  const testApiServerCases = [
    { name: '服务器健康检查', endpoint: 'http://localhost:18001/api/health', method: 'GET', category: 'server' },
    { name: '服务器用户列表', endpoint: 'http://localhost:18001/api/users', method: 'GET', category: 'server' },
    { name: '服务器用户详情', endpoint: 'http://localhost:18001/api/users/1', method: 'GET', category: 'server' },
    { name: '服务器产品列表', endpoint: 'http://localhost:18001/api/products', method: 'GET', category: 'server' },
    { name: '服务器产品详情', endpoint: 'http://localhost:18001/api/products/1', method: 'GET', category: 'server' },
    { name: '服务器产品搜索', endpoint: 'http://localhost:18001/api/products?search=laptop', method: 'GET', category: 'server' },
    { name: '服务器请求日志', endpoint: 'http://localhost:18001/api/logs', method: 'GET', category: 'server' }
  ]

  // 根据服务器状态选择测试用例
  const apiTestCases = testApiServerStatus === 'running' 
    ? [...staticApiTestCases, ...testApiServerCases]
    : staticApiTestCases

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

  // 清理缓存
  const clearCache = async () => {
    try {
      onLog('🧹 清理 prefetch 缓存...', 'info')
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // 发送清理缓存消息到 Service Worker
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_CLEAR_CACHE'
        })
        
        // 等待清理完成的响应
        await new Promise((resolve) => {
          const handleMessage = (event) => {
            if (event.data && event.data.type === 'PREFETCH_CACHE_CLEARED') {
              navigator.serviceWorker.removeEventListener('message', handleMessage)
              resolve()
            }
          }
          navigator.serviceWorker.addEventListener('message', handleMessage)
          
          // 设置超时
          setTimeout(() => {
            navigator.serviceWorker.removeEventListener('message', handleMessage)
            resolve()
          }, 2000)
        })
      }
      
      onLog('✅ 缓存清理完成', 'success')
    } catch (error) {
      onLog(`❌ 缓存清理失败: ${error.message}`, 'error')
    }
  }

  // 一键性能测试
  const runBenchmarkTest = async () => {
    if (!prefetchInitialized) {
      onLog('⚠️ 请先初始化 Prefetch', 'warning')
      return
    }

    setIsRunningBenchmark(true)
    setBenchmarkResults(null)
    
    try {
      onLog('🚀 开始一键性能测试...', 'info')
      
      // 1. 清理缓存
      onLog('📝 步骤 1/4: 清理缓存', 'info')
      await clearCache()
      await new Promise(resolve => setTimeout(resolve, 500)) // 等待缓存清理完成
      
      // 2. 第一轮：直接请求测试
      onLog('📝 步骤 2/4: 第一轮直接请求测试', 'info')
      const directResults = []
      
      for (const testCase of apiTestCases) {
        if (testCase.method === 'GET') {
          onLog(`🌐 直接请求: ${testCase.name}`, 'info')
          const startTime = performance.now()
          
          try {
            const response = await fetch(testCase.endpoint)
            const endTime = performance.now()
            const responseTime = endTime - startTime
            
            if (response.ok) {
              await response.json() // 消费响应体
              directResults.push({
                name: testCase.name,
                endpoint: testCase.endpoint,
                responseTime: responseTime,
                success: true
              })
              onLog(`✅ ${testCase.name}: ${responseTime.toFixed(2)}ms`, 'success')
            } else {
              directResults.push({
                name: testCase.name,
                endpoint: testCase.endpoint,
                responseTime: responseTime,
                success: false,
                error: `HTTP ${response.status}`
              })
            }
          } catch (error) {
            const endTime = performance.now()
            directResults.push({
              name: testCase.name,
              endpoint: testCase.endpoint,
              responseTime: endTime - startTime,
              success: false,
              error: error.message
            })
          }
          
          // 请求间隔
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // 3. 预请求阶段
      onLog('📝 步骤 3/4: 预请求所有端点 (20秒有效期)', 'info')
      const prefetchStartTime = performance.now()
      
      for (const testCase of apiTestCases) {
        if (testCase.method === 'GET') {
          onLog(`📦 预请求: ${testCase.name}`, 'info')
          try {
            await preFetch(testCase.endpoint, {
              expireTime: 20000 // 20秒过期时间
            })
            onLog(`✅ 预请求完成: ${testCase.name}`, 'success')
          } catch (error) {
            onLog(`❌ 预请求失败: ${testCase.name} - ${error.message}`, 'error')
          }
          
          // 预请求间隔
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
      
      const prefetchEndTime = performance.now()
      const totalPrefetchTime = prefetchEndTime - prefetchStartTime
      onLog(`✅ 所有预请求完成，耗时: ${totalPrefetchTime.toFixed(2)}ms`, 'success')
      
      // 等待一小段时间确保预请求完全处理
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 4. 第二轮：缓存请求测试
      onLog('📝 步骤 4/4: 第二轮缓存请求测试', 'info')
      const cachedResults = []
      
      for (const testCase of apiTestCases) {
        if (testCase.method === 'GET') {
          onLog(`🌐 缓存请求: ${testCase.name}`, 'info')
          const startTime = performance.now()
          
          try {
            const response = await fetch(testCase.endpoint)
            const endTime = performance.now()
            const responseTime = endTime - startTime
            
            if (response.ok) {
              await response.json() // 消费响应体
              cachedResults.push({
                name: testCase.name,
                endpoint: testCase.endpoint,
                responseTime: responseTime,
                success: true
              })
              onLog(`✅ ${testCase.name}: ${responseTime.toFixed(2)}ms (缓存)`, 'success')
            } else {
              cachedResults.push({
                name: testCase.name,
                endpoint: testCase.endpoint,
                responseTime: responseTime,
                success: false,
                error: `HTTP ${response.status}`
              })
            }
          } catch (error) {
            const endTime = performance.now()
            cachedResults.push({
              name: testCase.name,
              endpoint: testCase.endpoint,
              responseTime: endTime - startTime,
              success: false,
              error: error.message
            })
          }
          
          // 请求间隔
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // 计算统计结果
      const successfulDirect = directResults.filter(r => r.success)
      const successfulCached = cachedResults.filter(r => r.success)
      
      const avgDirectTime = successfulDirect.length > 0 
        ? successfulDirect.reduce((sum, r) => sum + r.responseTime, 0) / successfulDirect.length 
        : 0
      
      const avgCachedTime = successfulCached.length > 0 
        ? successfulCached.reduce((sum, r) => sum + r.responseTime, 0) / successfulCached.length 
        : 0
      
      const improvement = avgDirectTime > 0 ? ((avgDirectTime - avgCachedTime) / avgDirectTime * 100) : 0
      
      const results = {
        directResults,
        cachedResults,
        totalPrefetchTime,
        avgDirectTime,
        avgCachedTime,
        improvement,
        timestamp: Date.now()
      }
      
      setBenchmarkResults(results)
      
      onLog('🎉 性能测试完成！', 'success')
      onLog(`📊 直接请求平均耗时: ${avgDirectTime.toFixed(2)}ms`, 'info')
      onLog(`📊 缓存请求平均耗时: ${avgCachedTime.toFixed(2)}ms`, 'info')
      onLog(`📊 性能提升: ${improvement.toFixed(1)}%`, 'success')
      
    } catch (error) {
      onLog(`❌ 性能测试失败: ${error.message}`, 'error')
    } finally {
      setIsRunningBenchmark(false)
    }
  }

  return (
    <div className="demo-section">
      <h3>🚀 @norejs/prefetch 测试</h3>
      
      <div className="button-group">
        <button 
          onClick={handleInitialize}
          disabled={prefetchInitialized}
        >
          {prefetchInitialized ? '✅ 已初始化' : '初始化 Prefetch'}
        </button>
        
        <button 
          onClick={checkTestApiServerStatus}
          disabled={isRunningBenchmark}
        >
          🔍 检查 API 服务器
        </button>
        
        <button 
          onClick={clearCache}
          disabled={!prefetchInitialized || isRunningBenchmark}
        >
          🧹 清理缓存
        </button>
        
        <button 
          onClick={runBenchmarkTest}
          disabled={!prefetchInitialized || isRunningBenchmark}
          className="benchmark-button"
        >
          {isRunningBenchmark ? '⏳ 测试中...' : '🚀 一键性能测试'}
        </button>
      </div>

      {/* API 服务器状态显示 */}
      <div className="server-status">
        <div className="status-indicator">
          <span className="status-label">test-api-server 状态:</span>
          <span className={`status-badge ${testApiServerStatus}`}>
            {testApiServerStatus === 'running' && '🟢 运行中'}
            {testApiServerStatus === 'stopped' && '🔴 已停止'}
            {testApiServerStatus === 'unknown' && '⚪ 未知'}
          </span>
        </div>
        {testApiServerStatus === 'stopped' && (
          <div className="server-help">
            <p>💡 启动 test-api-server:</p>
            <code>cd test-system/api-server && pnpm start</code>
          </div>
        )}
        {testApiServerStatus === 'running' && (
          <div className="server-info">
            <p>✅ 可以测试 {testApiServerCases.length} 个服务器端点</p>
          </div>
        )}
      </div>

      {/* API 测试区域 */}
      <div className="test-section">
        <h4>🌐 API 调用测试</h4>
        
        {/* 静态 JSON 文件测试 */}
        <div className="api-category">
          <h5>📁 静态 JSON 文件 ({staticApiTestCases.length} 个端点)</h5>
          <div className="api-test-grid">
            {staticApiTestCases.map((testCase, index) => (
              <div key={`static-${index}`} className="api-test-item">
                <div className="api-test-buttons">
                  <button
                    onClick={() => testApiCall(testCase.endpoint, testCase.method, testCase.data, false)}
                    disabled={!prefetchInitialized}
                    className={`api-test-button ${testCase.method.toLowerCase()}`}
                  >
                    <span className="method-badge">{testCase.method}</span>
                    {testCase.name} (fetch)
                  </button>
                  {testCase.method === 'GET' && (
                    <button
                      onClick={() => testApiCall(testCase.endpoint, testCase.method, testCase.data, true)}
                      disabled={!prefetchInitialized}
                      className={`api-test-button prefetch ${testCase.method.toLowerCase()}`}
                    >
                      <span className="method-badge">PRE</span>
                      {testCase.name} (preFetch)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* test-api-server 测试 */}
        {testApiServerStatus === 'running' && (
          <div className="api-category">
            <h5>🖥️ test-api-server ({testApiServerCases.length} 个端点)</h5>
            <div className="api-test-grid">
              {testApiServerCases.map((testCase, index) => (
                <div key={`server-${index}`} className="api-test-item server-api">
                  <div className="api-test-buttons">
                    <button
                      onClick={() => testApiCall(testCase.endpoint, testCase.method, testCase.data, false)}
                      disabled={!prefetchInitialized}
                      className={`api-test-button ${testCase.method.toLowerCase()}`}
                    >
                      <span className="method-badge">{testCase.method}</span>
                      {testCase.name} (fetch)
                    </button>
                    {testCase.method === 'GET' && (
                      <button
                        onClick={() => testApiCall(testCase.endpoint, testCase.method, testCase.data, true)}
                        disabled={!prefetchInitialized}
                        className={`api-test-button prefetch ${testCase.method.toLowerCase()}`}
                      >
                        <span className="method-badge">PRE</span>
                        {testCase.name} (preFetch)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="custom-api-test">
          <h5>自定义 API 测试</h5>
          <div className="input-group">
            <input
              type="text"
              placeholder="/api/custom/endpoint.json"
              id="custom-endpoint"
              defaultValue="/api/custom/test.json"
            />
            <select id="custom-method" defaultValue="GET">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <button
              onClick={() => {
                const endpoint = document.getElementById('custom-endpoint').value
                const method = document.getElementById('custom-method').value
                testApiCall(endpoint, method, null, false)
              }}
              disabled={!prefetchInitialized}
            >
              发送 fetch
            </button>
            <button
              onClick={() => {
                const endpoint = document.getElementById('custom-endpoint').value
                const method = document.getElementById('custom-method').value
                if (method === 'GET') {
                  testApiCall(endpoint, method, null, true)
                } else {
                  onLog('⚠️ preFetch 仅支持 GET 请求', 'warning')
                }
              }}
              disabled={!prefetchInitialized}
            >
              发送 preFetch
            </button>
          </div>
        </div>
      </div>

      {/* 性能测试结果 */}
      {benchmarkResults && (
        <div className="test-section">
          <h4>📊 性能测试结果</h4>
          <div className="benchmark-summary">
            <div className="benchmark-stats">
              <div className="stat-item">
                <span className="stat-label">预请求总耗时:</span>
                <span className="stat-value">{benchmarkResults.totalPrefetchTime.toFixed(2)}ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">直接请求平均:</span>
                <span className="stat-value">{benchmarkResults.avgDirectTime.toFixed(2)}ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">缓存请求平均:</span>
                <span className="stat-value">{benchmarkResults.avgCachedTime.toFixed(2)}ms</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">性能提升:</span>
                <span className="stat-value">{benchmarkResults.improvement.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="benchmark-details">
              <h5>详细对比</h5>
              <div className="comparison-table">
                <div className="table-header">
                  <span>API 端点</span>
                  <span>直接请求</span>
                  <span>缓存请求</span>
                  <span>提升</span>
                </div>
                {benchmarkResults.directResults.map((direct, index) => {
                  const cached = benchmarkResults.cachedResults[index]
                  const improvement = direct.success && cached.success 
                    ? ((direct.responseTime - cached.responseTime) / direct.responseTime * 100)
                    : 0
                  
                  return (
                    <div key={index} className="table-row">
                      <span className="endpoint-name">{direct.name}</span>
                      <span className={`response-time ${direct.success ? 'success' : 'error'}`}>
                        {direct.success ? `${direct.responseTime.toFixed(2)}ms` : '失败'}
                      </span>
                      <span className={`response-time ${cached.success ? 'success' : 'error'}`}>
                        {cached.success ? `${cached.responseTime.toFixed(2)}ms` : '失败'}
                      </span>
                      <span className={`improvement ${improvement > 0 ? 'positive' : 'neutral'}`}>
                        {direct.success && cached.success ? `${improvement.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API 测试结果 */}
      {apiTestResults.length > 0 && (
        <div className="test-section">
          <h4>📊 最近的 API 测试结果</h4>
          <div className="api-results">
            {apiTestResults.map((result, index) => (
              <div key={index} className="api-result-item">
                <div className="result-header">
                  <span className={`method-badge ${result.method.toLowerCase()}`}>
                    {result.method}
                  </span>
                  {result.usedPreFetch && (
                    <span className="prefetch-badge">PRE</span>
                  )}
                  <span className="endpoint">{result.endpoint}</span>
                  <span className={`status status-${Math.floor(result.status / 100)}xx`}>
                    {result.status}
                  </span>
                </div>
                <div className="result-data">
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
            onClick={testAsyncInit}
            disabled={!swRegistration}
          >
            🔄 测试异步初始化
          </button>
        </div>
        
        <p className="test-description">
          <strong>🚀 一键性能测试</strong>：自动执行完整的性能对比测试流程<br/>
          <strong>🧹 清理缓存</strong>：清理 prefetch 缓存，确保测试准确性<br/>
          <strong>📦 预请求</strong>：20秒有效期，批量预取所有 API 端点<br/>
          <strong>📊 性能对比</strong>：直接请求 vs 缓存请求的响应时间对比
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