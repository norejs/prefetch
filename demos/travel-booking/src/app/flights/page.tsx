'use client'

import { useState, useEffect, Suspense } from 'react'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

interface Flight {
  id: string
  flightNumber: string
  airline: string
  departure: {
    time: string
    airport: string
    terminal: string
  }
  arrival: {
    time: string
    airport: string
    terminal: string
  }
  duration: string
  price: {
    economy: number
    business: number
  }
  aircraft: string
  punctuality: number
  features: string[]
}

function FlightListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'time' | 'price'>('time')
  
  const from = searchParams.get('from') || '上海'
  const to = searchParams.get('to') || '北京'
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  const passengers = searchParams.get('passengers') || '1'

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}`)
        const data = await response.json()
        if (data.success) {
          setFlights(data.flights)
        }
      } catch (error) {
        console.error('获取航班数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
  }, [from, to, date, passengers])

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') {
      return a.price.economy - b.price.economy
    }
    return a.departure.time.localeCompare(b.departure.time)
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '今日'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日'
    }
    return format(date, 'M月d日')
  }

  const getWeekday = (dateStr: string) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[new Date(dateStr).getDay()]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-blue-500 px-4 py-4 flex items-center justify-between">
        <button type="button" onClick={() => router.back()} className="text-white" title="返回">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-white text-lg font-medium">
          {from} → {to}
        </div>
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* 日期选择 */}
      <div className="bg-blue-500 px-4 py-3">
        <div className="flex space-x-2">
          {[-1, 0, 1, 2, 3].map((offset) => {
            const targetDate = new Date()
            targetDate.setDate(targetDate.getDate() + offset)
            const dateStr = format(targetDate, 'yyyy-MM-dd')
            const isSelected = dateStr === date
            
            return (
              <div
                key={offset}
                className={`flex-1 py-2 px-2 text-center ${
                  isSelected 
                    ? 'bg-white bg-opacity-20 rounded-lg' 
                    : ''
                }`}
              >
                <div className="text-sm text-white font-medium">{format(targetDate, 'M-d')}</div>
                <div className="text-xs text-white opacity-80">{getWeekday(dateStr)}</div>
                <div className="text-xs text-white font-bold">¥{offset === 0 ? '1010' : offset === 1 ? '470' : offset === 2 ? '470' : offset === 3 ? '400' : '390'}</div>
              </div>
            )
          })}
          <button type="button" className="p-2 text-white" title="更多日期">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 筛选条件 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <button type="button" className="flex items-center space-x-1 text-sm text-gray-600">
            <span>筛选</span>
            <span className="text-blue-500">▼</span>
          </button>
          <button type="button" className="flex items-center space-x-1 text-sm text-gray-600">
            <span>机场</span>
            <span className="text-blue-500">▼</span>
          </button>
          <button type="button" className="flex items-center space-x-1 text-sm text-gray-600">
            <span>公务舱/头等舱</span>
          </button>
          <button type="button" className="flex items-center space-x-1 text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded">
            <span>低价优先</span>
            <span>▼</span>
          </button>
        </div>
      </div>

      {/* 特惠航班标签 */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="text-sm text-orange-600 font-medium">特惠航班</div>
      </div>

      {/* 航班列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <div className="bg-white">
            {sortedFlights.map((flight, index) => (
              <div key={flight.id} className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {/* 航空公司图标 */}
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  </div>

                  {/* 出发时间和机场 */}
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {flight.departure.time}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.departure.airport}
                    </div>
                    <div className="text-xs text-gray-400">
                      {flight.flightNumber} | 空客321(中) | 有小食
                    </div>
                  </div>

                  {/* 到达时间和机场 */}
                  <div className="flex-1 text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {flight.arrival.time}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.arrival.airport}
                    </div>
                  </div>

                  {/* 价格 */}
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-blue-500">
                      ¥{flight.price.economy}
                    </div>
                    {index === 3 && (
                      <div className="text-xs text-orange-500">
                        普通会员可享
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}

export default function FlightListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlightListContent />
    </Suspense>
  )
}