'use client'

import { useState, useEffect } from 'react'
import { Plane, Calendar, Users, ArrowUpDown, MapPin } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import FlightSearch from '@/components/FlightSearch'
import FlightDeals from '@/components/FlightDeals'
import ServiceTabs from '@/components/ServiceTabs'
import { usePrefetch } from '@/hooks/usePrefetch'

export default function Home() {
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay')
  const [departure, setDeparture] = useState('北京')
  const [destination, setDestination] = useState('上海')
  const [departureDate, setDepartureDate] = useState(new Date())
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 7))
  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState('economy')
  
  const { isInitialized, isSupported, error, prefetchFlightSearch, prefetchFlightDeals } = usePrefetch()

  const swapCities = () => {
    const temp = departure
    setDeparture(destination)
    setDestination(temp)
  }

  // 预取热门搜索数据
  useEffect(() => {
    if (isInitialized) {
      // 预取航班优惠数据
      prefetchFlightDeals()
      
      // 预取热门路线的搜索数据
      const popularRoutes = [
        { from: '北京', to: '上海' },
        { from: '北京', to: '广州' },
        { from: '北京', to: '深圳' },
        { from: '上海', to: '北京' }
      ]
      
      popularRoutes.forEach(route => {
        prefetchFlightSearch({
          from: route.from,
          to: route.to,
          date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          passengers: 1,
          class: 'economy'
        })
      })
    }
  }, [isInitialized, prefetchFlightDeals, prefetchFlightSearch])

  // 处理搜索
  const handleSearch = async () => {
    // 预取搜索结果
    if (isInitialized) {
      await prefetchFlightSearch({
        from: departure,
        to: destination,
        date: format(departureDate, 'yyyy-MM-dd'),
        passengers,
        class: cabinClass
      })
    }
    
    // 这里可以导航到搜索结果页面
    console.log('搜索航班:', {
      tripType,
      departure,
      destination,
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      returnDate: tripType === 'roundTrip' ? format(returnDate, 'yyyy-MM-dd') : null,
      passengers,
      cabinClass
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600">
      {/* 背景飞机图片 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-64 opacity-30">
          <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
            <Plane className="w-32 h-32 text-white transform rotate-12" />
          </div>
        </div>
      </div>

      {/* 顶部导航 */}
      <div className="relative z-10 flex justify-between items-center p-4 text-white">
        <button className="p-2">
          <ArrowUpDown className="w-6 h-6 rotate-90" />
        </button>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 px-4 pt-8">
        {/* 搜索卡片 */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md">
          {/* 单程/往返选择 */}
          <div className="flex mb-6">
            <button
              onClick={() => setTripType('oneWay')}
              className={`flex-1 py-3 text-center rounded-l-lg font-medium ${
                tripType === 'oneWay'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              单程
            </button>
            <button
              onClick={() => setTripType('roundTrip')}
              className={`flex-1 py-3 text-center rounded-r-lg font-medium ${
                tripType === 'roundTrip'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              往返
            </button>
          </div>

          {/* 城市选择 */}
          <div className="relative mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {departure}
                </div>
              </div>
              
              <button
                onClick={swapCities}
                className="mx-4 p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
              >
                <div className="w-8 h-8 border-2 border-blue-400 rounded-full flex items-center justify-center">
                  <Plane className="w-4 h-4 text-blue-500" />
                </div>
              </button>
              
              <div className="flex-1 text-right">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {destination}
                </div>
              </div>
            </div>
          </div>

          {/* 日期选择 */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-lg font-semibold text-gray-800">
                {format(departureDate, 'M月d日', { locale: zhCN })}
                <span className="text-sm text-gray-500 ml-1">明天</span>
              </span>
            </div>
          </div>

          {/* 舱位选择 */}
          <div className="flex mb-6 text-sm">
            <button
              onClick={() => setCabinClass('economy')}
              className={`flex-1 py-2 px-3 rounded-l-lg ${
                cabinClass === 'economy'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              经济舱
            </button>
            <button
              onClick={() => setCabinClass('business')}
              className={`flex-1 py-2 px-3 rounded-r-lg ${
                cabinClass === 'business'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              公务舱/头等舱
            </button>
          </div>

          {/* 搜索按钮 */}
          <button 
            onClick={handleSearch}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            搜 索
          </button>

          {/* Prefetch 状态指示 */}
          {isSupported && (
            <div className="mt-2 text-center">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                isInitialized 
                  ? 'bg-green-100 text-green-800' 
                  : error 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  isInitialized 
                    ? 'bg-green-500' 
                    : error 
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}></div>
                {isInitialized ? '智能预取已启用' : error ? '预取初始化失败' : '预取初始化中...'}
              </div>
            </div>
          )}

          {/* 服务标签 */}
          <ServiceTabs />
        </div>

        {/* 低价推荐 */}
        <FlightDeals />
      </div>
    </div>
  )
}