# esm.sh 集成方案

## 概述

Prefetch Worker 现在通过 esm.sh CDN 提供 UMD 格式的构建文件，可以通过 `importScripts` 直接在 Service Worker 中加载，无需完全替换现有的 Service Worker。

## 为什么选择 esm.sh？

### 优势

1. **自动转换**：esm.sh 自动将 ES 模块转换为浏览器可用的格式
2. **版本管理**：支持语义化版本控制和版本锁定
3. **CDN 加速**：全球 CDN 节点，快速加载
4. **零配置**：无需额外构建步骤
5. **类型支持**：自动提供 TypeScript 类型定义

### URL 格式

```
https://esm.sh/@norejs/prefetch-worker@{version}/dist/prefetch-worker.umd.js
```

## 发布流程

### 1. 构建 UMD 格式

```bash
cd packages/prefetch-worker

# 构建所有格式
npm run build

# 或只构建 UMD 格式
npm run build:umd
```

构建输出：
```
dist/
├── prefetch-worker.umd.js      # UMD 格式（未压缩）
├── prefetch-worker.umd.min.js  # UMD 格式（压缩）
├── worker/
│   └── service-worker.js       # 完整的 Service Worker
└── esm/
    └── index.js                # ES 模块格式
```

### 2. 发布到 npm

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布到 npm
npm publish
```

### 3. 验证 esm.sh 可用性

发布后，esm.sh 会自动索引新版本：

```bash
# 检查最新版本
curl https://esm.sh/@norejs/prefetch-worker

# 检查特定版本
curl https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js
```

## 使用方式

### 方式一：CLI 工具（推荐）

```bash
# 创建新的 Service Worker
npx @norejs/prefetch integrate --create --output public/service-worker.js

# 集成到现有 Service Worker
npx @norejs/prefetch integrate \
  --input public/service-worker.js \
  --output public/service-worker-integrated.js
```

### 方式二：手动集成

在现有 Service Worker 中添加：

```javascript
// 加载 Prefetch Worker
(function() {
  const CDN_URL = 'https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js';
  
  try {
    importScripts(CDN_URL);
    console.log('Prefetch Worker loaded from esm.sh');
  } catch (error) {
    console.error('Failed to load Prefetch Worker:', error);
  }
  
  let prefetchHandler = null;
  
  // 监听初始化消息
  self.addEventListener('message', (event) => {
    if (event.data?.type === 'PREFETCH_INIT' && self.PrefetchWorker) {
      prefetchHandler = self.PrefetchWorker.setup(event.data.config);
    }
  });
  
  // Fetch 处理
  self.addEventListener('fetch', (event) => {
    if (prefetchHandler) {
      const response = prefetchHandler(event);
      if (response) {
        return event.respondWith(response);
      }
    }
  });
})();
```

## 版本策略

### 固定版本（生产环境推荐）

```javascript
// 使用特定版本，确保稳定性
importScripts('https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js');
```

### 主版本锁定

```javascript
// 锁定主版本，自动获取最新的 patch 和 minor 更新
importScripts('https://esm.sh/@norejs/prefetch-worker@^1.0.0/dist/prefetch-worker.umd.js');
```

### 最新版本（开发环境）

```javascript
// 总是使用最新版本
importScripts('https://esm.sh/@norejs/prefetch-worker@latest/dist/prefetch-worker.umd.js');
```

## 缓存策略

### esm.sh 缓存头

esm.sh 自动设置合适的缓存头：

```
Cache-Control: public, max-age=31536000, immutable
```

对于固定版本，浏览器会长期缓存（1年）。

### 更新策略

当需要更新到新版本时：

1. **更新版本号**：修改 Service Worker 中的版本号
2. **触发更新**：Service Worker 文件变化会触发浏览器重新下载
3. **激活新版本**：新的 Service Worker 激活后会加载新版本的 Prefetch Worker

```javascript
// 强制更新 Service Worker
navigator.serviceWorker.register('/service-worker.js', {
  updateViaCache: 'none'  // 跳过 HTTP 缓存
});
```

## 降级方案

### 本地降级

```javascript
const CDN_URL = 'https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js';
const FALLBACK_URL = '/prefetch-worker.umd.js';

