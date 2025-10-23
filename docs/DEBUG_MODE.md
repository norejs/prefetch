# Debug 模式使用指南

## 📋 概述

Prefetch 提供了 Debug 模式，允许在开发和调试时使用本地开发服务器而不是 CDN，这样可以：

- ✅ 实时调试 Prefetch Worker 代码
- ✅ 快速测试修改
- ✅ 无需发布到 CDN 即可测试
- ✅ 支持断点调试

## 🚀 快速开始

### 1. 启动本地开发服务器

```bash
cd packages/prefetch-worker
npm run build        # 构建 UMD 文件
npm run dev:server   # 启动开发服务器
```

服务器将在 `http://localhost:3100` 启动。

### 2. 使用 Debug 模式创建 Service Worker

#### 方式 1: 使用环境变量

```bash
DEBUG=true prefetch-integrate --create --output public/service-worker.js
```

#### 方式 2: 使用命令行参数

```bash
prefetch-integrate --create --output public/service-worker.js --debug
```

#### 方式 3: 使用 npm scripts (推荐)

```bash
# 在 demo 项目中
npm run create-sw:debug
```

## 📁 项目配置

### package.json 配置

在你的项目 `package.json` 中添加 debug 模式的 scripts：

```json
{
  "scripts": {
    "create-sw": "prefetch-integrate --create --output public/service-worker.js",
    "create-sw:debug": "DEBUG=true prefetch-integrate --create --output public/service-worker.js",
    "integrate-prefetch": "prefetch-integrate --input public/sw.js --output public/sw.js",
    "integrate-prefetch:debug": "DEBUG=true prefetch-integrate --input public/sw.js --output public/sw.js"
  }
}
```

## 🔧 环境变量

### DEBUG

启用 debug 模式。

```bash
DEBUG=true prefetch-integrate --create --output public/service-worker.js
```

**可选值:**
- `true` 或 `1`: 启用 debug 模式
- 其他值: 禁用 debug 模式

### PREFETCH_DEV_PORT

指定本地开发服务器端口（默认: 3100）。

```bash
PREFETCH_DEV_PORT=3200 npm run dev:server
```

## 📝 生成的代码差异

### Production 模式 (默认)

```javascript
// ============================================
// Prefetch Worker Integration
// Version: 0.1.0-alpha.11
// Mode: PRODUCTION (CDN)
// Generated: 2025-10-23T09:50:45.142Z
// ============================================

(function() {
  'use strict';
  
  const PREFETCH_CONFIG = {
    // CDN URL - esm.sh CDN
    cdnUrl: 'https://esm.sh/@norejs/prefetch-worker@0.1.0-alpha.11/dist/prefetch-worker.umd.js',
    // ...
  };
  // ...
})();
```

### Debug 模式

```javascript
// ============================================
// Prefetch Worker Integration
// Version: 0.1.0-alpha.11
// Mode: DEBUG (Local Dev Server)
// Generated: 2025-10-23T09:50:45.142Z
// ============================================

(function() {
  'use strict';
  
  const PREFETCH_CONFIG = {
    // CDN URL - Local Dev Server
    cdnUrl: 'http://localhost:3100/prefetch-worker.umd.js',
    // ...
  };
  // ...
})();
```

## 🎯 完整工作流

### 开发流程

```bash
# 1. 启动本地开发服务器（Terminal 1）
cd packages/prefetch-worker
npm run build
npm run dev:server

# 2. 创建 Service Worker（Terminal 2）
cd demos/react-cra-demo
npm run create-sw:debug

# 3. 启动应用
npm start

# 4. 修改 Prefetch Worker 代码后
cd packages/prefetch-worker
npm run build        # 重新构建
# 服务器会自动提供新的文件

# 5. 在浏览器中刷新 Service Worker
# 在 DevTools -> Application -> Service Workers -> Update
```

### 切换回 Production 模式

```bash
# 重新生成 Service Worker（不使用 debug 模式）
npm run create-sw
```

## 🌐 本地开发服务器

### 启动服务器

```bash
cd packages/prefetch-worker
npm run dev:server
```

### 服务器输出

```
🚀 Prefetch Worker Dev Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running at: http://localhost:3100
📦 UMD File: http://localhost:3100/prefetch-worker.umd.js
💚 Health Check: http://localhost:3100/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ UMD file ready (21.16 KB)

Press Ctrl+C to stop the server
```

### 可用端点

| 端点 | 说明 |
|------|------|
| `/` | 服务器首页，显示使用说明 |
| `/prefetch-worker.umd.js` | UMD 格式的 Prefetch Worker 文件 |
| `/health` | 健康检查端点 |

### 健康检查

```bash
curl http://localhost:3100/health
```

