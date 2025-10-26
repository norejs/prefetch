'use client'

import { useState, useEffect, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

interface Train {
  id: string
  trainNumber: string
  trainType: string
  departure: {
    time: string
    station: string
  }
  arrival: {
    time: string
    station: string
  }
  duration: string
  prices: {
    secondClass: number
    firstClass: number
    business: number
  }
  availability: {
    secondClass: string
    firstClass: string
    business: string
  }
  features: string[]
}

function TrainListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [trains, setTrains] = useState<Train[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'flight' | 'train'>('train')
  
  const from = searchParams.get('from') || '上海'
  const to = searchParams.get('to') || '北京'
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  const passengers = searchParams.get('passengers') || '1'

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/trains/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}`)
        const data = await response.json()
        if (data.success) {
          setTrains(data.trains)
        }
      } catch (error) {
        console.error('获取火车票数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrains()
  }, [from, to, date, passengers])

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

  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case 'G': return 'text-blue-500'
      case 'D': return 'text-green-500'
      case 'C': return 'text-purple-500'
      case 'K': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getAvailabilityText = (availability: string) => {
    if (availability === '有') return '有票'
    if (availability === '无') return '无座'
    if (availability.includes('候补')) return '候补'
    return availability
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

      {/* 火车票列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <div className="bg-white">
            {trains.map((train) => (
              <div key={train.id} className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {/* 车次号 */}
                  <div className="w-16">
                    <div className={`text-lg font-bold ${getTrainTypeColor(train.trainType)}`}>
                      {train.trainNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {train.trainType === 'G' ? '高速' : train.trainType === 'D' ? '动车' : '快速'}
                    </div>
                  </div>

                  {/* 出发时间和车站 */}
                  <div className="flex-1 ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {train.departure.time}
                    </div>
                    <div className="text-sm text-gray-500">
                      {train.departure.station}
                    </div>
                  </div>

                  {/* 行程时间 */}
                  <div className="text-center mx-4">
                    <div className="text-sm text-gray-500">
                      {train.duration}
                    </div>
                    <div className="w-16 h-px bg-gray-300 relative mt-1">
                      <div className="absolute right-0 top-0 w-2 h-px bg-gray-300 transform rotate-45 origin-right"></div>
                    </div>
                  </div>

                  {/* 到达时间和车站 */}
                  <div className="flex-1 text-right mr-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {train.arrival.time}
                    </div>
                    <div className="text-sm text-gray-500">
                      {train.arrival.station}
                    </div>
                  </div>

                  {/* 价格 */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-500">
                      ¥{train.prices.secondClass}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getAvailabilityText(train.availability.secondClass)}
                    </div>
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

export default function TrainListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrainListContent />
    </Suspense>
  )
}