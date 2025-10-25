# Service Worker ESM 测试演示

这是一个使用 **Vite + React** 构建的演示项目，专注于测试 Service Worker ES Modules 功能。

## 🚀 特性

- ✅ **Vite + React** 现代开发环境
- ✅ **Service Worker ES Modules** 支持和测试
- ✅ **动态导入** 功能测试
- ✅ **缓存策略** 测试
- ✅ **实时日志查看** 和导出功能
- ✅ **交互式测试界面**

## 📦 项目结构

```
demos/sw-esm-test/
├── src/
│   ├── components/
│   │   ├── ServiceWorkerManager.jsx  # SW 管理组件
│   │   ├── PrefetchTester.jsx        # 预取测试组件
│   │   └── LogViewer.jsx             # 日志查看组件
│   ├── App.jsx                       # 主应用组件
│   ├── main.jsx                      # 入口文件
│   └── index.css                     # 样式文件
├── public/
│   ├── sw-module.js                  # Service Worker (ESM)
│   ├── modules/                      # SW 依赖模块
│   ├── api/                          # 测试 API 文件
│   ├── styles/                       # 测试样式文件
│   └── images/                       # 测试图片文件
├── package.json                      # 项目配置
└── vite.config.js                    # Vite 配置
```

## 🛠️ 开发环境要求

1. **Node.js** >= 16.0.0
2. **pnpm** (推荐) 或 npm
3. **现代浏览器** (支持 ES Modules 和 Service Worker)

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install

# 或者在当前目录
cd demos/sw-esm-test
pnpm install
```

### 2. 启动开发服务器

```bash
# 启动 prefetch-worker 开发服务器 (端口 18003)
cd packages/prefetch-worker
pnpm run dev

# 启动演示项目 (端口 8082)
cd demos/sw-esm-test  
pnpm run dev
```

### 3. 访问演示

打开浏览器访问: http://localhost:8082

## 🧪 功能测试

### 1. Service Worker 管理
- 注册/注销 Service Worker
- 检查 SW 状态
- 发送测试消息

### 2. Prefetch Worker 初始化
- 使用 `@norejs/prefetch` 初始化
- 发送配置到 Service Worker
- 实时状态监控

### 3. 预取功能测试
- API 请求预取 (高优先级)
- CSS 资源预取 (中优先级) 
- 图片资源预取 (低优先级)
- 缓存策略测试
- 动态配置更新

## 📋 使用流程

1. **启动服务**: 确保 prefetch-worker 开发服务器运行在 18003 端口
2. **注册 SW**: 点击"注册 Service Worker"按钮
3. **初始化预取**: 点击"初始化 Prefetch Worker"按钮
4. **测试功能**: 使用各种测试按钮验证功能
5. **查看日志**: 实时查看操作日志和结果

## 🔧 配置说明

### Prefetch Worker 配置

```javascript
{
  enablePrefetch: true,
  enableCache: true,
  cacheStrategy: 'cache-first',
  debug: true,
  prefetchRules: [
    { pattern: /\/api\/.*\.json$/, priority: 'high' },
    { pattern: /\.(js|css)$/, priority: 'medium' },
    { pattern: /\.(png|jpg|jpeg|gif|svg|webp)$/, priority: 'low' }
  ],
  maxConcurrentRequests: 4,
  prefetchDelay: 100
}
```

### Service Worker 特性

- **ES Modules**: 使用现代模块系统
- **动态导入**: 支持条件加载
- **生命周期管理**: 完整的安装/激活流程
- **消息通信**: 与主进程双向通信
- **错误处理**: 完善的错误捕获和报告

## 🐛 故障排除

### 常见问题

1. **Service Worker 注册失败**
   - 检查浏览器是否支持 ES Modules
   - 确保在 HTTPS 或 localhost 环境下运行

2. **Prefetch Worker 加载失败**
   - 确保 prefetch-worker 开发服务器运行在 18003 端口
   - 检查网络连接和 CORS 设置

3. **模块导入错误**
   - 检查 public/modules/ 目录是否存在
   - 确保所有依赖文件都已正确复制

### 调试技巧

- 打开浏览器开发者工具查看 Console 和 Network 面板
- 使用 Application > Service Workers 面板监控 SW 状态
- 查看实时日志了解详细执行过程

## 📚 相关文档

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个演示项目！