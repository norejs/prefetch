# PrefetchLink 组件详细说明

## 🎯 什么是 PrefetchLink？

`PrefetchLink` 是 `@norejs/prefetch` 提供的 React 组件，用于**预加载应用资源**。它通过解析目标应用的 HTML 页面，自动提取并预加载该应用所需的静态资源（如 JavaScript、CSS 文件等），从而加速应用的首次加载体验。

## 🚀 核心作用

### 1. **应用资源预加载**
- 自动解析目标应用的 HTML 页面
- 提取页面中的脚本、样式表和预取链接
- 在隐藏的 iframe 沙箱中预加载这些资源

### 2. **智能资源发现**
- 扫描 `<script>` 标签：提取 JavaScript 文件
- 扫描 `<link>` 标签：提取 CSS 文件和预取资源
- 支持 `prefetch-manifest` 清单文件
- 处理相对和绝对 URL

### 3. **沙箱环境**
- 使用隐藏的 iframe 创建安全的预加载环境
- 防止预加载过程影响主应用
- 支持自定义生命周期管理

## 📝 API 参考

### Props

```typescript
interface PrefetchLinkProps {
  appUrl: string;           // 目标应用的 URL
  children: React.ReactNode; // 子组件（通常是链接或按钮）
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `appUrl` | `string` | ✅ | 要预加载的应用 URL |
| `children` | `React.ReactNode` | ✅ | 包装的子组件 |

## 💡 使用示例

### 基本用法

```jsx
import { PrefetchLink } from '@norejs/prefetch'

function Navigation() {
  return (
    <PrefetchLink appUrl="https://example.com/products">
      <a href="/products">产品页面</a>
    </PrefetchLink>
  )
}
```

### 复杂场景

```jsx
import { PrefetchLink } from '@norejs/prefetch'

function AppLauncher() {
  return (
    <div className="app-grid">
      {/* 预加载 SPA 应用 */}
      <PrefetchLink appUrl="https://dashboard.example.com">
        <button className="app-card">
          <img src="/icons/dashboard.png" alt="Dashboard" />
          <span>控制台</span>
        </button>
      </PrefetchLink>

      {/* 预加载微前端应用 */}
      <PrefetchLink appUrl="https://orders.example.com">
        <div className="app-tile" onClick={() => window.open('/orders')}>
          <h3>订单管理</h3>
          <p>查看和管理您的订单</p>
        </div>
      </PrefetchLink>
    </div>
  )
}
```

### 与路由集成

```jsx
import { PrefetchLink } from '@norejs/prefetch'
import { Link } from 'react-router-dom'

function RouterIntegration() {
  return (
    <PrefetchLink appUrl="/admin">
      <Link to="/admin" className="nav-link">
        管理后台
      </Link>
    </PrefetchLink>
  )
}
```

## 🔧 工作原理

### 1. **组件挂载**
```jsx
useEffect(() => {
  registerPreloadApp({ appUrl });
}, []);
```
当组件挂载时，自动调用 `registerPreloadApp` 开始预加载过程。

### 2. **HTML 解析**
```typescript
// 获取目标应用的 HTML
const html = await get(appUrl);
const manifest = await parseHtml(html, appUrl);
```

### 3. **资源提取**
解析 HTML 页面，提取以下资源：

```typescript
// 提取的资源类型
const manifest = {
  preScripts: [],      // JavaScript 文件
  prefetchLinks: [],   // CSS 和其他预取资源
};
```

### 4. **沙箱预加载**
```typescript
// 创建隐藏的 iframe 沙箱
const iframe = document.createElement("iframe");
iframe.style.display = "none";
iframe.src = appUrl;
iframe.sandbox.add("allow-scripts");
iframe.sandbox.add("allow-same-origin");

// 在沙箱中添加资源链接
prefetchLinks.forEach((link) => {
  const linkElement = iframeDocument.createElement("link");
  linkElement.rel = "prefetch";
  linkElement.href = link;
  fragment.appendChild(linkElement);
});
```

## 📊 支持的资源类型

### HTML 标签解析

| 标签 | 属性 | 提取规则 |
|------|------|----------|
| `<script>` | `src` | JavaScript 文件 |
| `<link rel="stylesheet">` | `href` | CSS 样式表 |
| `<link rel="prefetch">` | `href` | 预取资源 |
| `<link rel="prefetch-manifest">` | `href` | 预取清单 |

### 示例 HTML 解析

```html
<!-- 目标应用的 HTML -->
<!DOCTYPE html>
<html>
<head>
  <!-- CSS 文件 - 会被预加载 -->
  <link rel="stylesheet" href="/styles/app.css">
  
  <!-- 预取资源 - 会被预加载 -->
  <link rel="prefetch" href="/api/config.json">
  
  <!-- 预取清单 - 会加载清单中的资源 -->
  <link rel="prefetch-manifest" href="/manifest.json">
