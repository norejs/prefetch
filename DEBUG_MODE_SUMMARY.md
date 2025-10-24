# 🎉 Debug 模式实现总结

## 📋 实现内容

我们成功实现了 Prefetch 的 Debug 模式，允许在开发时使用本地服务器而不是 CDN。

## ✅ 完成的工作

### 1. 本地开发服务器 ✅

**文件:** `packages/prefetch-worker/dev-server.js`

创建了一个 Express 服务器，提供：
- ✅ UMD 文件服务 (`/prefetch-worker.umd.js`)
- ✅ 健康检查端点 (`/health`)
- ✅ 使用说明页面 (`/`)
- ✅ CORS 支持
- ✅ 详细的日志输出
- ✅ 友好的错误提示

**启动命令:**
```bash
cd packages/prefetch-worker
npm run dev:server
```

**服务器特性:**
- 默认端口: 3100
- 支持通过 `PREFETCH_DEV_PORT` 环境变量自定义端口
- 自动检测 UMD 文件是否存在
- 实时显示请求日志

---

### 2. CLI 工具 Debug 支持 ✅

**文件:** `packages/prefetch/bin/prefetch-integrate.js`

添加了 Debug 模式支持：

#### 新增参数

- `--debug`: 启用 debug 模式
- `--debug-port <port>`: 指定开发服务器端口（默认: 3100）

#### 环境变量支持

- `DEBUG=true` 或 `DEBUG=1`: 启用 debug 模式
- `PREFETCH_DEV_PORT=<port>`: 指定开发服务器端口

#### 生成的代码差异

**Production 模式:**
```javascript
// Mode: PRODUCTION (CDN)
cdnUrl: 'https://esm.sh/@norejs/prefetch-worker@0.1.0-alpha.11/dist/prefetch-worker.umd.js'
```

**Debug 模式:**
```javascript
// Mode: DEBUG (Local Dev Server)
cdnUrl: 'http://localhost:3100/prefetch-worker.umd.js'
```

---

### 3. Demo 项目配置 ✅

**文件:** `demos/react-cra-demo/package.json`

添加了 debug 模式的 npm scripts：

```json
{
  "scripts": {
    "create-sw": "prefetch-integrate --create --output public/service-worker.js",
    "create-sw:debug": "DEBUG=true prefetch-integrate --create --output public/service-worker.js",
    "integrate-prefetch": "prefetch-integrate --input public/service-worker.js --output public/service-worker-integrated.js",
    "integrate-prefetch:debug": "DEBUG=true prefetch-integrate --input public/service-worker.js --output public/service-worker-integrated.js"
  }
}
```

---

### 4. 构建配置更新 ✅

**文件:** `packages/prefetch-worker/package.json`

添加了开发服务器相关的 scripts：

```json
{
  "scripts": {
    "dev:server": "node dev-server.js",
    "build:dev": "npm run build:umd && npm run dev:server"
  }
}
```

---

### 5. 文档 ✅

**文件:** `docs/DEBUG_MODE.md`

创建了完整的 Debug 模式使用文档，包括：
- 快速开始指南
- 环境变量说明
- 完整工作流程
- 调试技巧
- 故障排查
- 最佳实践

---

## 🎯 使用方式

### 方式 1: 环境变量（推荐）

```bash
# 启动开发服务器
cd packages/prefetch-worker
npm run build
npm run dev:server

# 在另一个终端
cd demos/react-cra-demo
DEBUG=true prefetch-integrate --create --output public/service-worker.js
```

### 方式 2: 命令行参数

```bash
prefetch-integrate --create --output public/service-worker.js --debug
```

### 方式 3: npm scripts（最简单）

```bash
# 启动开发服务器
cd packages/prefetch-worker
npm run build
npm run dev:server

# 在另一个终端
cd demos/react-cra-demo
npm run create-sw:debug
```

---

## 📊 测试结果

### ✅ 测试 1: 创建 Service Worker (Debug 模式)

**命令:**
```bash
cd demos/react-cra-demo
npm run create-sw:debug
```

**结果:**
```
✅ Service Worker created successfully!
📁 Output: /Users/pengzai/www/mygithub/prefetch/demos/react-cra-demo/public/service-worker.js
🔧 Mode: DEBUG
🌐 Local Dev Server: http://localhost:3100/prefetch-worker.umd.js

⚠️  Make sure to start the dev server:
   cd packages/prefetch-worker && npm run dev:server
```

### ✅ 测试 2: 验证生成的代码

**检查模式标识:**
```bash
grep "Mode:" public/service-worker.js
```

**结果:**
```
// Mode: DEBUG (Local Dev Server)
```

**检查 CDN URL:**
```bash
grep "cdnUrl" public/service-worker.js
```

**结果:**
```
cdnUrl: 'http://localhost:3100/prefetch-worker.umd.js',
```

### ✅ 测试 3: 开发服务器

**启动服务器:**
```bash
cd packages/prefetch-worker
npm run dev:server
```

**输出:**
```
🚀 Prefetch Worker Dev Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running at: http://localhost:3100
📦 UMD File: http://localhost:3100/prefetch-worker.umd.js
💚 Health Check: http://localhost:3100/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ UMD file ready (21.16 KB)
```

---

## 🎨 架构设计

### 工作流程

