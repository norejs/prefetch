# Prefetch Worker 演示项目

本目录包含多个使用主流框架的 Prefetch Worker 集成示例。

## 📦 项目列表

### React 项目

#### 1. Create React App (CRA)
- **目录**: `react-cra-demo/`
- **框架**: React 18 + Create React App
- **端口**: 3000
- **特点**: 展示在 CRA 项目中集成 Prefetch Worker

```bash
cd react-cra-demo
npm install
npm run create-sw      # 创建 Service Worker
npm start              # 启动开发服务器
```

#### 2. React + Vite
- **目录**: `react-vite-demo/`
- **框架**: React 18 + Vite
- **端口**: 5173
- **特点**: 展示在 Vite 项目中集成 Prefetch Worker

```bash
cd react-vite-demo
npm install
npm run create-sw      # 创建 Service Worker
npm run dev            # 启动开发服务器
```

#### 3. Next.js (已有)
- **目录**: `nextjs-prefetch-demo/`
- **框架**: Next.js 14
- **端口**: 3000
- **特点**: Next.js App Router 集成示例

```bash
cd nextjs-prefetch-demo
pnpm install
npm run copy-sw        # 复制 Service Worker
pnpm dev               # 启动开发服务器
```

### Vue 项目

#### 4. Vue 3 + Vite
- **目录**: `vue3-vite-demo/`
- **框架**: Vue 3 + Vite
- **端口**: 5174
- **特点**: Vue 3 Composition API 集成示例

```bash
cd vue3-vite-demo
npm install
npm run create-sw      # 创建 Service Worker
npm run dev            # 启动开发服务器
```

### 其他

#### 5. API Server
- **目录**: `api-server/`
- **类型**: Express.js 后端服务
- **端口**: 3001
- **用途**: 为所有演示项目提供 API 接口

```bash
cd api-server
npm install
npm start              # 启动 API 服务器
```

#### 6. 手动集成示例
- **目录**: `manual-integration/`
- **类型**: 原生 HTML/JS
- **特点**: 展示手动集成 Prefetch Worker 的完整流程

## 🚀 快速开始

### 方式一：运行单个项目

```bash
# 1. 启动 API 服务器（必需）
cd api-server
npm install
npm start

# 2. 在新终端中启动任意演示项目
cd react-cra-demo
npm install
npm run create-sw
npm start
```

### 方式二：同时运行多个项目

```bash
# 在项目根目录运行
npm run demo:install      # 安装所有依赖
npm run demo:start:all    # 同时启动所有项目
```

## 📝 使用流程

### 1. 创建 Service Worker

每个项目都提供了 CLI 工具来创建 Service Worker：

```bash
# 自动创建（推荐）
npm run create-sw

# 或使用交互式模式
npx @norejs/prefetch integrate --interactive

# 或手动指定路径
npx @norejs/prefetch integrate --create --output public/service-worker.js
```

### 2. 启动项目

```bash
npm start        # CRA 项目
npm run dev      # Vite 项目
pnpm dev         # Next.js 项目
```

### 3. 测试功能

1. 打开浏览器访问对应端口
2. 等待 Service Worker 注册和激活
3. 点击"初始化 Prefetch"按钮
4. 使用"预请求数据"和"获取数据"按钮测试功能
5. 观察缓存命中率和响应时间

## 🔧 CLI 工具使用

### 框架自动检测

CLI 工具会自动检测项目使用的框架：

```bash
npx @norejs/prefetch integrate --create --output public/service-worker.js
```

输出示例：
```
🔍 检测到框架: react-vite
📁 推荐路径: public/service-worker.js
✅ Service Worker created successfully!

📝 React + Vite 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 在 src/main.jsx 中注册 Service Worker
  - Vite 会自动复制 public 目录到构建输出
```

### 支持的框架

- ✅ Next.js
- ✅ Create React App (CRA)
- ✅ React + Vite
- ✅ Vue CLI
- ✅ Vue 3 + Vite
- ✅ Nuxt.js
- ✅ 原生 Vite

### 集成现有 Service Worker

如果项目已有 Service Worker：

```bash
npx @norejs/prefetch integrate \
  --input public/service-worker.js \
  --output public/service-worker-integrated.js
```

## 📊 功能演示

所有演示项目都包含以下功能：

### 状态监控
- Service Worker 注册状态
- Prefetch Worker 初始化状态
- 实时状态更新

### 操作控制
- 预请求数据按钮
- 获取数据按钮
- 重新初始化按钮

### 统计信息
- 预请求次数
- 总请求次数
- 缓存命中次数
- 缓存命中率

### 数据展示
- 动态加载产品数据
- 响应时间对比
- 缓存效果可视化

## 🎯 测试场景

### 场景 1：首次预请求

1. 点击"预请求数据"
2. 观察网络请求（开发者工具 Network 面板）
3. 数据被缓存

### 场景 2：缓存命中

1. 完成预请求后
2. 点击"获取数据"
3. 观察响应时间（< 50ms）
4. 数据从缓存返回

### 场景 3：缓存过期

1. 等待 30 秒（默认过期时间）
2. 再次点击"获取数据"
3. 观察新的网络请求

## 🐛 调试技巧

### 查看 Service Worker 状态

1. 打开开发者工具
2. 进入 Application 面板
3. 选择 Service Workers
4. 查看注册状态和日志

### 查看网络请求

1. 打开 Network 面板
2. 筛选 XHR/Fetch 请求
3. 观察请求头：
   - `X-Prefetch-Request-Type: prefetch`
   - `X-Prefetch-Expire-Time: 30000`

### 查看控制台日志

开启 debug 模式查看详细日志：

```javascript
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH_INIT',
  config: {
    debug: true  // 开启调试
  }
});
```

## 📚 相关文档

- [集成指南](../docs/INTEGRATION_GUIDE.md)
- [esm.sh 方案](../docs/ESMSH_INTEGRATION.md)
- [实施总结](../docs/IMPLEMENTATION_SUMMARY.md)
- [API 文档](../docs/API.md)

## ⚠️ 注意事项

### Service Worker 要求

- 需要 HTTPS 或 localhost 环境
- 首次注册后需要刷新页面
- 浏览器需要支持 Service Worker API

### 开发环境

- 建议使用 Chrome/Edge 最新版本
- 开发时可能需要清除缓存
- 注意浏览器的 Service Worker 更新策略

### API 服务器

- 所有演示项目依赖 API 服务器
- 确保 API 服务器在 3001 端口运行
- API 接口路径：`/api/products`

## 🤝 贡献

欢迎贡献更多框架的演示项目！

### 添加新框架示例

1. 在 `demos/` 目录创建新项目
2. 添加 `package.json` 和必要文件
3. 添加 `README.md` 说明
4. 更新本文档的项目列表
5. 提交 Pull Request

## 📞 获取帮助

- [GitHub Issues](https://github.com/yourusername/prefetch/issues)
- [讨论区](https://github.com/yourusername/prefetch/discussions)
- [文档](https://github.com/yourusername/prefetch/docs)
