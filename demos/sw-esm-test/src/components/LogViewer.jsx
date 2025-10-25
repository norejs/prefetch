import { useEffect, useRef } from 'react'
import './LogViewer.css'

function LogViewer({ logs, onClear }) {
  const logRef = useRef(null)

  useEffect(() => {
    // 自动滚动到底部
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const exportLogs = () => {
    const logContent = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sw-esm-test-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLogClassName = (type) => {
    switch (type) {
      case 'success': return 'log-success'
      case 'error': return 'log-error'
      case 'warning': return 'log-warning'
      default: return 'log-info'
    }
  }

  return (
    <div className="log-section">
      <div className="log-header">
        <h3>📊 日志输出</h3>
        <div className="log-controls">
          <button onClick={onClear} disabled={logs.length === 0}>
            清空日志
          </button>
          <button onClick={exportLogs} disabled={logs.length === 0}>
            导出日志
          </button>
          <span className="log-count">
            共 {logs.length} 条日志
          </span>
        </div>
      </div>
      
      <div className="log-viewer" ref={logRef}>
        {logs.length === 0 ? (
          <div className="log-empty">
            暂无日志...
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className={`log-entry ${getLogClassName(log.type)}`}>
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-type">{log.type.toUpperCase()}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
      

    </div>
  )
}

export default LogViewer