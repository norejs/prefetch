'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loading, LoadingSpinner } from '@/components/Loading'
import { recordPerformance } from '@/components/PerformanceTracker'

interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  image: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  
  // 检查是否启用预请求（现在只是标识，不影响服务器响应）
  const enablePrefetch = searchParams.get('prefetch') !== 'false'
  const mode = enablePrefetch ? '预请求模式（数据已预取）' : '普通模式（实时获取）'

  useEffect(() => {
    const fetchProducts = async () => {
      const startTime = Date.now()
      setLoading(true)
      
      try {
        const response = await fetch('/api/products')
        
        if (response.ok) {
          const data: ProductsResponse = await response.json()
          setProducts(data.products)
          
          const endTime = Date.now()
          const duration = endTime - startTime
          setLoadTime(duration)
          
          console.log(`📋 产品列表加载完成 (${mode}): ${duration}ms`)
          
          // 记录性能数据
          recordPerformance(
            '/products',
            enablePrefetch ? 'prefetch' : 'normal',
            duration
          )
        }
      } catch (error) {
        console.error('获取产品列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [enablePrefetch, mode])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* 返回链接骨架 */}
        <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
        
        {/* 模式指示器骨架 */}
        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
        
        {/* 产品列表骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card">
              <div className="h-48 bg-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 返回链接 */}
      <Link href="/" className="prefetch-link">
        ← 返回首页
      </Link>

      {/* 模式指示器 */}
      <div className={`card ${enablePrefetch ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${enablePrefetch ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="font-medium">{mode}</span>
            {loadTime && (
              <span className={`text-sm px-2 py-1 rounded ${enablePrefetch ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                加载时间: {loadTime}ms
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Link 
              href="/products?prefetch=true"
              className={`text-sm px-3 py-1 rounded ${enablePrefetch ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              预请求模式
            </Link>
            <Link 
              href="/products?prefetch=false"
              className={`text-sm px-3 py-1 rounded ${!enablePrefetch ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              普通模式
            </Link>
          </div>
        </div>
      </div>

      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">产品列表</h1>
        <p className="text-gray-600">
          共找到 {products.length} 个产品
        </p>
      </div>

      {/* 产品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">¥{product.price}</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">暂无产品数据</div>
        </div>
      )}
    </div>
  )
}
