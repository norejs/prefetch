import { useState, useEffect } from 'react'
import { setup } from '@norejs/prefetch'
import ServiceWorkerManager from './components/ServiceWorkerManager'
import PrefetchTester from './components/PrefetchTester'
import LogViewer from './components/LogViewer'
import './App.css'

function App() {
  const [logs, setLogs] = useState([])
  const [swRegistration, setSWRegistration] = useState(null)
  const [prefetchSetup, setPrefetchSetup] = useState(false)

  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      timestamp, 
      message, 
      type 
    }])
  }

  // 初始化 Prefetch Worker
  const initializePrefetch = async () => {
    try {
      addLog('🚀 开始初始化 Prefetch Worker...', 'info')
      
      const config = {
        enablePrefetch: true,
        enableCache: true,
        cacheStrategy: 'cache-first',
        debug: true,
        prefetchRules: [
          { pattern: /\/api\/.*\.json$/, priority: 'high' },
          { pattern: /\.(js|css)$/, priority: 'medium' },
          { pattern: /\.(png|jpg|jpeg|gif|svg|webp)$/, priority: 'low' }
        ],
        maxConcurrentRequests: 4,
        prefetchDelay: 100
      }

      await setup(config)
      setPrefetchSetup(true)
      addLog('✅ Prefetch Worker 初始化成功', 'success')
      addLog(`📋 配置: ${JSON.stringify(config, null, 2)}`, 'info')
      
    } catch (error) {
      addLog(`❌ Prefetch Worker 初始化失败: ${error.message}`, 'error')
    }
  }

  // 清空日志
  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    addLog('🎉 Vite + React + Prefetch Worker Demo 启动', 'success')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Service Worker ESM + Prefetch Demo</h1>
        <p>Vite + React + @norejs/prefetch 集成演示</p>
      </header>

      <main className="app-main">
        <div className="demo-grid">
          <ServiceWorkerManager 
            onLog={addLog}
            onRegistration={setSWRegistration}
            swRegistration={swRegistration}
          />
          
          <div className="prefetch-section">
            <h3>🔧 Prefetch Worker 控制</h3>
            <button 
              onClick={initializePrefetch}
              disabled={prefetchSetup}
            >
              {prefetchSetup ? '✅ 已初始化' : '初始化 Prefetch Worker'}
            </button>
            {prefetchSetup && (
              <p className="status-text success">
                Prefetch Worker 已就绪，可以进行测试
              </p>
            )}
          </div>

          <PrefetchTester 
            onLog={addLog}
            prefetchSetup={prefetchSetup}
            swRegistration={swRegistration}
          />
        </div>

        <LogViewer 
          logs={logs}
          onClear={clearLogs}
        />
      </main>
    </div>
  )
}

export default App