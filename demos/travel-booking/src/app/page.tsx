'use client'

import { useState } from 'react'
import { ArrowLeft, Plane, Shuffle, Calendar, Users } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useRouter } from 'next/navigation'

type TravelType = 'flight' | 'train'
type TripType = 'oneWay' | 'roundTrip'
type CabinType = 'economy' | 'business'

// 城市数据
const cities = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', 
  '西安', '武汉', '天津', '青岛', '大连', '厦门', '昆明', '三亚'
]

export default function Home() {
  const router = useRouter()
  const [travelType, setTravelType] = useState<TravelType>('flight')
  const [tripType, setTripType] = useState<TripType>('oneWay')
  const [departure, setDeparture] = useState('北京')
  const [destination, setDestination] = useState('上海')
  const [departureDate, setDepartureDate] = useState(addDays(new Date(), 1))
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 2))
  const [passengers, setPassengers] = useState(1)
  const [cabinType, setCabinType] = useState<CabinType>('economy')
  
  // 弹窗状态
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [citySelectType, setCitySelectType] = useState<'departure' | 'destination'>('departure')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateSelectType, setDateSelectType] = useState<'departure' | 'return'>('departure')
  const [showPassengerSelector, setShowPassengerSelector] = useState(false)

  const swapCities = () => {
    const temp = departure
    setDeparture(destination)
    setDestination(temp)
  }

  const handleCitySelect = (city: string) => {
    if (citySelectType === 'departure') {
      setDeparture(city)
    } else {
      setDestination(city)
    }
    setShowCitySelector(false)
  }

  const handleDateSelect = (date: Date) => {
    if (dateSelectType === 'departure') {
      setDepartureDate(date)
    } else {
      setReturnDate(date)
    }
    setShowDatePicker(false)
  }

  const handleSearch = () => {
    // 导航到对应的列表页面
    const searchParams = new URLSearchParams({
      from: departure,
      to: destination,
      date: format(departureDate, 'yyyy-MM-dd'),
      passengers: passengers.toString(),
      tripType,
      cabin: cabinType
    })
    
    if (tripType === 'roundTrip') {
      searchParams.append('returnDate', format(returnDate, 'yyyy-MM-dd'))
    }
    
    if (travelType === 'flight') {
      router.push(`/flights?${searchParams.toString()}`)
    } else {
      router.push(`/trains?${searchParams.toString()}`)
    }
  }

  const getDateDisplay = (date: Date) => {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const dayAfterTomorrow = addDays(today, 2)
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return '今天'
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return '明天'
    } else if (format(date, 'yyyy-MM-dd') === format(dayAfterTomorrow, 'yyyy-MM-dd')) {
      return '后天'
    }
    return format(date, 'M月d日')
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)'
    }}>
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between">
        <button type="button" className="text-white" title="返回">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-white text-lg font-medium">
          北京 → 上海
        </div>
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* 主要搜索区域 */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* 飞机图片区域 */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full"></div>
              <div className="absolute inset-4 bg-white bg-opacity-30 rounded-full"></div>
              <div className="absolute inset-8 bg-white bg-opacity-40 rounded-full flex items-center justify-center">
                <Plane className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* 搜索表单 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {/* 行程类型选择 */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setTripType('oneWay')}
                className={`flex-1 py-3 text-center rounded-md font-medium transition-all ${
                  tripType === 'oneWay'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                单程
              </button>
              <button
                type="button"
                onClick={() => setTripType('roundTrip')}
                className={`flex-1 py-3 text-center rounded-md font-medium transition-all ${
                  tripType === 'roundTrip'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                往返
              </button>
            </div>

            {/* 城市选择 */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCitySelectType('departure')
                    setShowCitySelector(true)
                  }}
                  className="flex-1 text-left"
                >
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {departure}
                  </div>
                  <div className="text-sm text-gray-500">出发</div>
                </button>
                
                <button
                  type="button"
                  onClick={swapCities}
                  className="mx-6 p-2 bg-blue-500 rounded-full"
                  title="交换出发地和目的地"
                >
                  <Shuffle className="w-5 h-5 text-white" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setCitySelectType('destination')
                    setShowCitySelector(true)
                  }}
                  className="flex-1 text-right"
                >
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {destination}
                  </div>
                  <div className="text-sm text-gray-500">到达</div>
                </button>
              </div>
            </div>

            {/* 日期选择 */}
            <div className="mb-6">
              <div className={`grid ${tripType === 'roundTrip' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectType('departure')
                    setShowDatePicker(true)
                  }}
                  className="bg-gray-50 rounded-xl p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">出发日期</div>
                      <div className="text-xl font-bold text-gray-800">
                        {format(departureDate, 'M月d日')} {getDateDisplay(departureDate)}
                      </div>
                    </div>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                
                {tripType === 'roundTrip' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateSelectType('return')
                      setShowDatePicker(true)
                    }}
                    className="bg-gray-50 rounded-xl p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">返程日期</div>
                        <div className="text-xl font-bold text-gray-800">
                          {format(returnDate, 'M月d日')} {getDateDisplay(returnDate)}
                        </div>
                      </div>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* 乘客和舱位选择 */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setShowPassengerSelector(true)}
                className="bg-gray-50 rounded-xl p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">乘客</div>
                    <div className="text-lg font-bold text-gray-800">
                      {passengers}人
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </button>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-2">舱位</div>
                <div className="flex bg-white rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setCabinType('economy')}
                    className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-all ${
                      cabinType === 'economy'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    经济舱
                  </button>
                  <button
                    type="button"
                    onClick={() => setCabinType('business')}
                    className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-all ${
                      cabinType === 'business'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    公务舱
                  </button>
                </div>
              </div>
            </div>

            {/* 搜索按钮 */}
            <button 
              type="button"
              onClick={handleSearch}
              className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all"
            >
              搜索
            </button>

            {/* 底部功能 */}
            <div className="grid grid-cols-4 gap-4 mt-6 text-center">
              <div className="text-gray-600">
                <div className="text-sm">机票订单</div>
              </div>
              <div className="text-gray-600">
                <div className="text-sm">航班助手</div>
              </div>
              <div className="text-gray-600">
                <div className="text-sm">在线选座</div>
              </div>
              <div className="text-gray-600">
                <div className="text-sm">团体票</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 城市选择弹窗 */}
      {showCitySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                选择{citySelectType === 'departure' ? '出发' : '到达'}城市
              </h3>
              <button
                type="button"
                onClick={() => setShowCitySelector(false)}
                className="text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`py-3 px-4 rounded-lg text-center font-medium transition-all ${
                    (citySelectType === 'departure' ? departure : destination) === city
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 日期选择弹窗 */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                选择{dateSelectType === 'departure' ? '出发' : '返程'}日期
              </h3>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 30 }, (_, i) => {
                const date = addDays(new Date(), i)
                const isSelected = format(date, 'yyyy-MM-dd') === format(
                  dateSelectType === 'departure' ? departureDate : returnDate, 
                  'yyyy-MM-dd'
                )
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`py-3 px-4 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {format(date, 'M月d日')} {getDateDisplay(date)}
                        </div>
                        <div className="text-sm opacity-70">
                          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 乘客选择弹窗 */}
      {showPassengerSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">选择乘客数量</h3>
              <button
                type="button"
                onClick={() => setShowPassengerSelector(false)}
                className="text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium">成人</div>
                <div className="text-sm text-gray-500">12岁以上</div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold"
                  disabled={passengers <= 1}
                >
                  -
                </button>
                <span className="text-xl font-bold w-8 text-center">{passengers}</span>
                <button
                  type="button"
                  onClick={() => setPassengers(Math.min(9, passengers + 1))}
                  className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold"
                  disabled={passengers >= 9}
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPassengerSelector(false)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium mt-4"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  )
}