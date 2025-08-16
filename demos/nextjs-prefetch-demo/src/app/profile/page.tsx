'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string
  memberLevel: string
  points: number
  joinDate: string
  totalOrders: number
  totalSpent: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('获取用户资料失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">用户资料加载失败</p>
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

      {/* 用户头像和基本信息 */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-gray-600 mb-2">{profile.email}</p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {profile.memberLevel}
              </span>
              <span className="text-sm text-gray-500">
                加入时间: {new Date(profile.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button className="btn-primary">
            编辑资料
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {profile.points.toLocaleString()}
          </div>
          <div className="text-gray-600">积分余额</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {profile.totalOrders}
          </div>
          <div className="text-gray-600">总订单数</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ¥{profile.totalSpent.toLocaleString()}
          </div>
          <div className="text-gray-600">总消费金额</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {Math.floor((Date.now() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-gray-600">会员天数</div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📦
            </div>
            <div>
              <h3 className="font-medium">我的订单</h3>
              <p className="text-sm text-gray-500">查看订单状态</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ❤️
            </div>
            <div>
              <h3 className="font-medium">我的收藏</h3>
              <p className="text-sm text-gray-500">收藏的商品</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              🏆
            </div>
            <div>
              <h3 className="font-medium">会员权益</h3>
              <p className="text-sm text-gray-500">专属优惠</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              📍
            </div>
            <div>
              <h3 className="font-medium">收货地址</h3>
              <p className="text-sm text-gray-500">管理地址</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              💳
            </div>
            <div>
              <h3 className="font-medium">支付方式</h3>
              <p className="text-sm text-gray-500">管理支付</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              ⚙️
            </div>
            <div>
              <h3 className="font-medium">账户设置</h3>
              <p className="text-sm text-gray-500">安全设置</p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">最近活动</h2>
        <div className="space-y-3">
          {[
            { action: '购买了 iPhone 15 Pro', time: '2024-01-15 14:30', type: 'purchase' },
            { action: '收藏了 MacBook Pro', time: '2024-01-14 09:15', type: 'favorite' },
            { action: '获得了 100 积分', time: '2024-01-13 16:45', type: 'points' },
            { action: '更新了收货地址', time: '2024-01-12 11:20', type: 'address' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activity.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'favorite' ? 'bg-red-100 text-red-600' :
                  activity.type === 'points' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'purchase' ? '🛒' :
                   activity.type === 'favorite' ? '❤️' :
                   activity.type === 'points' ? '🎯' : '📝'}
                </div>
                <span className="text-gray-700">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
