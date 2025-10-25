# @norejs/prefetch-worker

## 1.1.0 (Unreleased)

### 🚀 Major Features

- **全局 Fetch 处理器**: 新增 `createGlobalFetchHandler()` 函数，解决 Service Worker 中 fetch 监听器必须同步注册的限制
- **状态管理**: 支持 `pass-through`、`active`、`error` 三种运行模式，可动态切换
- **智能初始化**: 改进 `initializePrefetchWorker()` 函数，自动管理全局处理器的创建和配置

### 🔧 API Changes

- 新增 `createGlobalFetchHandler(): GlobalFetchHandler` - 创建全局 fetch 处理器
- 新增 `GlobalFetchHandler` 接口，支持动态配置和状态查询
- 改进 `initializePrefetchWorker()` - 现在自动使用全局处理器
- **自动注册**: 通过 main() 函数立即执行自动注册全局处理器，无需手动调用
- **模块化重构**: 将 `setupMessageListener` 和 `initializePrefetchWorker` 分离到独立文件
- 重新导出 `setupMessageListener` 供高级用户使用
- 更新模板文件，简化使用方式

### 🐛 Bug Fixes

- 修复 Service Worker 中 fetch 监听器必须同步注册的问题
- 改进错误处理，避免配置失败时影响正常请求
- 清理 handleFetch.ts 中未使用的函数，减少代码体积

### 📚 Documentation

- 更新 README，添加全局处理器使用说明
- 新增使用示例和最佳实践
- 完善 TypeScript 类型定义

### 🏗️ Code Structure

- **模块化架构**: 将功能拆分到独立文件提高可维护性
  - `src/messageListener.ts` - 消息监听器逻辑
  - `src/initialize.ts` - 初始化逻辑
  - `src/main.ts` - 主入口函数，只导出 main() 函数
- **同步执行**: main() 函数在 index.ts 中同步执行，确保 fetch 监听器立即注册
- **直接导入**: index.ts 直接导入 initializePrefetchWorker，无需通过 main
- **代码清理**: 移除 handleFetch.ts 中未使用的函数和重复代码

### 🗑️ Deprecations

- 移除 `src/worker.ts` 文件，使用模板替代

## 1.0.0

### Initial Release

Service worker implementation for background prefetching.

### Features

- 🔧 Service worker setup and installation utilities
- 📡 Background request prefetching with caching
- 🎯 Rule-based request matching and handling
- 🔐 Crypto-based request key generation
- 📝 Comprehensive logging for debugging

### Build

- Built with Rsbuild for optimized service worker bundle
- Express server utilities for development and testing
