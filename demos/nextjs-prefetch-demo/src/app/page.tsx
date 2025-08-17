'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loading, LoadingSpinner } from '@/components/Loading'
import { PerformanceTracker } from '@/components/PerformanceTracker'

export default function Home() {
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [prefetchingUrls, setPrefetchingUrls] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker 注册成功:', registration.scope)
          setIsServiceWorkerReady(true)
        })
        .catch((error) => {
          console.error('Service Worker 注册失败:', error)
        })
    }
  }, [])

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

  const handlePrefetch = async (url: string) => {
    if (!isServiceWorkerReady) {
      console.warn('Service Worker 尚未就绪')
      return
    }

    // 如果已经在预请求中，则跳过
    if (prefetchingUrls.has(url)) {
      return
    }

    try {
      // 添加到预请求列表
      setPrefetchingUrls(prev => new Set(prev).add(url))
      
      const startTime = Date.now()
      // 将相对URL转换为绝对URL
      const absoluteUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url
      
      const response = await fetch(absoluteUrl)
      
      const duration = Date.now() - startTime
      
      if (response.ok) {
        console.log(`✅ 预请求成功: ${url} (${duration}ms)`)
      } else {
        console.error(`❌ 预请求失败: ${url}`)
      }
    } catch (error) {
      console.error(`❌ 预请求错误: ${url}`, error)
    } finally {
      // 从预请求列表中移除
      setPrefetchingUrls(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
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
        </div>
      </div>

      {/* 功能介绍 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Next.js 预请求演示</h2>
        <p className="text-gray-600 mb-4">
          这个演示展示了如何在 Next.js 应用中集成预请求功能。当你悬停在链接上或点击预请求按钮时，
          系统会提前请求页面所需的数据，从而提升用户体验。
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• 悬停链接触发预请求</p>
          <p>• Service Worker 缓存管理</p>
          <p>• 智能缓存过期控制</p>
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
                <Link href={link.href} className={`block p-6 ${
                  link.color === 'green' ? 'hover:bg-green-100' : 'hover:bg-orange-100'
                } transition-colors`}>
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
            💡 提示：先手动预请求数据，然后点击预请求模式体验差异。API 延迟统一为 3-4 秒，预请求的数据会从缓存中快速加载！
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
