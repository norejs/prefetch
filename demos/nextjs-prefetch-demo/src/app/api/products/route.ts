import { NextRequest, NextResponse } from 'next/server'

const products = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 7999,
    description: '强大的 A17 Pro 芯片，钛金属机身，专业级摄像头系统',
    category: '智能手机',
    image: 'https://placeholder.co/400x300/007ACC/white?text=iPhone+15+Pro'
  },
  {
    id: 2,
    name: 'MacBook Pro M3',
    price: 14999,
    description: '搭载M3芯片的新一代MacBook Pro，性能强劲',
    category: '笔记本电脑',
    image: 'https://placeholder.co/400x300/4ECDC4/white?text=MacBook+Pro'
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    price: 1899,
    description: '主动降噪，空间音频，长续航',
    category: '耳机',
    image: 'https://placeholder.co/400x300/FF6B6B/white?text=AirPods+Pro'
  },
  {
    id: 4,
    name: 'iPad Air',
    price: 4799,
    description: '轻薄设计，强大性能，支持Apple Pencil',
    category: '平板电脑',
    image: 'https://placeholder.co/400x300/45B7D1/white?text=iPad+Air'
  },
  {
    id: 5,
    name: 'Apple Watch Series 9',
    price: 2999,
    description: '健康监测，运动追踪，智能提醒',
    category: '智能手表',
    image: 'https://placeholder.co/400x300/F9CA24/white?text=Apple+Watch'
  },
  {
    id: 6,
    name: 'Mac Studio',
    price: 15999,
    description: '专业工作站，M2 Ultra芯片，极致性能',
    category: '台式电脑',
    image: 'https://placeholder.co/400x300/6C5CE7/white?text=Mac+Studio'
  }
]

// 模拟延迟函数
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(request: NextRequest) {
  // 统一的网络延迟模拟 (固定3秒)
  const delayTime = 3000

  await delay(delayTime)

  console.log(`📡 [REQUEST] /api/products - ${delayTime}ms`)

  const response = NextResponse.json({
    products,
    total: products.length,
    page: 1,
    limit: 20
  })

  response.headers.set('X-Response-Time', delayTime.toString())
  
  return response
}