**响应:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-23T09:50:45.142Z",
  "port": 3100,
  "files": {
    "umd": {
      "exists": true,
      "path": "/path/to/dist/static/js/prefetch-worker.umd.js",
      "size": 21653
    }
  }
}
```

## 🔍 调试技巧

### 1. 查看 Service Worker 日志

在浏览器 DevTools 中：
1. 打开 **Application** 标签
2. 选择 **Service Workers**
3. 查看 Console 输出

### 2. 验证加载的文件

```javascript
// 在 Service Worker 中
console.log('[Prefetch] Loading from:', PREFETCH_CONFIG.cdnUrl);
```

### 3. 检查网络请求

在 DevTools -> Network 中查看：
- 是否请求了 `localhost:3100/prefetch-worker.umd.js`
- 请求是否成功（状态码 200）
- 文件大小是否正确

### 4. 强制更新 Service Worker

```javascript
// 在浏览器 Console 中
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
```

## ⚠️ 注意事项

### 1. CORS 配置

本地开发服务器已配置 CORS，允许跨域访问：

```javascript
res.header('Access-Control-Allow-Origin', '*');
```

### 2. Service Worker 缓存

Service Worker 可能会缓存旧版本的文件。在开发时：
- 使用 DevTools 中的 "Update on reload"
- 或手动点击 "Update" 按钮
- 或注销并重新注册 Service Worker

### 3. 端口冲突

如果端口 3100 已被占用，可以使用环境变量更改：

```bash
PREFETCH_DEV_PORT=3200 npm run dev:server
```

然后在创建 Service Worker 时也指定相同端口：

```bash
prefetch-integrate --create --output public/sw.js --debug --debug-port 3200
```

### 4. 生产环境

**重要**: Debug 模式仅用于开发！在生产环境部署前，务必：

```bash
# 重新生成 Service Worker（不使用 debug 模式）
npm run create-sw

# 或
prefetch-integrate --create --output public/service-worker.js
```

## 📊 性能对比

| 模式 | 首次加载 | 后续加载 | 适用场景 |
|------|----------|----------|----------|
| **Production (CDN)** | ~100-200ms | ~10-20ms (缓存) | 生产环境 |
| **Debug (Local)** | ~5-10ms | ~5-10ms | 开发调试 |

## 🎓 示例项目

### React CRA Demo

```bash
# 1. 启动开发服务器
cd packages/prefetch-worker
npm run build
npm run dev:server

# 2. 在另一个终端
cd demos/react-cra-demo
npm run create-sw:debug
npm start
```

### Next.js Demo

```bash
# 1. 启动开发服务器
cd packages/prefetch-worker
npm run build
npm run dev:server

# 2. 在另一个终端
cd demos/nextjs-prefetch-demo
DEBUG=true prefetch-integrate --create --output public/service-worker.js
npm run dev
```

## 🐛 故障排查

### 问题 1: UMD 文件未找到

**错误信息:**
```
❌ UMD file not found. Please run: npm run build
```

**解决方案:**
```bash
cd packages/prefetch-worker
npm run build
```

### 问题 2: 服务器无法启动

**错误信息:**
```
Error: listen EADDRINUSE: address already in use :::3100
```

**解决方案:**
```bash
# 更改端口
PREFETCH_DEV_PORT=3200 npm run dev:server
```

### 问题 3: Service Worker 未加载新代码

**解决方案:**

1. 在 DevTools -> Application -> Service Workers 中点击 "Unregister"
2. 刷新页面
3. Service Worker 会重新注册并加载最新代码

### 问题 4: CORS 错误

**错误信息:**
```
Access to script at 'http://localhost:3100/prefetch-worker.umd.js' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解决方案:**

这不应该发生，因为服务器已配置 CORS。如果遇到此问题：

1. 检查服务器是否正在运行
2. 检查端口是否正确
3. 尝试重启服务器

## 📚 相关文档

- [集成指南](./INTEGRATION_GUIDE.md)
- [CLI 工具文档](./CLI_USAGE.md)
- [Service Worker 开发指南](./SERVICE_WORKER_GUIDE.md)

## 💡 最佳实践

1. **开发时使用 Debug 模式**
   ```bash
   npm run create-sw:debug
   ```

2. **提交代码前切换回 Production 模式**
   ```bash
   npm run create-sw
   ```

3. **使用版本控制忽略 debug 文件**
   ```gitignore
   # .gitignore
   public/service-worker.js
   ```

4. **在 CI/CD 中使用 Production 模式**
   ```yaml
   # .github/workflows/deploy.yml
   - name: Generate Service Worker
     run: npm run create-sw
   ```

## 🎉 总结

Debug 模式让 Prefetch Worker 的开发和调试变得简单高效：

- ✅ 快速迭代开发
- ✅ 实时查看修改效果
- ✅ 无需发布即可测试
- ✅ 完整的调试支持

开始使用 Debug 模式，让你的开发体验更上一层楼！


