'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Category {
  id: number
  name: string
  count: number
}

interface CategoriesData {
  categories: Category[]
}

export default function CategoriesPage() {
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategoriesData(data)
        }
      } catch (error) {
        console.error('获取分类信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!categoriesData) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">分类信息加载失败</p>
        <Link href="/" className="prefetch-link block text-center mt-4">
          返回首页
        </Link>
      </div>
    )
  }

  const categoryIcons = ['📱', '💻', '🎧', '🔊']

  return (
    <div className="space-y-8">
      {/* 返回链接 */}
      <Link href="/" className="prefetch-link">
        ← 返回首页
      </Link>

      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">商品分类</h1>
        <p className="text-gray-600">浏览我们的全部商品分类</p>
      </div>

      {/* 分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoriesData.categories.map((category, index) => (
          <div key={category.id} className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {categoryIcons[index % categoryIcons.length]}
              </div>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-500 mb-4">{category.count} 件商品</p>
              <button className="btn-primary w-full">
                浏览分类
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 热门商品 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">热门商品</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-medium">
                商品 {item}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">热门商品 {item}</h3>
                <p className="text-gray-500 text-sm mb-3">精选推荐商品，品质保证</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-600">¥{(item * 299).toLocaleString()}</span>
                  <button className="btn-secondary text-sm">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分类统计 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">分类统计</h2>
        <div className="space-y-4">
          {categoriesData.categories.map((category, index) => {
            const totalItems = categoriesData.categories.reduce((sum, cat) => sum + cat.count, 0)
            const percentage = (category.count / totalItems) * 100
            
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.count} 件 ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-700">
              {categoriesData.categories.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()}
            </p>
            <p className="text-gray-500">商品总数</p>
          </div>
        </div>
      </div>

      {/* 快速导航 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">快速导航</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/products/1" className="prefetch-link p-3 text-center rounded-lg border hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-sm">热门商品</div>
          </Link>
          <Link href="/cart" className="prefetch-link p-3 text-center rounded-lg border hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-1">🛒</div>
            <div className="text-sm">购物车</div>
          </Link>
          <Link href="/profile" className="prefetch-link p-3 text-center rounded-lg border hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-1">👤</div>
            <div className="text-sm">我的账户</div>
          </Link>
          <div className="p-3 text-center rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="text-2xl mb-1">📞</div>
            <div className="text-sm">联系客服</div>
          </div>
        </div>
      </div>
    </div>
  )
}
