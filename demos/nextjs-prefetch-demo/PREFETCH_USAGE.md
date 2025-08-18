# Next.js Prefetch Demo - 使用说明

本演示项目展示如何在 Next.js 应用中集成 `@norejs/prefetch` 包来实现高效的预请求功能。

## 🚀 核心功能

### 1. **自动初始化**
- Service Worker 自动注册和激活
- Prefetch 系统自动初始化
- 状态实时监控

### 2. **预请求方法**
直接使用 `preFetch` 方法：

```typescript
import { preFetch, setup } from '@norejs/prefetch'

// 初始化
await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/'
})

// 直接预请求
await preFetch('/api/products', {
  expireTime: 30000  // 30秒过期时间
})
```

### 3. **Hover 自动预请求**
支持悬停时自动触发预请求，带有智能间隔控制：

```typescript
const [lastPrefetchTime, setLastPrefetchTime] = useState(new Map())
const [hoverTimeouts, setHoverTimeouts] = useState(new Map())

const handleHoverPrefetch = (url: string) => {
  // 300ms 延迟，避免快速滑过时触发
  const timeoutId = setTimeout(() => {
    // 20秒间隔限制
    const lastTime = lastPrefetchTime.get(url)
    const now = Date.now()
    if (lastTime && (now - lastTime) < 20000) return
    
    handlePrefetch(url, 'hover')
  }, 300)
  
  setHoverTimeouts(prev => new Map(prev).set(url, timeoutId))
}

// 在 JSX 中使用
<Link 
  href="/products"
  onMouseEnter={() => handleHoverPrefetch('/api/products')}
  onMouseLeave={() => handleHoverLeave('/api/products')}
>
  产品页面
</Link>
```

### 4. **请求头识别**
预请求会自动添加以下请求头：
- `X-Prefetch-Request-Type: prefetch`
- `X-Prefetch-Expire-Time: 30000`

### 5. **缓存机制**
- 只有预请求会创建缓存
- 正式请求优先从缓存获取数据
- 30秒自动过期清理
- 匹配 `/api/` 路径的请求

## 📋 使用步骤

### 1. **安装依赖**
```bash
npm install @norejs/prefetch
```

### 2. **复制 Service Worker**
```bash
npm run copy-sw
```

### 3. **初始化预请求**
```typescript
'use client'

import { preFetch, setup } from '@norejs/prefetch'
import { useEffect, useState } from 'react'

export default function App() {
  const [isPrefetchReady, setIsPrefetchReady] = useState(false)
  
  useEffect(() => {
    const initializePrefetch = async () => {
      // 注册 Service Worker
      await setup({
        serviceWorkerUrl: '/service-worker.js',
        scope: '/'
      })
      
      // preFetch 可以直接使用
      setIsPrefetchReady(true)
    }
    
    initializePrefetch()
  }, [])
  
  const handlePrefetch = async (url) => {
    if (isPrefetchReady) {
      await preFetch(url, { expireTime: 30000 })
    }
  }
  
  return (
    <div>
      <button onClick={() => handlePrefetch('/api/data')}>
        预请求数据
      </button>
    </div>
  )
}
```

### 4. **查看效果**
1. 打开浏览器开发者工具
2. 查看 Network 面板
3. 点击预请求按钮
4. 观察请求头和缓存行为

## 🔍 技术细节

### Service Worker 配置
Service Worker 会自动：
- 拦截匹配的 API 请求
- 识别预请求头部
- 管理缓存策略
- 处理过期清理

### 缓存策略
- **预请求**: 发起网络请求并缓存响应
- **正式请求**: 优先使用缓存，无缓存则发起网络请求
- **过期清理**: 基于时间戳自动清理过期缓存

### Hover 预请求机制
- **延迟触发**: 300ms 延迟，避免快速滑过触发
- **间隔控制**: 同一URL 20秒内只预请求一次
- **自动清理**: 组件卸载时清理所有定时器
- **状态跟踪**: 实时显示预请求次数和状态

### URL匹配
当前配置匹配 `/api/` 开头的请求路径，可以通过修改 Service Worker 的 `apiMatcher` 正则来调整。

## 🎯 性能优势

1. **首次访问**: 预请求在后台加载数据
2. **二次访问**: 从缓存快速获取数据
3. **智能缓存**: 避免重复请求和存储
4. **自动清理**: 防止缓存无限增长

## ⚠️ 注意事项

1. **HTTPS 要求**: Service Worker 需要 HTTPS 环境（开发环境除外）
2. **同源策略**: 预请求仅支持同源请求
3. **缓存容量**: 默认最大缓存 100 个请求
4. **浏览器支持**: 需要支持 Service Worker 的现代浏览器

## 📊 调试工具

1. **浏览器控制台**: 查看预请求日志
2. **Network 面板**: 观察请求头和响应
3. **Application 面板**: 查看 Service Worker 状态
4. **状态指示器**: 实时显示系统状态
