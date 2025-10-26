'use client'

import { useState } from 'react'
import { Search, Plane, Calendar } from 'lucide-react'

interface FlightSearchProps {
  onSearch: (searchData: any) => void
}

export default function FlightSearch({ onSearch }: FlightSearchProps) {
  const [searchData, setSearchData] = useState({
    from: '北京',
    to: '上海',
    date: '10月27日',
    passengers: 1,
    class: 'economy'
  })

  const handleSearch = () => {
    onSearch(searchData)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="space-y-4">
        {/* 出发地和目的地 */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">出发</label>
            <input
              type="text"
              value={searchData.from}
              onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
              className="w-full text-xl font-bold text-gray-800 bg-transparent border-none outline-none"
            />
          </div>
          
          <div className="mx-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          
          <div className="flex-1 text-right">
            <label className="block text-sm text-gray-600 mb-1">到达</label>
            <input
              type="text"
              value={searchData.to}
              onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
              className="w-full text-xl font-bold text-gray-800 bg-transparent border-none outline-none text-right"
            />
          </div>
        </div>

        {/* 日期选择 */}
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            value={searchData.date}
            onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
            className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none"
          />
        </div>

        {/* 搜索按钮 */}
        <button
          onClick={handleSearch}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>搜索航班</span>
        </button>
      </div>
    </div>
  )
}