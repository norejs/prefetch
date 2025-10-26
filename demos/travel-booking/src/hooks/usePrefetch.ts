'use client'

import { useEffect, useState } from 'react'
import { setup, preFetch } from '@norejs/prefetch'

interface PrefetchState {
  isInitialized: boolean
  isSupported: boolean
  error: string | null
}

export function usePrefetch() {
  const [state, setState] = useState<PrefetchState>({
    isInitialized: false,
    isSupported: false,
    error: null
  })

  // 初始化 prefetch
  useEffect(() => {
    const initializePrefetch = async () => {
      try {
        // 检查浏览器支持
        if (!('serviceWorker' in navigator)) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            error: 'Service Worker 不支持'
          }))
          return
        }

        setState(prev => ({ ...prev, isSupported: true }))

        // 初始化 prefetch
        const registration = await setup({
          serviceWorkerUrl: '/sw.js',
          scope: '/',
          apiMatcher: '/api/*',
          defaultExpireTime: 5 * 60 * 1000, // 5分钟缓存
          maxCacheSize: 100,
          debug: true
        })

        if (registration) {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            error: null
          }))
          console.log('Travel Booking: Prefetch 初始化成功')
        } else {
          setState(prev => ({
            ...prev,
            error: 'Prefetch 初始化失败'
          }))
        }
      } catch (error) {
        console.error('Travel Booking: Prefetch 初始化错误', error)
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '未知错误'
        }))
      }
    }

    initializePrefetch()
  }, [])

  // 预取数据的方法
  const prefetchData = async (url: string, options?: { expireTime?: number }) => {
    if (!state.isInitialized) {
      console.warn('Travel Booking: Prefetch 未初始化，跳过预取')
      return
    }

    try {
      await preFetch(url, {
        expireTime: options?.expireTime || 30000 // 默认30秒
      })
      console.log('Travel Booking: 预取成功', url)
    } catch (error) {
      console.warn('Travel Booking: 预取失败', url, error)
    }
  }

  // 预取航班优惠数据
  const prefetchFlightDeals = async () => {
    const categories = ['domestic', 'international', 'popular']
    for (const category of categories) {
      await prefetchData(`/api/flight-deals/${category}`)
    }
  }

  // 预取航班搜索数据
  const prefetchFlightSearch = async (params: {
    from?: string
    to?: string
    date?: string
    passengers?: number
    class?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params.from) searchParams.set('from', params.from)
    if (params.to) searchParams.set('to', params.to)
    if (params.date) searchParams.set('date', params.date)
    if (params.passengers) searchParams.set('passengers', params.passengers.toString())
    if (params.class) searchParams.set('class', params.class)

    await prefetchData(`/api/flights/search?${searchParams.toString()}`)
  }

  return {
    ...state,
    prefetchData,
    prefetchFlightDeals,
    prefetchFlightSearch
  }
}