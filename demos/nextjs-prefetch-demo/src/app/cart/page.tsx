'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CartItem {
  id: number
  productId: number
  name: string
  quantity: number
  price: number
  image: string
}

interface Cart {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cart')
        if (response.ok) {
          const data = await response.json()
          setCart(data)
        }
      } catch (error) {
        console.error('获取购物车信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cart) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">购物车信息加载失败</p>
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

      {/* 购物车标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">购物车</h1>
        <span className="text-gray-500">
          {cart.itemCount} 件商品
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 商品列表 */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-500 text-sm">商品ID: {item.productId}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">¥{item.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        小计: ¥{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 订单摘要 */}
        <div className="card h-fit">
          <h2 className="text-xl font-semibold mb-4">订单摘要</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>商品小计</span>
              <span>¥{cart.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>运费</span>
              <span>{cart.shipping === 0 ? '免费' : `¥${cart.shipping}`}</span>
            </div>
            <div className="flex justify-between">
              <span>税费</span>
              <span>¥{cart.tax.toLocaleString()}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>总计</span>
              <span className="text-blue-600">¥{cart.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <button className="w-full btn-primary">
              结算
            </button>
            <Link href="/products/1" className="block">
              <button className="w-full btn-secondary">
                继续购物
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 推荐商品 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">为您推荐</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
              <h3 className="font-medium mb-1">推荐商品 {item}</h3>
              <p className="text-blue-600 font-semibold">¥999</p>
              <button className="w-full mt-2 btn-secondary text-sm">
                加入购物车
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