function loadPrefetchWorker() {
  try {
    importScripts(CDN_URL);
    console.log('Loaded from esm.sh');
    return true;
  } catch (error) {
    console.warn('esm.sh failed, trying fallback');
    try {
      importScripts(FALLBACK_URL);
      console.log('Loaded from fallback');
      return true;
    } catch (fallbackError) {
      console.error('All load attempts failed');
      return false;
    }
  }
}
```

### 准备本地文件

```bash
# 下载 UMD 文件到本地
curl -o public/prefetch-worker.umd.js \
  https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js

# 或使用 npm 包中的文件
cp node_modules/@norejs/prefetch-worker/dist/prefetch-worker.umd.js public/
```

## 监控和统计

### 加载成功率监控

```javascript
function loadWithStats(url) {
  const startTime = Date.now();
  
  try {
    importScripts(url);
    
    // 上报成功
    reportLoadSuccess({
      url,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    });
    
    return true;
  } catch (error) {
    // 上报失败
    reportLoadFailure({
      url,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    });
    
    return false;
  }
}

function reportLoadSuccess(data) {
  // 发送到你的分析服务
  fetch('/api/analytics/prefetch-load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, success: true })
  }).catch(() => {});
}

function reportLoadFailure(data) {
  fetch('/api/analytics/prefetch-load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, success: false })
  }).catch(() => {});
}
```

## 性能优化

### 预连接

在 HTML 中添加预连接提示：

```html
<link rel="preconnect" href="https://esm.sh" crossorigin>
<link rel="dns-prefetch" href="https://esm.sh">
```

### 资源提示

```html
<!-- 预加载 Prefetch Worker -->
<link rel="modulepreload" 
      href="https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js"
      crossorigin>
```

## 故障排查

### 常见问题

**1. CORS 错误**

esm.sh 已经配置了 CORS，如果遇到 CORS 错误，检查：
- 是否使用了正确的 URL
- 网络是否正常
- 是否被防火墙拦截

**2. 加载超时**

```javascript
// 设置超时
const timeout = setTimeout(() => {
  console.error('Load timeout');
}, 5000);

try {
  importScripts(CDN_URL);
  clearTimeout(timeout);
} catch (error) {
  clearTimeout(timeout);
  // 使用降级方案
}
```

**3. 版本不存在**

检查版本号是否正确：
```bash
# 查看所有可用版本
npm view @norejs/prefetch-worker versions
```

## 最佳实践

1. **生产环境使用固定版本**
   ```javascript
   // ✅ 推荐
   importScripts('https://esm.sh/@norejs/prefetch-worker@1.0.1/dist/prefetch-worker.umd.js');
   
   // ❌ 不推荐
   importScripts('https://esm.sh/@norejs/prefetch-worker@latest/dist/prefetch-worker.umd.js');
   ```

2. **配置本地降级**
   ```javascript
   // 总是提供本地降级文件
   const FALLBACK_URL = '/prefetch-worker.umd.js';
   ```

3. **监控加载状态**
   ```javascript
   // 收集加载统计数据
   reportLoadStats({ url, success, duration });
   ```

4. **合理的超时设置**
   ```javascript
   // 设置合理的超时时间（3-5秒）
   const LOAD_TIMEOUT = 5000;
   ```

5. **版本更新策略**
   ```javascript
   // 使用语义化版本控制
   // patch: 1.0.x - 修复bug
   // minor: 1.x.0 - 新功能，向后兼容
   // major: x.0.0 - 破坏性变更
   ```

## 参考资料

- [esm.sh 官方文档](https://esm.sh/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [importScripts 文档](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts)
- [语义化版本控制](https://semver.org/lang/zh-CN/)

