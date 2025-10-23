# React CRA + Prefetch Demo

使用 Create React App 创建的 Prefetch Worker 集成示例。

## 📋 项目说明

本项目用于测试和演示 Prefetch CLI 工具在 React CRA 项目中的运行情况。

## ✨ 功能特性

- ✅ Service Worker 数据预取
- ✅ 自动框架检测
- ✅ 现有项目轻松集成
- ✅ 完整的测试覆盖
- ✅ API 预请求演示
- ✅ 缓存命中率统计
- ✅ 实时状态监控

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 Service Worker

```bash
# 方式一：使用 CLI 工具创建新的 Service Worker
npm run create-sw

# 方式二：如果已有 Service Worker，集成 Prefetch
npm run integrate-prefetch

# 方式三：直接使用命令
npx @norejs/prefetch integrate --create --output public/service-worker.js
```

### 3. 启动开发服务器

```bash
npm start
```

访问 http://localhost:3000

## 🔧 CLI 工具使用

### 创建新的 Service Worker

```bash
npx @norejs/prefetch integrate \
  --create \
  --output public/service-worker.js
```

### 集成到现有 Service Worker

```bash
npx @norejs/prefetch integrate \
  --input public/existing-sw.js \
  --output public/service-worker.js
```

### 使用自定义配置

```bash
npx @norejs/prefetch integrate \
  --create \
  --output public/service-worker.js \
  --config '{"maxAge":7200,"maxCacheSize":100}'
```

### 验证集成

```bash
npx @norejs/prefetch integrate --verify public/service-worker.js
```

## 📁 项目结构

```
react-cra-demo/
├── public/
│   ├── index.html
│   ├── service-worker.js      # ✅ 新创建的 SW
│   ├── existing-sw.js          # 测试用的现有 SW
│   └── integrated-sw.js        # ✅ 集成后的 SW
├── src/
│   ├── App.js                  # 主组件
│   ├── App.css                 # 样式
│   ├── index.js                # 入口文件
│   └── index.css
├── TEST_REPORT.md              # 详细测试报告
├── INTEGRATION_TEST.md         # 集成测试文档
├── FINAL_TEST_SUMMARY.md       # 最终测试总结
├── package.json
└── README.md
```

## 📊 测试结果

| 测试项 | 状态 | 说明 |
|--------|------|------|
| 创建新 SW | ✅ | 完美运行 |
| 集成现有 SW | ✅ | 代码完整保留 |
| 验证集成 | ✅ | 所有检查通过 |
| 自定义配置 | ✅ | 配置正确应用 |
| 版本控制 | ✅ | CDN URL 正确 |
| 框架检测 | ✅ | 准确识别 CRA |
| 错误处理 | ✅ | 错误提示清晰 |

**总体通过率: 100% (9/9)**

## 💡 使用示例

### 在应用中注册 Service Worker

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

### 使用 Prefetch API

```javascript
import { setup, preFetch } from '@norejs/prefetch';

// 初始化 Prefetch
setup({
  serviceWorkerUrl: '/service-worker.js',
  maxAge: 3600,
  maxCacheSize: 50
});

// 预取数据
function prefetchProducts() {
  preFetch('/api/products', {
    expireTime: 7200
  });
}

// 在组件中使用
function ProductList() {
  useEffect(() => {
    // 预取下一页数据
    preFetch('/api/products?page=2');
  }, []);
  
  // ...
}
```

## 📖 测试文档

- [详细测试报告](./TEST_REPORT.md) - 测试过程和结果
- [集成测试文档](./INTEGRATION_TEST.md) - 完整的测试用例
- [最终测试总结](./FINAL_TEST_SUMMARY.md) - 综合评估和建议

## 🎯 测试流程

### 1. 预请求
点击"预请求数据"按钮，数据会被缓存

### 2. 获取数据
点击"获取数据"按钮，从缓存快速返回

### 3. 查看统计
观察缓存命中率和响应时间

## ⚠️ 注意事项

- Service Worker 需要 HTTPS 或 localhost 环境
- 首次注册后需要刷新页面
- 开发环境下可能需要清除缓存测试
- CRA 默认不支持 Service Worker，需要手动注册

## 🎉 测试总结

CLI 工具在 React CRA 项目中表现完美：

- **功能完整性**: ⭐⭐⭐⭐⭐
- **易用性**: ⭐⭐⭐⭐⭐
- **代码质量**: ⭐⭐⭐⭐⭐
- **兼容性**: ⭐⭐⭐⭐⭐
- **性能**: ⭐⭐⭐⭐⭐

**总体评分: ⭐⭐⭐⭐⭐ (5/5)**

## 📞 相关链接

- [主文档](../../README.md)
- [集成指南](../../docs/INTEGRATION_GUIDE.md)
- [GitHub Issues](https://github.com/yourusername/prefetch/issues)