```
┌─────────────────┐
│  开发者         │
└────────┬────────┘
         │
         │ 1. 运行 npm run create-sw:debug
         ↓
┌─────────────────┐
│  CLI 工具       │
│  (DEBUG=true)   │
└────────┬────────┘
         │
         │ 2. 生成 Service Worker
         │    使用本地服务器 URL
         ↓
┌─────────────────┐
│  Service Worker │
│  (public/)      │
└────────┬────────┘
         │
         │ 3. importScripts(localhost:3100/...)
         ↓
┌─────────────────┐
│  本地开发服务器 │
│  (port 3100)    │
└────────┬────────┘
         │
         │ 4. 返回 UMD 文件
         ↓
┌─────────────────┐
│  Prefetch       │
│  Worker 运行    │
└─────────────────┘
```

### 文件结构

```
prefetch/
├── packages/
│   ├── prefetch/
│   │   └── bin/
│   │       └── prefetch-integrate.js  # ✅ 添加 debug 支持
│   └── prefetch-worker/
│       ├── dev-server.js              # ✅ 新增：开发服务器
│       ├── dist/
│       │   └── static/js/
│       │       └── prefetch-worker.umd.js  # UMD 文件
│       └── package.json               # ✅ 添加 dev:server script
├── demos/
│   └── react-cra-demo/
│       ├── package.json               # ✅ 添加 debug scripts
│       └── public/
│           └── service-worker.js      # 生成的 SW（debug 模式）
└── docs/
    └── DEBUG_MODE.md                  # ✅ 新增：使用文档
```

---

## 💡 核心特性

### 1. 智能模式切换

CLI 工具自动根据 `DEBUG` 环境变量或 `--debug` 参数选择：
- **Production 模式**: 使用 esm.sh CDN
- **Debug 模式**: 使用本地开发服务器

### 2. 灵活的配置

支持多种配置方式：
- 环境变量: `DEBUG=true`
- 命令行参数: `--debug`
- 自定义端口: `--debug-port 3200`

### 3. 友好的提示

生成 Service Worker 时会显示：
- 当前模式（DEBUG/PRODUCTION）
- CDN URL 或本地服务器地址
- 如何启动开发服务器（debug 模式）

### 4. 完整的 CORS 支持

开发服务器配置了 CORS，允许：
- 跨域请求
- 任何来源访问
- 支持所有 HTTP 方法

---

## 🚀 优势

### 开发体验

1. **快速迭代**
   - 修改代码后只需重新构建
   - 无需发布到 CDN
   - 立即看到效果

2. **实时调试**
   - 支持断点调试
   - 查看详细日志
   - 监控网络请求

3. **离线开发**
   - 不依赖外部 CDN
   - 网络问题不影响开发
   - 完全本地化

### 生产部署

1. **简单切换**
   ```bash
   # 开发时
   npm run create-sw:debug
   
   # 部署前
   npm run create-sw
   ```

2. **零配置**
   - 不需要修改代码
   - 自动切换 CDN URL
   - 保持一致的行为

---

## 📝 使用场景

### 场景 1: 开发新功能

```bash
# 1. 启动开发服务器
cd packages/prefetch-worker
npm run build
npm run dev:server

# 2. 创建 debug 模式的 SW
cd demos/react-cra-demo
npm run create-sw:debug

# 3. 启动应用
npm start

# 4. 修改 Prefetch Worker 代码
cd packages/prefetch-worker
# 编辑 src/ 文件

# 5. 重新构建
npm run build

# 6. 刷新浏览器中的 Service Worker
# DevTools -> Application -> Service Workers -> Update
```

### 场景 2: 调试问题

```bash
# 1. 启动开发服务器（带日志）
cd packages/prefetch-worker
npm run dev:server

# 2. 在浏览器中打开应用
# 3. 查看 DevTools Console
# 4. 查看服务器日志
# 5. 定位问题
```

### 场景 3: 测试集成

```bash
# 1. 在现有项目中测试
cd my-project
DEBUG=true prefetch-integrate --create --output public/sw.js

# 2. 启动开发服务器
cd path/to/prefetch/packages/prefetch-worker
npm run dev:server

# 3. 测试功能
```

---

## 🎓 最佳实践

### 1. 开发时使用 Debug 模式

```bash
npm run create-sw:debug
```

### 2. 提交前切换回 Production 模式

```bash
npm run create-sw
git add public/service-worker.js
git commit -m "chore: update service worker"
```

### 3. 在 .gitignore 中忽略 debug 文件

```gitignore
# .gitignore
public/service-worker.js
```

### 4. 在 CI/CD 中使用 Production 模式

```yaml
# .github/workflows/deploy.yml
- name: Generate Service Worker
  run: npm run create-sw
```

---

## 🔮 未来改进

### 短期

- [ ] 添加热重载支持
- [ ] 支持 Source Map
- [ ] 添加性能监控

### 长期

- [ ] 可视化调试界面
- [ ] 集成测试工具
- [ ] 自动化测试支持

---

## 📚 相关文档

- [Debug 模式使用指南](./docs/DEBUG_MODE.md)
- [CLI 工具文档](./docs/CLI_USAGE.md)
- [集成指南](./docs/INTEGRATION_GUIDE.md)

---

## 🎉 总结

Debug 模式的实现让 Prefetch 的开发体验大幅提升：

✅ **已完成:**
- 本地开发服务器
- CLI 工具 debug 支持
- Demo 项目配置
- 完整文档

✅ **测试通过:**
- 创建 Service Worker (debug 模式)
- 验证生成的代码
- 开发服务器运行

✅ **生产就绪:**
- 简单的模式切换
- 友好的错误提示
- 完整的 CORS 支持

**开始使用 Debug 模式，享受更好的开发体验！** 🚀



