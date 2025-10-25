# 端口分配方案

本项目使用 **18000-18099** 端口段，这个范围相对冷门但兼容性好，避免与常用服务冲突。

## 端口分配表

### 核心服务 (18000-18009)
- **18001** - API Server (`test-system/api-server`)
- **18002** - swiftcom (`packages/swiftcom`)  
- **18003** - prefetch-worker (`packages/prefetch-worker`)

### Demo 项目 (18010-18019)
- **18010** - nextjs-no-sw (`test-system/demos/nextjs-no-sw`)
- **18011-18019** - 预留给未来的 demo 项目

### 测试应用 (18020-18029)
- **18021** - vue3-vite-no-sw test app (`test-apps/vue3-vite-no-sw`)
- **18022-18029** - 预留给其他测试应用

### 调试服务 (18030-18039)
- **18030** - prefetch debug server
- **18031-18039** - 预留给调试相关服务

## 访问地址

启动 `turbo dev` 后，各服务的访问地址：

- **API Server**: http://localhost:18001
- **swiftcom**: http://localhost:18002
- **prefetch-worker**: http://localhost:18003
- **Next.js Demo**: http://localhost:18010
- **Vue3 Test App**: http://localhost:18021

## 开发环境 SW 文件配置

在开发环境中，Service Worker 文件可以配置为使用本地开发服务器：

```javascript
// 开发环境配置示例
const PREFETCH_CONFIG = {
  // 开发环境使用本地服务器（当前可用文件）
  cdnUrl: 'http://localhost:18003/service-worker.js',
  
  // 生产环境使用 CDN
  // cdnUrl: 'https://esm.sh/@norejs/prefetch-worker@latest/dist/service-worker.js',
  
  fallbackUrl: '/service-worker.js',
  timeout: 5000,
};
```

**注意**: 
- 当前开发服务器提供的是 `service-worker.js` 文件
- 如果需要 UMD 格式的 `prefetch-worker.umd.js` 用于 `importScripts()`，需要后续修复构建配置
- 使用 `prefetch-integrate` 工具的 `--debug` 模式会自动配置为使用 `http://localhost:18030` 调试服务器

## Templates 目录说明

`test-system/templates/` 目录下的项目是模板文件，不会被 turbo 运行。它们通过 `pnpm-workspace.yaml` 中的 `!test-system/templates/**` 规则被排除。

这些模板用于：
- 作为测试系统的项目模板
- 通过脚本复制到 `test-apps/` 或 `test-system/demos/` 目录使用
- 不直接参与开发服务器启动

## 端口选择说明

选择 **18000-18099** 端口段的原因：
- ✅ 避开系统保留端口 (0-1023)
- ✅ 避开常用开发端口 (3000, 8000, 9000 等)
- ✅ 兼容性好，所有程序都支持
- ✅ 相对冷门，冲突概率低
- ✅ 端口号不会太大，便于记忆

## 端口冲突解决

如果遇到端口被占用的情况：

1. 检查是否有其他服务占用了 18000-18099 端口段
2. 使用 `lsof -i :18001` 等命令查看端口占用情况  
3. 18000+ 端口段相对冷门，冲突概率较低
4. 如需修改端口，请更新对应的配置文件并同步更新此文档

## 配置文件位置

- API Server: `test-system/test-config.js`, `test-system/api-server/test-api.js`
- swiftcom: `packages/swiftcom/rsbuild.config.ts`
- prefetch-worker: `packages/prefetch-worker/rsbuild.config.ts`
- Next.js Demo: `test-system/demos/nextjs-no-sw/package.json`
- Vue3 Test App: `test-apps/vue3-vite-no-sw/vite.config.js`
- Debug Server: `packages/prefetch/bin/prefetch-migrate.js`, `packages/prefetch/bin/prefetch-integrate.js`

## Workspace 配置

在 `pnpm-workspace.yaml` 中通过以下规则排除 templates：
```yaml
- '!test-system/templates/**'
```