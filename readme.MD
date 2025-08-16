# Prefetch —— 跨应用的数据预请求
# 1. 什么是 Prefetch
Prefetch 是一种数据预请求技术，它可以在应用程序加载时预先加载数据，以便在用户需要时立即使用。这样可以减少用户等待时间，提高用户体验。

# 2. Prefetch 可以用来做什么

Prefetch 可以用来做很多事情，比如：


# 3. Prefetch 的优势


# 4. Prefetch 的实现原理



# 5. Prefetch 的使用场景


# 6. 快速开始演示

## 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有 demo 项目依赖
npm run demo:install

# 复制 Service Worker 文件
npm run demo:copy-sw
```

## 运行演示项目

### API 服务器
```bash
npm run demo:api
```
访问: http://localhost:3001

### Vite 演示项目
```bash
npm run demo:start:vite
```
访问: http://localhost:5173

### Next.js 演示项目
```bash
npm run demo:start:nextjs
```
访问: http://localhost:3000

### 同时运行所有演示
```bash
npm run demo:start:all
```

## Demo 项目说明

- **API Server** (`demos/api-server/`): 独立的模拟 API 服务器，提供演示数据
- **Vite Demo** (`demos/vite-prefetch-demo/`): 基于 Vite + TypeScript 的预请求演示
- **Next.js Demo** (`demos/nextjs-prefetch-demo/`): 基于 Next.js 14 + App Router 的预请求演示

## 预请求功能测试

1. 启动任一演示项目
2. 将鼠标悬停在页面链接上观察预请求
3. 打开浏览器开发者工具查看网络请求
4. 观察预请求的性能优势