'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)

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

  const demoLinks = [
    {
      href: '/products/1',
      title: '产品详情页',
      description: '查看产品详细信息，演示预请求商品数据',
      prefetchUrl: 'http://localhost:3001/api/products/1'
    },
    {
      href: '/cart',
      title: '购物车页面',
      description: '查看购物车内容，演示预请求购物车数据',
      prefetchUrl: 'http://localhost:3001/api/cart'
    },
    {
      href: '/profile',
      title: '用户资料页',
      description: '查看用户个人信息，演示预请求用户数据',
      prefetchUrl: 'http://localhost:3001/api/user/profile'
    },
    {
      href: '/categories',
      title: '分类页面',
      description: '浏览商品分类，演示预请求分类数据',
      prefetchUrl: 'http://localhost:3001/api/categories'
    }
  ]

  const handlePrefetch = async (url: string) => {
    if (!isServiceWorkerReady) {
      console.warn('Service Worker 尚未就绪')
      return
    }

    try {
      const response = await fetch(url, {
        headers: {
          'X-Prefetch-Request-Type': 'prefetch',
          'X-Prefetch-Expire-Time': '30000'
        }
      })
      
      if (response.ok) {
        console.log(`✅ 预请求成功: ${url}`)
      } else {
        console.error(`❌ 预请求失败: ${url}`)
      }
    } catch (error) {
      console.error(`❌ 预请求错误: ${url}`, error)
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

      {/* 演示链接 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoLinks.map((link, index) => (
          <div key={index} className="card">
            <h3 className="text-lg font-medium mb-2">{link.title}</h3>
            <p className="text-gray-600 mb-4">{link.description}</p>
            <div className="flex flex-col space-y-2">
              <Link 
                href={link.href}
                className="prefetch-link"
                onMouseEnter={() => handlePrefetch(link.prefetchUrl)}
              >
                访问 {link.title} →
              </Link>
              <button
                onClick={() => handlePrefetch(link.prefetchUrl)}
                className="btn-secondary text-sm"
                disabled={!isServiceWorkerReady}
              >
                手动预请求
              </button>
            </div>
          </div>
        ))}
      </div>

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