</head>
<body>
  <!-- JavaScript 文件 - 会被预加载 -->
  <script src="/js/app.js"></script>
  
  <!-- 预取脚本 - 特殊处理 -->
  <script type="prefetch" src="/js/prefetch.js"></script>
</body>
</html>
```

## ⚙️ 高级配置

### 自定义生命周期

```typescript
// 内部实现 - 展示配置选项
export default async function runAppPrefetchScript({
  appUrl = "",
  lifespan = 10000,  // iframe 生命周期（毫秒）
} = {}) {
  // ...
}
```

### 缓存机制

```typescript
// 清单缓存 - 避免重复解析
const manifestCache: { [key: string]: any } = {};

if (manifestCache[appUrl]) {
  return manifestCache[appUrl];
}
```

## 🎯 使用场景

### 1. **微前端架构**
```jsx
// 主应用预加载子应用资源
<PrefetchLink appUrl="https://subapp.example.com">
  <button>进入子应用</button>
</PrefetchLink>
```

### 2. **SPA 应用启动器**
```jsx
// 应用门户预加载各个应用
const apps = [
  { name: "CRM", url: "https://crm.example.com" },
  { name: "ERP", url: "https://erp.example.com" },
];

return apps.map(app => (
  <PrefetchLink key={app.name} appUrl={app.url}>
    <AppCard name={app.name} />
  </PrefetchLink>
));
```

### 3. **导航菜单优化**
```jsx
// 鼠标悬停时预加载目标页面资源
<PrefetchLink appUrl="/heavy-dashboard">
  <nav-item onMouseEnter={handleHover}>
    重型仪表板
  </nav-item>
</PrefetchLink>
```

## ⚠️ 注意事项

### 1. **跨域限制**
- 只能预加载同源应用资源
- 跨域应用需要设置适当的 CORS 头

### 2. **性能考虑**
- iframe 创建有一定开销
- 默认 10 秒后自动销毁 iframe
- 缓存解析结果避免重复处理

### 3. **安全性**
- 使用沙箱 iframe 隔离预加载环境
- 只允许脚本执行和同源访问

### 4. **浏览器兼容性**
- 需要支持 iframe 和 DOMParser
- 现代浏览器都支持

## 🆚 与其他预加载方案对比

| 特性 | PrefetchLink | `<link rel="prefetch">` | 手动预加载 |
|------|-------------|------------------------|-----------|
| **智能资源发现** | ✅ 自动解析 HTML | ❌ 需手动指定 | ❌ 需手动编码 |
| **React 集成** | ✅ 原生组件 | ❌ 需手动集成 | ❌ 需自己实现 |
| **沙箱隔离** | ✅ iframe 沙箱 | ❌ 无隔离 | ❌ 需自己实现 |
| **缓存优化** | ✅ 内置缓存 | ❌ 浏览器缓存 | ❌ 需自己实现 |
| **生命周期管理** | ✅ 自动管理 | ❌ 手动清理 | ❌ 需自己实现 |

## 🔧 最佳实践

### 1. **合理使用时机**
```jsx
// ✅ 好的做法：在用户可能点击前预加载
<PrefetchLink appUrl="/dashboard">
  <Button onMouseEnter={trackHover}>
    进入仪表板
  </Button>
</PrefetchLink>

// ❌ 避免：页面加载时立即预加载所有应用
useEffect(() => {
  // 这会造成不必要的资源浪费
  apps.forEach(app => prefetchApp(app.url));
}, []);
```

### 2. **结合用户行为**
```jsx
function SmartPrefetch({ appUrl, children }) {
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  
  const handleMouseEnter = () => {
    // 延迟预加载，避免快速划过触发
    setTimeout(() => setShouldPrefetch(true), 300);
  };
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      {shouldPrefetch && (
        <PrefetchLink appUrl={appUrl}>
          {children}
        </PrefetchLink>
      )}
      {!shouldPrefetch && children}
    </div>
  );
}
```

### 3. **错误处理**
```jsx
function SafePrefetchLink({ appUrl, children, fallback }) {
  const [error, setError] = useState(null);
  
  if (error) {
    return fallback || children;
  }
  
  return (
    <PrefetchLink 
      appUrl={appUrl}
      onError={setError}
    >
      {children}
    </PrefetchLink>
  );
}
```

## 📈 性能优势

1. **减少首次加载时间**：关键资源已被预加载
2. **改善用户体验**：应用启动更快
3. **智能资源管理**：避免重复加载
4. **网络优化**：利用浏览器空闲时间预加载

## 🔗 相关 API

- [`preFetch`](./PREFETCH_API.md) - 数据预请求 API
- [`setup`](./SETUP_API.md) - 初始化配置 API
- [`runAppPfetchScript`](./RUN_APP_PFETCH_SCRIPT.md) - 应用预加载脚本
