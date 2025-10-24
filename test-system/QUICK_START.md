# 快速开始指南

## 📋 前提条件

test-system 现在已集成到 pnpm monorepo 中。

### 安装依赖

从项目根目录：

```bash
# 安装所有 workspace 依赖
pnpm install

# 安装 Playwright 浏览器
cd test-system
pnpm run install:playwright
```

或者只在 test-system 目录：

```bash
cd test-system
pnpm install
pnpm run install:playwright
```

## 🚀 运行测试的方式

### 从根目录运行（推荐）

使用 pnpm workspace 命令：

```bash
# 快速测试（跳过安装和浏览器）
pnpm test:quick

# 测试单个模板
pnpm test:single

# 完整测试
pnpm test
```

### 从 test-system 目录运行

```bash
cd test-system

# 1. 查看帮助信息
pnpm test -- --help

# 2. 快速测试（推荐开始使用）
pnpm test:quick

# 3. 测试单个模板
pnpm test:single

# 4. 测试所有模板（仅 CLI 测试）
pnpm test -- --skip-install --skip-browser

# 5. 测试多个特定模板
pnpm test -- react-cra-no-sw nextjs-no-sw --skip-install --skip-browser

# 6. 完整测试（包括浏览器测试）
# ⚠️ 注意：需要先实现开发服务器启动功能
pnpm test -- react-cra-no-sw --skip-install
```

### 直接使用 node 命令

```bash
cd test-system

# 查看帮助
node test-runner/index.js --help

# 快速测试
node test-runner/index.js react-cra-no-sw --skip-install --skip-browser

# 测试所有模板
node test-runner/index.js --skip-install --skip-browser
```

## 📊 可用的测试模板

当前系统中有以下测试模板：

1. `react-cra-no-sw` - React CRA 项目，无 Service Worker
2. `react-cra-with-sw` - React CRA 项目，有 Service Worker
3. `react-cra-with-workbox` - React CRA 项目，使用 Workbox
4. `react-cra-with-prefetch` - React CRA 项目，已集成 Prefetch
5. `react-vite-no-sw` - React Vite 项目，无 Service Worker
6. `nextjs-no-sw` - Next.js 项目，无 Service Worker
7. `nextjs-with-sw` - Next.js 项目，有 Service Worker
8. `vue3-vite-no-sw` - Vue 3 Vite 项目，无 Service Worker

## 🎯 常用命令组合

### 开发模式（最快）

```bash
node test-runner/index.js react-cra-no-sw --skip-install --skip-browser --quiet
```

### 调试模式

```bash
node test-runner/index.js react-cra-no-sw --skip-install --skip-browser --log-level=debug
```

### CI 模式

```bash
node test-runner/index.js --headless --verbose --stop-on-failure
```

## 📁 测试结果

测试结果保存在 `test-results/` 目录：

```
test-results/
├── reports/
│   ├── test-report-<timestamp>.json    # 完整测试报告
│   ├── latest-summary.json             # 最新测试摘要
│   ├── failures-<timestamp>.json       # 失败测试详情
│   └── test-history.json               # 历史测试记录
├── logs/                               # 测试日志
├── screenshots/                        # 失败截图
└── temp/                               # 临时测试目录
```

## ⚠️ 当前限制

1. **CLI 工具路径**：确保 `../packages/prefetch/bin/prefetch-migrate.js` 存在
2. **开发服务器**：浏览器测试需要开发服务器支持（当前未实现）
3. **依赖安装**：首次测试建议使用 `--skip-install` 以加快速度

## 🔧 故障排除

### 问题：端口 3001 已被占用

**解决方案：** 修改 `test-config.js` 中的端口：

```javascript
apiServer: {
  port: 3002, // 改为其他可用端口
  // ...
}
```

### 问题：CLI 工具执行失败

**原因：** CLI 工具路径不正确或文件不存在

**解决方案：** 检查 `test-config.js` 中的 `cli.cliPath` 配置

### 问题：测试超时

**解决方案：** 增加超时时间：

```bash
node test-runner/index.js --timeout=60000 --template-timeout=600000
```

### 问题：框架检测失败

**原因：** 模板配置中的框架名称与检测结果不匹配

**解决方案：** 已修复，现在支持框架名称别名（如 `cra` 和 `react-cra`）

## 📖 更多文档

- [完整使用指南](test-runner/USAGE.md)
- [实现总结](test-runner/IMPLEMENTATION_SUMMARY.md)
- [测试配置](test-config.js)

## 💡 提示

1. 开发时使用 `--skip-install` 可以大幅加快测试速度
2. 使用 `--quiet` 可以减少输出，专注于结果
3. 使用 `--log-level=debug` 可以查看详细的调试信息
4. 测试单个模板比测试所有模板更快，适合快速验证
5. 查看 `test-results/reports/latest-summary.json` 可以快速了解最新测试结果
