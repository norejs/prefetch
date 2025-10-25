# Service Worker 演示项目

这个目录包含了多个Service Worker相关的演示项目，用于测试和学习不同的Service Worker功能和模块加载方式。

## 📁 项目列表

### 1. [@norejs/demo-importscripts-basic](./importscripts-basic/) - ImportScripts 基础演示
- **NPM Package**: `@norejs/demo-importscripts-basic`
- **端口**: 8080
- **启动**: `npm install && npm run dev`
- **功能**: 演示传统的`importScripts`用法
- **CDN 引入**: `http://localhost:18003/service-worker.js`
- **特性**:
  - ✅ 基础的`importScripts`导入
  - ✅ 错误处理和降级方案
  - ✅ 同步脚本加载
  - ✅ 全局作用域共享
  - ✅ 传统Service Worker架构
  - ✅ CDN 方式引入 prefetch-worker
  - ✅ 独立 NPM 包，使用 serve 启动

### 2. [@norejs/demo-sw-esm-test](./sw-esm-test/) - ES Modules 测试
- **NPM Package**: `@norejs/demo-sw-esm-test`
- **端口**: 8081
- **启动**: `npm install && npm run dev`
- **功能**: 测试Service Worker中的ES Modules支持
- **CDN 引入**: `http://localhost:18003/service-worker.esm.js`
- **特性**:
  - ✅ ES Module `import`/`export`语法
  - ✅ 动态导入 (`import()`)
  - ✅ 模块作用域隔离
  - ✅ 现代JavaScript语法支持
  - ✅ 类和异步/等待模式
  - ✅ 浏览器兼容性检测
  - ✅ CDN 方式引入 prefetch-worker
  - ✅ 独立 NPM 包，使用 serve 启动

## 🚀 快速开始

### 前置条件：启动 prefetch-worker 开发服务器

两个演示项目都使用 CDN 方式引入 prefetch-worker，需要先启动开发服务器：

```bash
# 在项目根目录
cd packages/prefetch-worker
npm run dev

# 开发服务器将在 http://localhost:18003 提供文件
```

### 方式一：分别启动 (推荐)
```bash
# 启动 ImportScripts 演示
cd demos/importscripts-basic
npm install && npm run dev
# 访问: http://localhost:8080

# 启动 ESM 测试
cd demos/sw-esm-test
npm install && npm run dev
# 访问: http://localhost:8081
```

### 方式二：快速启动
```bash
# ImportScripts 演示
cd demos/importscripts-basic
npm start

# ESM 测试
cd demos/sw-esm-test
npm start
```

## 📊 功能对比

| 特性 | ImportScripts | ES Modules |
|------|---------------|------------|
| **语法** | `importScripts('./file.js')` | `import { func } from './file.js'` |
| **加载方式** | 同步 | 异步 |
| **作用域** | 全局 (`self`) | 模块作用域 |
| **错误处理** | try-catch | try-catch + Promise |
| **动态导入** | ❌ | ✅ `import()` |
| **树摇优化** | ❌ | ✅ |
| **静态分析** | ❌ | ✅ |
| **现代语法** | 有限 | 完整支持 |
| **浏览器支持** | 所有支持SW的浏览器 | Chrome 91+, Firefox 89+, Safari 15+ |

## 🎯 学习路径

### 初学者
1. 先学习 **importscripts-basic** 了解基础概念
2. 理解Service Worker的生命周期
3. 掌握基本的缓存策略

### 进阶用户
1. 学习 **sw-esm-test** 了解现代模块系统
2. 掌握ES Module的导入导出
3. 学习动态导入和条件加载

### 高级用户
1. 对比两种方式的优缺点
2. 根据项目需求选择合适的方案
3. 实现混合架构和降级策略

## 🔧 开发工具

### 浏览器开发者工具
- **Application > Service Workers**: 查看SW状态
- **Network**: 监控脚本加载
- **Console**: 查看日志和错误
- **Sources**: 调试模块代码

### 推荐扩展
- **Service Worker Inspector**: Chrome扩展
- **Web Developer**: 多功能开发工具
- **Lighthouse**: 性能和PWA审计

## 📋 测试清单

### ImportScripts 测试
- [ ] 脚本成功导入
- [ ] 错误处理正常
- [ ] 全局函数可用
- [ ] 缓存功能正常
- [ ] API响应正确

### ES Modules 测试
- [ ] 模块注册成功
- [ ] 导入导出正常
- [ ] 动态导入工作
- [ ] 类和现代语法支持
- [ ] 错误边界处理

## 🐛 常见问题

### 1. 端口冲突
```bash
# 查看端口占用
lsof -i :8080
lsof -i :8081

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=8082 node server.js
```

### 2. Service Worker 缓存问题
```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
    }
});

// 清除缓存
caches.keys().then(function(names) {
    for(let name of names) {
        caches.delete(name);
    }
});
```

### 3. 模块加载失败
- 检查文件路径是否正确
- 确认服务器MIME类型设置
- 查看网络面板的错误信息
- 检查CORS设置

## 🔮 扩展项目

### 可以添加的演示
1. **Import Maps 演示**: 测试导入映射功能
2. **Web Assembly 集成**: WASM模块在SW中的使用
3. **混合架构**: ImportScripts + ESM 的组合使用
4. **性能对比**: 两种方式的性能测试
5. **PWA 完整示例**: 结合缓存策略的完整PWA

### 贡献指南
1. 每个新演示都应该有独立的目录
2. 包含完整的README文档
3. 提供启动脚本和测试用例
4. 添加到主README的项目列表中

## 📚 参考资源

- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [ES Modules - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ImportScripts - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts)
- [PWA 指南](https://web.dev/progressive-web-apps/)
- [Service Worker 最佳实践](https://developers.google.com/web/fundamentals/primers/service-workers)

---

💡 **提示**: 建议在现代浏览器中测试，并准备好降级方案以支持旧版浏览器。