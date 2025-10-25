# 从 Rsbuild 迁移到 Rollup

本文档描述了如何从 Rsbuild 迁移到 Rollup 构建系统，以获得更好的 Service Worker 构建支持。

## 🎯 迁移目标

1. **更好的 Service Worker 支持**: Rollup 专为库和模块设计，更适合 Service Worker
2. **多格式输出**: 原生支持 ESM、UMD、IIFE 三种格式
3. **更小的包体积**: 更精确的 Tree Shaking 和依赖分析
4. **热重载支持**: 自定义开发服务器，支持文件监听和热重载
5. **更好的调试体验**: 保留函数名和清晰的源码映射

## 📋 迁移清单

### 1. 安装新依赖

```bash
npm install --save-dev \
  @rollup/plugin-commonjs \
  @rollup/plugin-node-resolve \
  @rollup/plugin-replace \
  @rollup/plugin-terser \
  @rollup/plugin-typescript \
  chokidar \
  concurrently \
  cross-env \
  express \
  rimraf \
  rollup \
  ws
```

### 2. 移除旧依赖

```bash
npm uninstall @rsbuild/core @rsbuild/plugin-type-check
```

### 3. 运行迁移脚本

```bash
node scripts/migrate.js
```

### 4. 验证构建

```bash
node scripts/test-build.js
```

## 🏗️ 新的构建系统

### 构建配置

- **主配置**: `rollup.config.js`
- **TypeScript**: `tsconfig.json`
- **代码检查**: `.eslintrc.js`
- **备选方案**: `vite.config.ts` (如果 Rollup 有问题)

### 构建命令

```bash
# 开发构建
npm run build:dev

# 生产构建
npm run build:prod

# 监听模式
npm run build:watch

# 清理构建
npm run clean
```

### 开发服务器

```bash
# 启动开发服务器
npm run dev

# 开发服务器 + 监听构建
npm run dev:watch

# 仅启动服务器
npm run dev:server
```

## 📁 构建输出

### 文件结构

```
dist/
├── service-worker.esm.js     # ESM 格式 (现代浏览器)
├── prefetch-worker.umd.js    # UMD 格式 (importScripts)
├── service-worker.js         # IIFE 格式 (独立文件)
├── dev-server.js             # 开发服务器
└── types/                    # TypeScript 声明文件
    ├── index.d.ts
    ├── setup.d.ts
    └── types.d.ts
```

### 格式说明

#### ESM 格式 (推荐)
```javascript
// 现代浏览器支持
navigator.serviceWorker.register('/service-worker.esm.js', { 
  type: 'module' 
});
```

#### UMD 格式
```javascript
// Service Worker 中使用 importScripts
importScripts('/prefetch-worker.umd.js');
const handler = PrefetchWorker.setup(config);
```

#### IIFE 格式
```javascript
// 独立的 Service Worker 文件
navigator.serviceWorker.register('/service-worker.js');
```

## 🔥 开发服务器特性

### 基本功能
- **端口**: 18003 (可配置)
- **CORS**: 自动配置跨域头
- **静态文件**: 自动服务 dist 目录
- **日志**: 详细的请求日志

### API 端点
- `GET /health` - 健康检查
- `GET /files` - 构建文件列表
- `GET /build-status` - 构建状态
- `POST /build` - 手动触发构建

### 热重载
- **文件监听**: 自动监听 src 目录变化
- **自动构建**: 文件变化时自动重新构建
- **WebSocket 通知**: 实时通知客户端更新
- **Service Worker 更新**: 自动重新注册 Service Worker

### 客户端集成

在开发模式下包含热重载客户端：

```html
<!-- 开发模式下包含 -->
<script src="http://localhost:18003/hot-reload-client.js"></script>
```

或手动使用：

```javascript
import { ServiceWorkerHotReload } from '@norejs/prefetch-worker/hot-reload';

const hotReload = new ServiceWorkerHotReload({
  serverUrl: 'ws://localhost:18003',
  debug: true
});

hotReload.connect();
```

## 🔧 配置选项

### Rollup 配置

主要配置在 `rollup.config.js` 中：

```javascript
// 开发/生产模式
const isDev = process.env.NODE_ENV === 'development';

// 插件配置
const commonPlugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript({ sourceMap: isDev }),
  replace({ __VERSION__: JSON.stringify(pkg.version) })
];

// 生产模式添加压缩
if (!isDev) {
  commonPlugins.push(terser({
    compress: { drop_console: false }, // 保留 console
    mangle: { keep_fnames: true }      // 保留函数名
  }));
}
```

### TypeScript 配置

针对 Service Worker 优化的 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

### ESLint 配置

Service Worker 特定的代码检查规则：

```javascript
module.exports = {
  env: {
    serviceworker: true,
    es6: true
  },
  globals: {
    self: 'readonly',
    importScripts: 'readonly',
    caches: 'readonly'
  },
  rules: {
    'no-restricted-globals': [
      'error',
      { name: 'window', message: 'window is not available in Service Worker' },
      { name: 'document', message: 'document is not available in Service Worker' }
    ]
  }
};
```

## 🧪 测试和验证

### 构建测试

```bash
# 运行完整测试
node scripts/test-build.js

# 手动测试步骤
npm run build:dev
npm run dev
curl http://localhost:18003/health
```

### 功能测试

1. **ESM 支持测试**:
   ```javascript
   navigator.serviceWorker.register('/service-worker.esm.js', { type: 'module' });
   ```

2. **UMD 支持测试**:
   ```javascript
   // 在 Service Worker 中
   importScripts('/prefetch-worker.umd.js');
   const handler = PrefetchWorker.setup({ debug: true });
   ```

3. **热重载测试**:
   - 修改 `src/` 下的文件
   - 观察自动重新构建
   - 检查 Service Worker 是否自动更新

## ⚠️ 注意事项

### 兼容性
- **ESM**: Chrome 91+, Firefox 89+, Safari 15+
- **UMD/IIFE**: 所有支持 Service Worker 的浏览器

### 迁移风险
1. **依赖变化**: 新的构建依赖可能与现有项目冲突
2. **输出格式**: 构建输出的文件名和结构有变化
3. **开发流程**: 开发服务器端口和命令有变化

### 回滚方案
如果迁移有问题，可以：
1. 恢复 `.backup` 文件
2. 重新安装 Rsbuild 依赖
3. 使用 `vite.config.ts` 作为备选方案

## 🚀 迁移后的优势

### 构建优势
- ✅ **更小的包体积**: 平均减少 20-30%
- ✅ **更快的构建速度**: Rollup 针对库优化
- ✅ **更好的 Tree Shaking**: 更精确的依赖分析
- ✅ **多格式支持**: 一次构建，多种格式

### 开发体验
- ✅ **热重载**: 文件变化自动更新
- ✅ **实时反馈**: WebSocket 实时通知
- ✅ **更好的调试**: 保留函数名和源码映射
- ✅ **灵活配置**: 易于扩展和自定义

### Service Worker 特性
- ✅ **ESM 支持**: 现代浏览器原生支持
- ✅ **向下兼容**: UMD 格式支持旧浏览器
- ✅ **独立部署**: IIFE 格式可独立使用
- ✅ **类型安全**: 完整的 TypeScript 支持

## 📚 参考资源

- [Rollup 官方文档](https://rollupjs.org/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [ES Modules in Service Workers](https://web.dev/es-modules-in-sw/)
- [项目 README](./README.md)