import { useEffect, useRef } from 'react'

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
      
      <style jsx>{`
        .log-section {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .log-header h3 {
          margin: 0;
          color: #646cff;
        }
        
        .log-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .log-count {
          font-size: 0.9rem;
          color: #888;
          margin-left: 0.5rem;
        }
        
        .log-viewer {
          height: 400px;
          overflow-y: auto;
          padding: 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .log-empty {
          color: #888;
          text-align: center;
          padding: 2rem;
        }
        
        .log-entry {
          margin-bottom: 0.5rem;
          padding: 0.25rem 0;
          border-left: 3px solid transparent;
          padding-left: 0.5rem;
        }
        
        .log-timestamp {
          color: #888;
          margin-right: 0.5rem;
        }
        
        .log-type {
          font-weight: bold;
          margin-right: 0.5rem;
          min-width: 60px;
          display: inline-block;
        }
        
        .log-message {
          white-space: pre-wrap;
        }
        
        .log-success {
          border-left-color: #22c55e;
        }
        
        .log-success .log-type {
          color: #22c55e;
        }
        
        .log-error {
          border-left-color: #ef4444;
        }
        
        .log-error .log-type {
          color: #ef4444;
        }
        
        .log-warning {
          border-left-color: #f59e0b;
        }
        
        .log-warning .log-type {
          color: #f59e0b;
        }
        
        .log-info {
          border-left-color: #3b82f6;
        }
        
        .log-info .log-type {
          color: #3b82f6;
        }
        
        @media (prefers-color-scheme: light) {
          .log-section {
            background: rgba(0, 0, 0, 0.02);
            border: 1px solid rgba(0, 0, 0, 0.1);
          }
          
          .log-header {
            background: rgba(0, 0, 0, 0.05);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </div>
  )
}

export default LogViewer