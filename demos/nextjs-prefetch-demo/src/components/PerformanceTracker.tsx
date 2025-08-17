'use client'

import { useEffect, useState } from 'react'

interface PerformanceRecord {
  timestamp: number
  url: string
  mode: 'prefetch' | 'normal'
  loadTime: number
}

export function PerformanceTracker() {
  const [records, setRecords] = useState<PerformanceRecord[]>([])

  useEffect(() => {
    // 从 localStorage 加载历史记录
    const saved = localStorage.getItem('performance-records')
    if (saved) {
      try {
        setRecords(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse performance records:', error)
      }
    }

    // 监听性能记录事件
    const handlePerformanceRecord = (event: CustomEvent<PerformanceRecord>) => {
      const newRecord = event.detail
      setRecords(prev => {
        const updated = [newRecord, ...prev].slice(0, 10) // 只保留最近10条
        localStorage.setItem('performance-records', JSON.stringify(updated))
        return updated
      })
    }

    window.addEventListener('performance-record', handlePerformanceRecord as EventListener)

    return () => {
      window.removeEventListener('performance-record', handlePerformanceRecord as EventListener)
    }
  }, [])

  const clearRecords = () => {
    setRecords([])
    localStorage.removeItem('performance-records')
  }

  const avgPrefetchTime = records
    .filter(r => r.mode === 'prefetch')
    .reduce((sum, r, _, arr) => sum + r.loadTime / arr.length, 0)

  const avgNormalTime = records
    .filter(r => r.mode === 'normal')
    .reduce((sum, r, _, arr) => sum + r.loadTime / arr.length, 0)

  if (records.length === 0) {
    return (
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium mb-2">性能追踪</h3>
        <p className="text-gray-500 text-sm">暂无性能数据，请访问产品页面进行测试</p>
      </div>
    )
  }

  return (
    <div className="card bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">性能追踪</h3>
        <button
          onClick={clearRecords}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          清除记录
        </button>
      </div>

      {/* 平均性能对比 */}
      {avgPrefetchTime > 0 && avgNormalTime > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">平均加载时间对比</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(avgPrefetchTime)}ms</div>
              <div className="text-sm text-green-700">预请求模式</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(avgNormalTime)}ms</div>
              <div className="text-sm text-orange-700">普通模式</div>
            </div>
          </div>
          {avgNormalTime > avgPrefetchTime && (
            <div className="text-center mt-2 text-sm text-blue-700">
              预请求快了 {Math.round(((avgNormalTime - avgPrefetchTime) / avgNormalTime) * 100)}%
            </div>
          )}
        </div>
      )}

      {/* 最近记录 */}
      <div className="space-y-2">
        <h4 className="font-medium">最近测试记录</h4>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {records.map((record, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded text-sm ${
                record.mode === 'prefetch'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  record.mode === 'prefetch' ? 'bg-green-500' : 'bg-orange-500'
                }`}></span>
                <span className="font-medium">
                  {record.mode === 'prefetch' ? '预请求' : '普通模式'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono">{record.loadTime}ms</span>
                <span className="text-xs text-gray-500">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 用于记录性能数据的辅助函数
export function recordPerformance(url: string, mode: 'prefetch' | 'normal', loadTime: number) {
  const record: PerformanceRecord = {
    timestamp: Date.now(),
    url,
    mode,
    loadTime
  }

  // 派发自定义事件
  const event = new CustomEvent('performance-record', { detail: record })
  window.dispatchEvent(event)
}
