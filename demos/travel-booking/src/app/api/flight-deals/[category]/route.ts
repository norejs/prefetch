import { NextRequest, NextResponse } from 'next/server'

// 模拟航班优惠数据
const flightDeals = {
  domestic: [
    {
      id: '1',
      destination: '北京 — 西宁',
      price: 210,
      date: '11-05 周三',
      image: '/images/xining.jpg',
      tag: 'TOP 1',
      originalPrice: 450,
      discount: 53
    },
    {
      id: '2',
      destination: '北京 — 成都',
      price: 380,
      date: '11-06 周四',
      image: '/images/chengdu.jpg',
      originalPrice: 680,
      discount: 44
    },
    {
      id: '3',
      destination: '北京 — 广州',
      price: 450,
      date: '11-07 周五',
      image: '/images/guangzhou.jpg',
      originalPrice: 750,
      discount: 40
    },
    {
      id: '4',
      destination: '北京 — 深圳',
      price: 520,
      date: '11-08 周六',
      image: '/images/shenzhen.jpg',
      originalPrice: 850,
      discount: 39
    }
  ],
  international: [
    {
      id: '5',
      destination: '北京 — 东京',
      price: 1200,
      date: '11-08 周六',
      image: '/images/tokyo.jpg',
      originalPrice: 2800,
      discount: 57
    },
    {
      id: '6',
      destination: '北京 — 首尔',
      price: 980,
      date: '11-09 周日',
      image: '/images/seoul.jpg',
      originalPrice: 2200,
      discount: 55
    },
    {
      id: '7',
      destination: '北京 — 新加坡',
      price: 1580,
      date: '11-10 周一',
      image: '/images/singapore.jpg',
      originalPrice: 3200,
      discount: 51
    },
    {
      id: '8',
      destination: '北京 — 曼谷',
      price: 1350,
      date: '11-11 周二',
      image: '/images/bangkok.jpg',
      originalPrice: 2800,
      discount: 52
    }
  ],
  popular: [
    {
      id: '9',
      destination: '北京 — 三亚',
      price: 680,
      date: '11-10 周一',
      image: '/images/sanya.jpg',
      originalPrice: 1200,
      discount: 43,
      tag: '热门'
    },
    {
      id: '10',
      destination: '北京 — 厦门',
      price: 520,
      date: '11-11 周二',
      image: '/images/xiamen.jpg',
      originalPrice: 890,
      discount: 42
    },
    {
      id: '11',
      destination: '北京 — 昆明',
      price: 450,
      date: '11-12 周三',
      image: '/images/kunming.jpg',
      originalPrice: 780,
      discount: 42
    },
    {
      id: '12',
      destination: '北京 — 杭州',
      price: 380,
      date: '11-13 周四',
      image: '/images/hangzhou.jpg',
      originalPrice: 650,
      discount: 42
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  const { category } = params
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 验证分类
  if (!['domestic', 'international', 'popular'].includes(category)) {
    return NextResponse.json(
      { error: '无效的分类' },
      { status: 400 }
    )
  }
  
  const deals = flightDeals[category as keyof typeof flightDeals] || []
  
  return NextResponse.json({
    success: true,
    category,
    deals,
    total: deals.length,
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5分钟缓存
      'X-API-Source': 'travel-booking-api'
    }
  })
}