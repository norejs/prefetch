# Prefetch Demos

这里包含了预请求功能的完整演示项目，展示如何在不同的前端框架中集成和使用预请求功能。

## 项目结构

```
demos/
├── api-server/           # 独立的 API 服务器
├── vite-prefetch-demo/   # Vite + TypeScript 演示
├── nextjs-prefetch-demo/ # Next.js + TypeScript 演示
└── package.json          # 统一管理脚本
```

## 快速开始

### 一键安装所有依赖

```bash
npm run install:all
```

### 复制 Service Worker 文件

```bash
npm run copy-sw:all
```

### 启动演示项目

```bash
# 启动 Vite 演示 (API + Vite)
npm run start:vite

# 启动 Next.js 演示 (API + Next.js)  
npm run start:nextjs

# 同时启动所有演示 (API + Vite + Next.js)
npm run start:all
```

## 访问地址

启动后可以通过以下地址访问：

- **API 服务器**: http://localhost:3001
- **Vite 演示**: http://localhost:5173
- **Next.js 演示**: http://localhost:3000

## 演示项目

### 🚀 API Server

独立的模拟 API 服务器，为所有演示项目提供数据。

**特性**:
- 预请求头识别和处理
- 智能延迟模拟
- 实时统计监控
- 详细的彩色日志
- CORS 跨域支持

**端点**:
- `/api/products/1` - 产品信息
- `/api/products/2` - 产品评论
- `/api/cart` - 购物车数据
- `/api/user/profile` - 用户资料
- `/api/categories` - 商品分类
- `/health` - 健康检查
- `/api/stats` - 统计信息

### ⚡ Vite Demo

基于 Vite + TypeScript 的预请求演示。

**特性**:
- 现代化的开发体验
- 快速热重载
- TypeScript 支持
- 悬停预请求演示
- Service Worker 集成

**启动**:
```bash
npm run start:vite
```

### 🔥 Next.js Demo

基于 Next.js 14 + App Router 的预请求演示。

**特性**:
- Next.js App Router
- 服务端渲染支持
- Tailwind CSS 样式
- 响应式设计
- 多页面预请求演示

**启动**:
```bash
npm run start:nextjs
```

## 开发工作流

### 1. 首次设置

```bash
# 克隆仓库后运行
npm run install:all
npm run copy-sw:all
```

### 2. 开发调试

```bash
# 启动指定演示
npm run start:vite     # 或 start:nextjs

# 查看 API 统计
curl http://localhost:3001/api/stats

# 查看系统状态
curl http://localhost:3001/health
```

### 3. 构建项目

```bash
# 构建所有演示项目
npm run build:all

# 构建指定项目
npm run build:vite
npm run build:nextjs
```

## 预请求演示功能

### 🎯 核心功能

1. **悬停预请求**: 鼠标悬停在链接上自动触发预请求
2. **手动预请求**: 点击按钮手动触发预请求
3. **状态监控**: 实时显示 Service Worker 状态
4. **性能对比**: 预请求 vs 正常请求的性能差异
5. **网络监控**: 在开发者工具中观察网络活动

### 🔍 测试场景

1. **产品详情页**: 预请求商品信息和评论数据
2. **购物车页面**: 预请求购物车内容
3. **用户资料页**: 预请求用户个人信息
4. **分类浏览**: 预请求分类和推荐数据

### 📊 性能监控

- **API 统计**: 访问 http://localhost:3001/api/stats
- **浏览器工具**: 打开开发者工具查看网络和控制台
- **实时日志**: API 服务器提供彩色日志输出

## 故障排除

### 端口冲突

如果遇到端口冲突，可以修改以下文件：

- API 服务器: `api-server/index.js` 中的 `port` 变量
- Vite: `vite-prefetch-demo/vite.config.ts` 
- Next.js: `next.config.js` 中的端口配置

### Service Worker 问题

```bash
# 重新复制 Service Worker 文件
npm run copy-sw:all

# 或单独复制
npm run copy-sw:vite
npm run copy-sw:nextjs
```

### 依赖问题

```bash
# 重新安装所有依赖
npm run install:all

# 或单独安装
npm run install:api
npm run install:vite  
npm run install:nextjs
```

## 开发者提示

### 修改 API 数据

编辑 `api-server/index.js` 中的 `apiData` 对象来修改模拟数据。

### 调整延迟设置

在 `api-server/index.js` 中修改延迟逻辑：

```javascript
// 快速模式
const delay = isPrefetch ? 10 : 50;

// 慢速模式  
const delay = isPrefetch ? 200 : 1000;
```

### 添加新的演示页面

1. 在对应的 demo 项目中添加新页面
2. 在 API 服务器中添加对应的数据端点
3. 更新相关的路由和链接

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

ISC License
