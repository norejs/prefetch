# Migration Guide

This guide helps you migrate between different versions of Prefetch and from other prefetching solutions.

[English](#english) | [中文](#中文)

---

## English

### 📋 Migration Overview

- [From v0.0.x to v0.1.x](#from-v00x-to-v01x)
- [From Manual Service Worker to Unified CLI](#from-manual-service-worker-to-unified-cli)
- [From Other Prefetching Solutions](#from-other-prefetching-solutions)
- [Breaking Changes](#breaking-changes)

---

## From v0.0.x to v0.1.x

### 🔄 Major Changes

#### 1. **Unified Package Installation**

**Before v0.1.x:**
```bash
# Had to install both packages
npm install @norejs/prefetch @norejs/prefetch-worker

# Manual service worker setup
npx prefetch-worker install --dir public
```

**After v0.1.x:**
```bash
# Only install one package
npm install @norejs/prefetch

# Unified CLI command
npx prefetch install --dir public
```

#### 2. **Simplified API**

**Before v0.1.x:**
```typescript
import { setup } from '@norejs/prefetch'
import { setupPrefetchWorker } from '@norejs/prefetch-worker'

// Complex setup process
const registration = await setupPrefetchWorker({
  url: '/service-worker.js',
  scope: '/'
})

await setup({
  registration,
  apiMatcher: '\/api\/*'
})
```

**After v0.1.x:**
```typescript
import { setup, preFetch } from '@norejs/prefetch'

// Simple unified setup
await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000,
  maxCacheSize: 100,
  debug: true
})

// Direct prefetch usage
await preFetch('/api/products', { expireTime: 30000 })
```

#### 3. **Enhanced Configuration**

**Before v0.1.x:**
```typescript
// Limited configuration options
await setup({
  apiMatcher: '\/api\/*'
})
```

**After v0.1.x:**
```typescript
// Rich configuration options
await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',           // string or RegExp
  defaultExpireTime: 30000,     // Default cache expiration
  maxCacheSize: 100,            // Maximum cache entries
  debug: true                   // Debug logging
})
```

### 🚀 Migration Steps

#### Step 1: Update Dependencies

```bash
# Remove old dependencies
npm uninstall @norejs/prefetch-worker

# Update to latest version
npm install @norejs/prefetch@latest
```

#### Step 2: Update Service Worker Installation

Replace your service worker installation command:

**Old way:**
```json
{
  "scripts": {
    "copy-sw": "npx prefetch-worker install --dir public"
  }
}
```

**New way:**
```json
{
  "scripts": {
    "copy-sw": "npx prefetch install --dir public"
  }
}
```

#### Step 3: Update Setup Code

**Old setup:**
```typescript
import { setup } from '@norejs/prefetch'

await setup({
  apiMatcher: '\/api\/*'
})
```

**New setup:**
```typescript
import { setup, preFetch } from '@norejs/prefetch'

await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000,
  maxCacheSize: 100,
  debug: process.env.NODE_ENV === 'development'
})

// Use preFetch directly
await preFetch('/api/products', { expireTime: 30000 })
```

#### Step 4: Update Prefetch Usage

**Old way (if you used direct Service Worker messages):**
```typescript
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH_REQUEST',
  url: '/api/products'
})
```

**New way:**
```typescript
import { preFetch } from '@norejs/prefetch'

await preFetch('/api/products', {
  expireTime: 30000
})
```

---

## From Manual Service Worker to Unified CLI

If you were manually managing Service Worker files:

### Before (Manual)

1. **Copy service worker manually**:
   ```bash
   cp node_modules/@norejs/prefetch-worker/dist/service-worker.js public/
   ```

2. **Update files manually** when package updates

3. **Handle build integration** yourself

### After (Unified CLI)

1. **Use unified CLI**:
   ```bash
   npx prefetch install --dir public
   ```

2. **Automatic updates** with package updates

3. **Intelligent path resolution** handles dependency hoisting

---

## From Other Prefetching Solutions

### From Manual Fetch Caching

**Before:**
```typescript
const cache = new Map()

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  
  const response = await fetch(url)
  cache.set(url, response.clone())
  return response
}
```

**After:**
```typescript
import { setup, preFetch } from '@norejs/prefetch'

await setup({
  serviceWorkerUrl: '/service-worker.js',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000
})

// Prefetch data directly
await preFetch('/api/data', { expireTime: 30000 })

// Regular fetch will use cache
const response = await fetch('/api/data')
```

### From SWR/React Query

**Before (SWR):**
```typescript
import useSWR from 'swr'

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher)
  
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return <div>hello {data.name}!</div>
}
```

**After (Prefetch + SWR):**
```typescript
import useSWR from 'swr'
import { preFetch } from '@norejs/prefetch'

function Profile() {
  // Prefetch on component mount or user interaction
  useEffect(() => {
    preFetch('/api/user', { expireTime: 30000 })
  }, [])
  
  const { data, error } = useSWR('/api/user', fetcher)
  
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return <div>hello {data.name}!</div>
}
```

### From Link Prefetching

**Before:**
```html
<link rel="prefetch" href="/api/products">
<link rel="preload" href="/api/user">
```

**After:**
```typescript
import { PrefetchLink } from '@norejs/prefetch'

function Navigation() {
  return (
    <PrefetchLink appUrl="/products">
      <a href="/products">Products</a>
    </PrefetchLink>
  )
}
```

---

## Breaking Changes

### v0.1.0

#### Package Dependencies
- **BREAKING**: `@norejs/prefetch-worker` is now bundled with `@norejs/prefetch`
- **BREAKING**: CLI command changed from `prefetch-worker` to `prefetch`

#### API Changes
- **BREAKING**: `setup()` now requires `serviceWorkerUrl` parameter
- **ADDED**: New configuration options (`defaultExpireTime`, `maxCacheSize`, `debug`)
- **ADDED**: `preFetch()` function for easier prefetch usage

#### Service Worker
- **BREAKING**: Service Worker file location may change based on build setup
- **IMPROVED**: Better error handling and logging
- **IMPROVED**: Automatic dependency resolution

### Migration Checklist

- [ ] Update package.json dependencies
- [ ] Update service worker installation scripts
- [ ] Update setup configuration
- [ ] Test prefetch functionality
- [ ] Update documentation/README
- [ ] Update CI/CD scripts if applicable

---

## 中文

### 📋 迁移概览

- [从 v0.0.x 到 v0.1.x](#从-v00x-到-v01x)
- [从手动 Service Worker 到统一 CLI](#从手动-service-worker-到统一-cli)
- [从其他预请求解决方案](#从其他预请求解决方案)
- [破坏性变更](#破坏性变更)

---

## 从 v0.0.x 到 v0.1.x

### 🔄 主要变更

#### 1. **统一包安装**

**v0.1.x 之前：**
```bash
# 需要安装两个包
npm install @norejs/prefetch @norejs/prefetch-worker

# 手动 service worker 设置
npx prefetch-worker install --dir public
```

**v0.1.x 之后：**
```bash
# 只需安装一个包
npm install @norejs/prefetch

# 统一 CLI 命令
npx prefetch install --dir public
```

#### 2. **简化的 API**

**v0.1.x 之前：**
```typescript
import { setup } from '@norejs/prefetch'
import { setupPrefetchWorker } from '@norejs/prefetch-worker'

// 复杂的设置过程
const registration = await setupPrefetchWorker({
  url: '/service-worker.js',
  scope: '/'
})

await setup({
  registration,
  apiMatcher: '\/api\/*'
})
```

**v0.1.x 之后：**
```typescript
import { setup, preFetch } from '@norejs/prefetch'

// 简单统一的设置
await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000,
  maxCacheSize: 100,
  debug: true
})

// 直接使用预请求
await preFetch('/api/products', { expireTime: 30000 })
```

#### 3. **增强的配置**

**v0.1.x 之前：**
```typescript
// 有限的配置选项
await setup({
  apiMatcher: '\/api\/*'
})
```

**v0.1.x 之后：**
```typescript
// 丰富的配置选项
await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',           // 字符串或正则表达式
  defaultExpireTime: 30000,     // 默认缓存过期时间
  maxCacheSize: 100,            // 最大缓存条目
  debug: true                   // 调试日志
})
```

### 🚀 迁移步骤

#### 步骤 1：更新依赖

```bash
# 移除旧依赖
npm uninstall @norejs/prefetch-worker

# 更新到最新版本
npm install @norejs/prefetch@latest
```

#### 步骤 2：更新 Service Worker 安装

替换你的 service worker 安装命令：

**旧方式：**
```json
{
  "scripts": {
    "copy-sw": "npx prefetch-worker install --dir public"
  }
}
```

**新方式：**
```json
{
  "scripts": {
    "copy-sw": "npx prefetch install --dir public"
  }
}
```

#### 步骤 3：更新设置代码

**旧设置：**
```typescript
import { setup } from '@norejs/prefetch'

await setup({
  apiMatcher: '\/api\/*'
})
```

**新设置：**
```typescript
import { setup, preFetch } from '@norejs/prefetch'

await setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000,
  maxCacheSize: 100,
  debug: process.env.NODE_ENV === 'development'
})

// 直接使用 preFetch
await preFetch('/api/products', { expireTime: 30000 })
```

#### 步骤 4：更新预请求使用

**旧方式（如果你使用直接的 Service Worker 消息）：**
```typescript
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH_REQUEST',
  url: '/api/products'
})
```

**新方式：**
```typescript
import { preFetch } from '@norejs/prefetch'

await preFetch('/api/products', {
  expireTime: 30000
})
```

---

## 从手动 Service Worker 到统一 CLI

如果你之前手动管理 Service Worker 文件：

### 之前（手动）

1. **手动复制 service worker**：
   ```bash
   cp node_modules/@norejs/prefetch-worker/dist/service-worker.js public/
   ```

2. **包更新时手动更新文件**

3. **自己处理构建集成**

### 之后（统一 CLI）

1. **使用统一 CLI**：
   ```bash
   npx prefetch install --dir public
   ```

2. **包更新时自动更新**

3. **智能路径解析**处理依赖提升

---

## 从其他预请求解决方案

### 从手动 Fetch 缓存

**之前：**
```typescript
const cache = new Map()

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  
  const response = await fetch(url)
  cache.set(url, response.clone())
  return response
}
```

**之后：**
```typescript
import { setup, preFetch } from '@norejs/prefetch'

await setup({
  serviceWorkerUrl: '/service-worker.js',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000
})

// 直接预请求数据
await preFetch('/api/data', { expireTime: 30000 })

// 常规 fetch 会使用缓存
const response = await fetch('/api/data')
```

### 从 SWR/React Query

**之前（SWR）：**
```typescript
import useSWR from 'swr'

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher)
  
  if (error) return <div>加载失败</div>
  if (!data) return <div>加载中...</div>
  return <div>你好 {data.name}!</div>
}
```

**之后（Prefetch + SWR）：**
```typescript
import useSWR from 'swr'
import { preFetch } from '@norejs/prefetch'

function Profile() {
  // 在组件挂载或用户交互时预请求
  useEffect(() => {
    preFetch('/api/user', { expireTime: 30000 })
  }, [])
  
  const { data, error } = useSWR('/api/user', fetcher)
  
  if (error) return <div>加载失败</div>
  if (!data) return <div>加载中...</div>
  return <div>你好 {data.name}!</div>
}
```

---

## 破坏性变更

### v0.1.0

#### 包依赖
- **破坏性**：`@norejs/prefetch-worker` 现在与 `@norejs/prefetch` 打包在一起
- **破坏性**：CLI 命令从 `prefetch-worker` 改为 `prefetch`

#### API 变更
- **破坏性**：`setup()` 现在需要 `serviceWorkerUrl` 参数
- **新增**：新的配置选项（`defaultExpireTime`、`maxCacheSize`、`debug`）
- **新增**：用于更简单预请求使用的 `preFetch()` 函数

#### Service Worker
- **破坏性**：Service Worker 文件位置可能根据构建设置而改变
- **改进**：更好的错误处理和日志记录
- **改进**：自动依赖解析

### 迁移检查清单

- [ ] 更新 package.json 依赖
- [ ] 更新 service worker 安装脚本
- [ ] 更新设置配置
- [ ] 测试预请求功能
- [ ] 更新文档/README
- [ ] 更新 CI/CD 脚本（如果适用）

---

## 🆘 Need Help?

If you encounter issues during migration:

1. **Check the documentation** for the latest API
2. **Review the demo projects** for working examples
3. **Open an issue** on GitHub with your specific problem
4. **Join our Discord** for community support (coming soon)

## 🆘 需要帮助？

如果你在迁移过程中遇到问题：

1. **查看文档** 获取最新 API 信息
2. **查看演示项目** 获取工作示例
3. **在 GitHub 上开启 issue** 描述你的具体问题
4. **加入我们的 Discord** 获取社区支持（即将推出）

---

## 🚀 What's Next?

After migration, explore new features:

- **Enhanced debugging** with detailed console logs
- **Flexible caching strategies** with custom expiration times
- **React integration** with `PrefetchLink` component
- **Advanced configuration** for complex use cases

## 🚀 接下来呢？

迁移后，探索新功能：

- **增强调试** 功能，提供详细的控制台日志
- **灵活的缓存策略** 支持自定义过期时间
- **React 集成** 使用 `PrefetchLink` 组件
- **高级配置** 适用于复杂用例
