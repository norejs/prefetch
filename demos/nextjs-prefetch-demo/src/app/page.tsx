'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loading, LoadingSpinner } from '@/components/Loading'
import { PerformanceTracker } from '@/components/PerformanceTracker'
import { createPreRequest, setup } from '@norejs/prefetch'

export default function Home() {
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [prefetchingUrls, setPrefetchingUrls] = useState<Set<string>>(new Set())
  const [preRequest, setPreRequest] = useState<((url: string, options?: any) => Promise<void>) | null>(null)
  const [lastPrefetchTime, setLastPrefetchTime] = useState<Map<string, number>>(new Map())
  const [hoverTimeouts, setHoverTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())
  const [hoverPrefetchCount, setHoverPrefetchCount] = useState(0)

  useEffect(() => {
    const initializePrefetch = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // 使用 @norejs/prefetch 的 setup 方法初始化
          const registration = await setup({
            serviceWorkerUrl: '/service-worker.js',
            scope: '/'
          })
          
          if (registration) {
            console.log('✅ Service Worker 注册成功:', registration)
            
            // 等待 Service Worker 激活
            await navigator.serviceWorker.ready
            
            // 创建预请求函数
            const preRequestFn = createPreRequest()
            setPreRequest(() => preRequestFn)
            setIsServiceWorkerReady(true)
            
            console.log('✅ Prefetch 初始化完成')
          } else {
            console.error('❌ Service Worker 注册失败')
          }
        } catch (error) {
          console.error('❌ Service Worker 或 Prefetch 初始化失败:', error)
        }
      }
    }

    initializePrefetch()
  }, [])

  // 清理超时器的副作用
  useEffect(() => {
    return () => {
      hoverTimeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [hoverTimeouts])

  const comparisonDemo = {
    title: '性能对比演示',
    description: '直观感受预请求与普通请求的性能差异',
    links: [
      {
        href: '/products?prefetch=true',
        title: '预请求模式',
        description: '数据已预取，页面加载更快',
        color: 'green',
        icon: '⚡',
        prefetchUrl: '/api/products'
      },
      {
        href: '/products?prefetch=false',
        title: '普通模式',
        description: '实时获取数据，感受原始加载速度',
        color: 'orange',
        icon: '🐌',
        prefetchUrl: null
      }
    ]
  }

  const handlePrefetch = async (url: string, source: 'manual' | 'hover' = 'manual') => {
    if (!isServiceWorkerReady || !preRequest) {
      console.warn('⚠️ Service Worker 或 PreRequest 尚未就绪')
      return
    }

    // 如果已经在预请求中，则跳过
    if (prefetchingUrls.has(url)) {
      return
    }

    // 检查间隔限制（只对hover触发的预请求生效）
    if (source === 'hover') {
      const lastTime = lastPrefetchTime.get(url)
      const now = Date.now()
      const PREFETCH_INTERVAL = 20 * 1000 // 20秒间隔
      
      if (lastTime && (now - lastTime) < PREFETCH_INTERVAL) {
        const remainingTime = Math.ceil((PREFETCH_INTERVAL - (now - lastTime)) / 1000)
        console.log(`⏱️ 预请求间隔限制: ${url} (还需等待 ${remainingTime}s)`)
        return
      }
    }

    try {
      // 添加到预请求列表
      setPrefetchingUrls(prev => new Set(prev).add(url))
      
      const startTime = Date.now()
      // 将相对URL转换为绝对URL
      const absoluteUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url
      
      // 使用 createPreRequest 创建的预请求函数
      await preRequest(absoluteUrl, {
        expireTime: 30000  // 30秒过期时间
      })
      
      const duration = Date.now() - startTime
      console.log(`✅ 预请求成功 (${source}): ${url} (${duration}ms)`)
      
      // 更新最后预请求时间和计数
      if (source === 'hover') {
        setLastPrefetchTime(prev => new Map(prev).set(url, Date.now()))
        setHoverPrefetchCount(prev => prev + 1)
      }
    } catch (error) {
      console.error(`❌ 预请求错误 (${source}): ${url}`, error)
    } finally {
      // 从预请求列表中移除
      setPrefetchingUrls(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    }
  }

  // hover 预请求处理函数
  const handleHoverPrefetch = (url: string) => {
    if (!url) return

    // 清除已存在的定时器
    const existingTimeout = hoverTimeouts.get(url)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // 设置新的延迟预请求
    const timeoutId = setTimeout(() => {
      handlePrefetch(url, 'hover')
      setHoverTimeouts(prev => {
        const newMap = new Map(prev)
        newMap.delete(url)
        return newMap
      })
    }, 300) // 300ms 延迟，避免快速滑过时触发

    setHoverTimeouts(prev => new Map(prev).set(url, timeoutId))
  }

  // 取消 hover 预请求
  const handleHoverLeave = (url: string) => {
    const timeoutId = hoverTimeouts.get(url)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setHoverTimeouts(prev => {
        const newMap = new Map(prev)
        newMap.delete(url)
        return newMap
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* 状态指示器 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">系统状态</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isServiceWorkerReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              Service Worker: {isServiceWorkerReady ? '已就绪' : '未就绪'}
            </span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${preRequest ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-sm">
              PreRequest: {preRequest ? '已初始化' : '初始化中'}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
            <span className="text-sm">
              Hover预请求: {hoverPrefetchCount} 次
            </span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>💡 悬停链接时自动预请求，间隔限制20秒</p>
        </div>
      </div>

      {/* 功能介绍 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Next.js 预请求演示</h2>
        <p className="text-gray-600 mb-4">
          这个演示展示了如何在 Next.js 应用中使用 <code className="bg-gray-100 px-1 rounded">@norejs/prefetch</code> 包。
          使用 <code className="bg-gray-100 px-1 rounded">createPreRequest</code> 方法来实现预请求功能，
          通过 Service Worker 缓存管理提升用户体验。
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• 使用 @norejs/prefetch 包</p>
          <p>• createPreRequest 方法预请求</p>
          <p>• 🎯 hover自动预请求 (20秒间隔限制)</p>
          <p>• Service Worker 缓存管理 (30秒过期)</p>
          <p>• 匹配 /api/ 路径的请求</p>
          <p>• 实时状态监控</p>
        </div>
      </div>

      {/* 性能对比演示 */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-center">{comparisonDemo.title}</h2>
        <p className="text-gray-600 mb-6 text-center">{comparisonDemo.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonDemo.links.map((link, index) => {
            const isPrefetching = link.prefetchUrl && prefetchingUrls.has(link.prefetchUrl)
            
            return (
              <div key={index} className={`relative overflow-hidden rounded-lg border-2 ${
                link.color === 'green' 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-orange-300 bg-orange-50'
              } transition-all duration-200`}>
                <Link 
                  href={link.href} 
                  className={`block p-6 ${
                    link.color === 'green' ? 'hover:bg-green-100' : 'hover:bg-orange-100'
                  } transition-colors`}
                  onMouseEnter={() => link.prefetchUrl && handleHoverPrefetch(link.prefetchUrl)}
                  onMouseLeave={() => link.prefetchUrl && handleHoverLeave(link.prefetchUrl)}
                >
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl">{link.icon}</span>
                  </div>
                  <h3 className={`text-lg font-semibold text-center mb-2 ${
                    link.color === 'green' ? 'text-green-800' : 'text-orange-800'
                  }`}>
                    {link.title}
                  </h3>
                  <p className={`text-center text-sm ${
                    link.color === 'green' ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {link.description}
                  </p>
                  <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg ${
                    link.color === 'green' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {link.color === 'green' ? '推荐' : '对比'}
                  </div>
                </Link>
                
                {/* 预请求按钮 */}
                {link.prefetchUrl && (
                  <div className="px-6 pb-4">
                    <button
                      onClick={() => handlePrefetch(link.prefetchUrl!)}
                      className={`w-full text-sm py-2 px-4 rounded flex items-center justify-center space-x-2 ${
                        link.color === 'green'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      } transition-colors`}
                      disabled={!isServiceWorkerReady || !!isPrefetching}
                    >
                      {isPrefetching ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>预请求中...</span>
                        </>
                      ) : (
                        <span>手动预请求数据</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 text-sm text-center">
            💡 提示：悬停卡片自动预请求(20秒间隔)，或手动点击预请求按钮。API 延迟统一为 3-4 秒，预请求的数据会从缓存中快速加载！
          </p>
        </div>
      </div>



      {/* 性能追踪 */}
      <PerformanceTracker />

      {/* 控制台提示 */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">开发者提示</h3>
        <p className="text-blue-700">
          打开浏览器开发者工具的控制台，可以看到预请求的详细日志信息。
          网络面板中也可以观察到预请求的网络活动。
        </p>
      </div>
    </div>
  )
}
