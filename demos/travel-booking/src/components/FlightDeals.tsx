'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp } from 'lucide-react'
import { preFetch } from '@norejs/prefetch'

interface FlightDeal {
  id: string
  destination: string
  price: number
  date: string
  image: string
  tag?: string
}

export default function FlightDeals() {
  const [activeTab, setActiveTab] = useState<'domestic' | 'international' | 'popular'>('domestic')
  const [deals, setDeals] = useState<FlightDeal[]>([])
  const [loading, setLoading] = useState(false)

  // 模拟航班优惠数据
  const mockDeals = {
    domestic: [
      {
        id: '1',
        destination: '北京 — 西宁',
        price: 210,
        date: '11-05 周三',
        image: '/api/placeholder/flight-deal-1',
        tag: 'TOP 1'
      },
      {
        id: '2',
        destination: '北京 — 成都',
        price: 380,
        date: '11-06 周四',
        image: '/api/placeholder/flight-deal-2'
      },
      {
        id: '3',
        destination: '北京 — 广州',
        price: 450,
        date: '11-07 周五',
        image: '/api/placeholder/flight-deal-3'
      }
    ],
    international: [
      {
        id: '4',
        destination: '北京 — 东京',
        price: 1200,
        date: '11-08 周六',
        image: '/api/placeholder/flight-deal-4'
      },
      {
        id: '5',
        destination: '北京 — 首尔',
        price: 980,
        date: '11-09 周日',
        image: '/api/placeholder/flight-deal-5'
      }
    ],
    popular: [
      {
        id: '6',
        destination: '北京 — 三亚',
        price: 680,
        date: '11-10 周一',
        image: '/api/placeholder/flight-deal-6'
      },
      {
        id: '7',
        destination: '北京 — 厦门',
        price: 520,
        date: '11-11 周二',
        image: '/api/placeholder/flight-deal-7'
      }
    ]
  }

  // 使用 preFetch 预取数据
  const prefetchDeals = async (tab: string) => {
    try {
      await preFetch(`/api/flight-deals/${tab}`, {
        expireTime: 30000 // 30秒缓存
      })
    } catch (error) {
      console.log('PreFetch failed, will use mock data:', error)
    }
  }

  // 加载优惠数据
  const loadDeals = async (tab: 'domestic' | 'international' | 'popular') => {
    setLoading(true)
    
    try {
      // 尝试从 API 获取数据
      const response = await fetch(`/api/flight-deals/${tab}`)
      if (response.ok) {
        const data = await response.json()
        setDeals(data.deals || [])
      } else {
        // 使用模拟数据
        setDeals(mockDeals[tab])
      }
    } catch (error) {
      // 使用模拟数据
      setDeals(mockDeals[tab])
    } finally {
      setLoading(false)
    }
  }

  // 切换标签页
  const handleTabChange = async (tab: 'domestic' | 'international' | 'popular') => {
    setActiveTab(tab)
    await loadDeals(tab)
  }

  // 预取其他标签页的数据
  useEffect(() => {
    const tabs = ['domestic', 'international', 'popular'] as const
    tabs.forEach(tab => {
      if (tab !== activeTab) {
        prefetchDeals(tab)
      }
    })
  }, [activeTab])

  // 初始加载
  useEffect(() => {
    loadDeals(activeTab)
  }, [])

  return (
    <div className="mt-8">
      {/* 标题 */}
      <div className="flex items-center mb-4 text-white">
        <MapPin className="w-5 h-5 mr-2" />
        <span className="text-lg font-semibold">北京出发的低价</span>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handleTabChange('domestic')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'domestic'
              ? 'bg-blue-500 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          国内低价榜
        </button>
        <button
          onClick={() => handleTabChange('international')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'international'
              ? 'bg-blue-500 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          降幅榜
        </button>
        <button
          onClick={() => handleTabChange('popular')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'popular'
              ? 'bg-blue-500 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          热度榜
        </button>
      </div>

      {/* 优惠列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white/10 rounded-lg p-4 text-white text-center">
            加载中...
          </div>
        ) : (
          deals.map((deal, index) => (
            <div
              key={deal.id}
              className="bg-white rounded-lg p-4 flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* 图片占位 */}
              <div className="w-16 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-8 h-6 bg-white/20 rounded"></div>
              </div>
              
              {/* 内容 */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {deal.tag && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      {deal.tag}
                    </span>
                  )}
                  <span className="font-semibold text-gray-800">{deal.destination}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{deal.date}</div>
              </div>
              
              {/* 价格 */}
              <div className="text-right">
                <div className="text-blue-500 font-bold">
                  ¥{deal.price}
                  <span className="text-sm font-normal">起</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}