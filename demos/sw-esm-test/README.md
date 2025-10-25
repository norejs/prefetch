# Service Worker ESM 测试

这个demo专门测试Service Worker中ES Modules (ESM) 的支持情况和使用方法。

## 📦 NPM Package

这是一个独立的 npm package，可以通过以下方式安装和运行：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者
npm start
```

## 📁 文件结构

```
demos/sw-esm-test/
├── package.json            # NPM 包配置
├── index.html              # 主测试页面
├── sw-classic.js           # 传统Service Worker (importScripts)
├── sw-module.js            # ES Module Service Worker
├── README.md               # 说明文档
└── modules/                # 模块目录
    ├── utils-classic.js    # 传统模式工具函数
    ├── utils-esm.js        # ES Module工具函数
    ├── cache-manager-classic.js  # 传统缓存管理器
    ├── cache-manager-esm.js      # ES Module缓存管理器
    ├── api-handler-esm.js        # ES Module API处理器
    └── dynamic-feature.js        # 动态导入功能演示
```

## 🌐 CDN 引入方式

本演示项目使用开发环境的 CDN 方式引入 prefetch-worker：

```javascript
// 在 sw-module.js 中
import * as prefetch from "http://localhost:18003/service-worker.esm.js"
```

### 启动开发服务器

在使用本演示之前，需要先启动 prefetch-worker 的开发服务器：

```bash
# 在项目根目录
cd packages/prefetch-worker
npm run dev

# 或者直接启动开发服务器
npm run dev:server
```

开发服务器将在 `http://localhost:18003` 提供 prefetch-worker 的 ESM 版本文件。

## 🎯 测试目标

### 1. ES Module 基础支持
- ✅ `import` / `export` 语法
- ✅ 命名导入和默认导入
- ✅ 模块作用域隔离
- ✅ 静态分析和树摇优化

### 2. 动态导入 (Dynamic Import)
- ✅ `import()` 函数
- ✅ 条件导入
- ✅ 异步模块加载
- ✅ 错误处理

### 3. Service Worker 特性
- ✅ `type: 'module'` 注册选项
- ✅ 模块化架构
- ✅ 类和现代JavaScript语法
- ✅ 异步/等待模式

### 4. 浏览器兼容性
- ✅ Chrome 91+ (完全支持)
- ✅ Firefox 89+ (完全支持)
- ✅ Safari 15+ (完全支持)
- ⚠️ 旧版浏览器降级处理

## 🚀 使用方法

### 1. 启动服务器

```bash
cd demos/sw-esm-test
node server.js
```

或者使用其他方式：
```bash
# Python
python3 -m http.server 8081

# PHP
php -S localhost:8081

# npx
npx serve . -p 8081
```

### 2. 访问测试页面

打开浏览器访问: `http://localhost:8081`

### 3. 测试步骤

1. **浏览器支持检测**: 页面会自动检测浏览器对各种特性的支持
2. **注册Service Worker**: 
   - 点击"注册模块 SW (ESM)"测试ES Module支持
   - 点击"注册传统 SW (importScripts)"作为降级方案
3. **功能测试**: 使用各种测试按钮验证功能
4. **查看日志**: 观察控制台和页面日志输出

## 📊 对比分析

### 传统 importScripts vs ES Modules

| 特性 | importScripts | ES Modules |
|------|---------------|------------|
| 语法 | `importScripts('./module.js')` | `import { func } from './module.js'` |
| 加载方式 | 同步 | 异步 |
| 作用域 | 全局 | 模块作用域 |
| 树摇优化 | ❌ | ✅ |
| 静态分析 | ❌ | ✅ |
| 动态导入 | ❌ | ✅ |
| 类型检查 | 有限 | 完整 |
| 现代语法 | 有限 | 完整 |

### 代码示例对比

#### 传统方式 (importScripts)
```javascript
// sw-classic.js
importScripts('./utils.js');
importScripts('./cache.js');

// 全局作用域
self.addEventListener('fetch', (event) => {
    // 使用全局函数
    const result = self.utilsFunction(event.request);
});
```

#### ES Module 方式
```javascript
// sw-module.js
import { utils } from './utils.js';
import { CacheManager } from './cache.js';

// 模块作用域
const cacheManager = new CacheManager();

self.addEventListener('fetch', (event) => {
    // 使用导入的模块
    const result = utils.processRequest(event.request);
});
```

## 🔧 高级特性

### 1. 动态导入
```javascript
// 条件导入
if (someCondition) {
    const { feature } = await import('./optional-feature.js');
    feature.initialize();
}

// 错误处理
try {
    const module = await import('./module.js');
    module.run();
} catch (error) {
    console.error('模块加载失败:', error);
    // 降级处理
}
```

### 2. 模块化架构
```javascript
// 清晰的依赖关系
import { Logger } from './logger.js';
import { CacheManager } from './cache-manager.js';
import { ApiHandler } from './api-handler.js';

class ServiceWorkerManager {
    constructor() {
        this.logger = new Logger();
        this.cache = new CacheManager();
        this.api = new ApiHandler(this.cache);
    }
}
```

### 3. 现代JavaScript语法
```javascript
// 类和继承
export class AdvancedCache extends CacheManager {
    async smartCache(request) {
        const { method, url } = request;
        // 解构赋值、模板字符串等
        this.logger.info(`Caching ${method} ${url}`);
    }
}

// 异步/等待
export async function processRequest(request) {
    try {
        const response = await fetch(request);
        return await response.json();
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}
```

## 🐛 常见问题

### 1. 浏览器不支持
```javascript
// 检测支持
if ('serviceWorker' in navigator) {
    try {
        // 尝试ES Module注册
        await navigator.serviceWorker.register('./sw-module.js', { 
            type: 'module' 
        });
    } catch (error) {
        // 降级到传统方式
        await navigator.serviceWorker.register('./sw-classic.js');
    }
}
```

### 2. 模块路径问题
```javascript
// ❌ 错误：相对路径可能有问题
import { utils } from '../utils.js';

// ✅ 正确：使用明确的相对路径
import { utils } from './modules/utils.js';

// ✅ 正确：使用绝对路径
import { utils } from '/modules/utils.js';
```

### 3. CORS 问题
```javascript
// 服务器需要正确设置MIME类型
headers: {
    'Content-Type': 'application/javascript',
    'X-Content-Type-Options': 'nosniff'
}
```

## 📈 性能优化

### 1. 模块拆分
- 按功能拆分模块
- 避免循环依赖
- 使用动态导入延迟加载

### 2. 缓存策略
- 缓存模块文件
- 版本化管理
- 预加载关键模块

### 3. 错误处理
- 优雅降级
- 重试机制
- 详细日志记录

## 🔮 未来发展

### 1. Import Maps 支持
```html
<!-- 在主页面中定义 -->
<script type="importmap">
{
  "imports": {
    "utils": "./modules/utils.js",
    "cache": "./modules/cache-manager.js"
  }
}
</script>
```

### 2. Web Assembly 集成
```javascript
// 导入WASM模块
const wasmModule = await import('./processor.wasm');
const processor = await wasmModule.default();
```

### 3. 更好的开发工具
- 源码映射支持
- 热重载
- 类型检查集成

## 📚 参考资源

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Dynamic Import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
- [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)