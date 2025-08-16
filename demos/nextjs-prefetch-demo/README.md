# Next.js Prefetch Demo

Next.js 预请求功能演示项目，展示如何在 Next.js 应用中集成预请求功能来提升用户体验。

## 功能特性

- 🚀 **智能预请求**: 悬停链接时自动预请求数据
- 📦 **Service Worker 缓存**: 高效的缓存管理
- ⏱️ **缓存过期控制**: 智能的缓存过期机制
- 📊 **实时状态监控**: 可视化的系统状态
- 🎨 **现代 UI**: 基于 Tailwind CSS 的现代界面

## 演示页面

- **首页**: 功能介绍和状态监控
- **产品详情页**: 商品信息和评论预请求演示
- **购物车页**: 购物车数据预请求演示
- **用户资料页**: 用户信息预请求演示
- **分类页面**: 分类数据预请求演示

## 开发和运行

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 复制 Service Worker

```bash
npm run copy-sw
```

### 启动开发服务器

```bash
# 启动 API 服务器和 Next.js 开发服务器
npm run start-all

# 或者分别启动
npm run start-api  # API 服务器 (端口 3001)
npm run dev        # Next.js 开发服务器 (端口 3000)
```

### 访问应用

- Next.js 应用: http://localhost:3000
- API 服务器: http://localhost:3001

## 预请求演示

1. **悬停预请求**: 将鼠标悬停在页面链接上，系统会自动预请求相关数据
2. **手动预请求**: 点击页面上的"手动预请求"按钮
3. **控制台监控**: 打开浏览器开发者工具查看预请求日志
4. **网络监控**: 在网络面板中观察预请求的网络活动

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **预请求**: @norejs/prefetch
- **API**: Express.js
- **工具**: ESLint, PostCSS

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── globals.css        # 全局样式
│   ├── products/[id]/     # 产品详情页
│   ├── cart/              # 购物车页
│   ├── profile/           # 用户资料页
│   └── categories/        # 分类页
├── components/            # 可复用组件
└── lib/                   # 工具函数

public/
└── service-worker.js      # Service Worker 文件

server.js                  # API 服务器
```

## 开发说明

### Service Worker 更新

当 prefetch-worker 包更新时，运行以下命令更新 Service Worker:

```bash
npm run copy-sw
```

### API 数据

API 服务器提供模拟数据，支持以下端点:

- `GET /api/products/1` - 产品信息
- `GET /api/products/2` - 产品评论
- `GET /api/cart` - 购物车数据
- `GET /api/user/profile` - 用户资料
- `GET /api/categories` - 商品分类

### 预请求头

API 服务器识别以下预请求头:

- `X-Prefetch-Request-Type: prefetch` - 标识预请求
- `X-Prefetch-Expire-Time: 30000` - 缓存过期时间(毫秒)

## 性能优化建议

1. **预请求时机**: 在用户可能访问的页面链接上使用悬停预请求
2. **缓存策略**: 根据数据更新频率设置合适的缓存过期时间
3. **网络条件**: 考虑用户的网络条件，避免在慢网络下过度预请求
4. **用户行为**: 分析用户行为模式，优化预请求策略
