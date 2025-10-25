import { useState, useEffect } from 'react'
import ServiceWorkerManager from './components/ServiceWorkerManager'
import ESMTester from './components/ESMTester'
import LogViewer from './components/LogViewer'
import './App.css'

function App() {
  const [logs, setLogs] = useState([])
  const [swRegistration, setSWRegistration] = useState(null)

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

  // 清空日志
  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    addLog('🎉 Service Worker ESM 测试演示启动', 'success')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧪 Service Worker ESM 测试</h1>
        <p>Vite + React + ES Modules Service Worker 演示</p>
      </header>

      <main className="app-main">
        <div className="demo-grid">
          <ServiceWorkerManager 
            onLog={addLog}
            onRegistration={setSWRegistration}
            swRegistration={swRegistration}
          />
          
          <ESMTester 
            onLog={addLog}
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