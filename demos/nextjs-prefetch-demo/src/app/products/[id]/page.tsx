'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  id: number
  name: string
  price: number
  description: string
  specs: string[]
  category: string
  stock: number
  images: string[]
}

interface Comments {
  comments: Array<{
    id: number
    user: string
    rating: number
    comment: string
    date: string
  }>
  rating: number
  totalComments: number
  productId: number
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [comments, setComments] = useState<Comments | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        }
      } catch (error) {
        console.error('获取产品信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleLoadComments = async () => {
    setLoadingComments(true)
    try {
      const response = await fetch(`http://localhost:3001/api/products/2`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handlePrefetchComments = async () => {
    try {
      await fetch('http://localhost:3001/api/products/2', {
        headers: {
          'X-Prefetch-Request-Type': 'prefetch',
          'X-Prefetch-Expire-Time': '30000'
        }
      })
      console.log('✅ 评论数据预请求成功')
    } catch (error) {
      console.error('❌ 评论数据预请求失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">产品信息未找到</p>
        <Link href="/" className="prefetch-link block text-center mt-4">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 返回链接 */}
      <Link href="/" className="prefetch-link">
        ← 返回首页
      </Link>

      {/* 产品信息 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-blue-600 mb-4">
              ¥{product.price.toLocaleString()}
            </p>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">产品规格:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {product.specs.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">库存: {product.stock} 件</span>
                <span className="text-sm text-gray-500">分类: {product.category}</span>
              </div>
              
              <button className="btn-primary">
                加入购物车
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 评论区域 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">用户评论</h2>
          <div className="space-x-2">
            <button
              onClick={handlePrefetchComments}
              className="btn-secondary text-sm"
            >
              预请求评论
            </button>
            <button
              onClick={handleLoadComments}
              disabled={loadingComments}
              className="btn-primary text-sm"
            >
              {loadingComments ? '加载中...' : '加载评论'}
            </button>
          </div>
        </div>

        {comments ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-2xl font-bold">{comments.rating}</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= Math.floor(comments.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                共 {comments.totalComments.toLocaleString()} 条评论
              </span>
            </div>

            <div className="space-y-4">
              {comments.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">{comment.user}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= comment.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{comment.date}</span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            点击上方按钮加载评论，或者先预请求再加载以体验速度差异
          </p>
        )}
      </div>
    </div>
  )
}
