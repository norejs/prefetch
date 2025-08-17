'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Loading, LoadingSpinner } from '@/components/Loading'
import { recordPerformance } from '@/components/PerformanceTracker'
import { flightSingle } from '@/lib/flightSingle'

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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const fetchProducts = useMemo(() => flightSingle(async () => {
    const response = await fetch('/api/products')
    if (response.ok) {
      const data: ProductsResponse = await response.json()
      setProducts(data.products)
    } else {
      throw new Error('Failed to fetch products')
    }
  }), [])

  useEffect(() => {
    const startTime = Date.now()
    setLoading(true)
    
    fetchProducts()
      .then(() => {
        const endTime = Date.now()
        const duration = endTime - startTime
        setLoadTime(duration)
        
        console.log(`📋 产品列表加载完成: ${duration}ms`)
        
        // 记录性能数据
        recordPerformance(
          '/products',
          'normal',
          duration
        )
      })
      .catch((error) => {
        console.error('获取产品列表失败:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* 返回链接骨架 */}
        <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
        
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

      {/* 加载时间显示 */}
      {loadTime && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-center space-x-3">
            <span className="font-medium">页面加载时间:</span>
            <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">
              {loadTime}ms
            </span>
          </div>
        </div>
      )}

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
