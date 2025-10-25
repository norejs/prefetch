# Service Worker 模板

## 📦 唯一模板

### service-worker.js

**ESM 模式的 Service Worker 模板，适用于现代浏览器**

```bash
# 复制到项目根目录
cp node_modules/@norejs/prefetch-worker/templates/service-worker.js ./service-worker.js

# 或使用 npm 脚本
npm run copy-template
```

**特性：**
- ✅ 纯 ESM 导入，性能最佳
- ✅ 调试模式控制路径选择
- ✅ 支持主进程动态配置
- ✅ 内置调试模式开关
- ✅ 可替换配置标识
- ✅ 完整的生命周期管理

**使用方法：**

```javascript
// 1. 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// 2. 发送配置消息
navigator.serviceWorker.ready.then(registration => {
  registration.active.postMessage({
    type: 'PREFETCH_CONFIG',
    config: {
      enablePrefetch: true,
      cacheStrategy: 'cache-first',
      prefetchRules: [
        { pattern: /\/api\/.*\.json$/, priority: 'high' },
        { pattern: /\.(js|css)$/, priority: 'medium' }
      ]
    }
  });
});
```

## 🔧 自定义配置

模板中包含可替换的标识，方便自定义：

- `{{DEBUG_MODE}}` - 调试模式开关
- `{{CDN_BASE}}` - CDN 地址
- `{{LOCAL_BASE}}` - 本地路径
- `{{LIFECYCLE_CONFIG}}` - 生命周期配置
- `{{CUSTOM_LISTENERS}}` - 自定义监听器

**示例：启用调试模式**

```javascript
// 将模板中的 DEBUG_MODE = false 改为 true
const DEBUG_MODE = true;
```