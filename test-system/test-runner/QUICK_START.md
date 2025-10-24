# Browser Test Runner - Quick Start Guide

## 快速开始

### 1. 安装依赖

```bash
cd test-system
npm install
npm run install:playwright
```

### 2. 基本测试

测试浏览器初始化和基本功能：

```bash
node test-runner/test-browser-runner.js
```

### 3. 查看集成示例

```bash
# 运行完整集成测试示例
node test-runner/example-integration.js integration

# 运行浏览器测试示例
node test-runner/example-integration.js browser
```

## 常用命令

### 运行 CLI 测试

```bash
npm run test:cli
```

### 运行浏览器测试

```bash
npm run test:browser
```

### 启动 API 服务器

```bash
npm run api:start
```

## 代码示例

### 最简单的使用

```javascript
const BrowserTestRunner = require('./test-runner/browser-tests');
const config = require('./test-config');

async function test() {
  const runner = new BrowserTestRunner(config);
  
  const results = await runner.runTests(
    './my-project',
    'http://localhost:3000'
  );
  
  console.log('Results:', results);
}

test();
```

### 自定义测试

```javascript
const runner = new BrowserTestRunner(config);

// 初始化
await runner.initBrowser();
await runner.createPage();

// 设置捕获
runner.setupNetworkCapture();
runner.setupConsoleCapture();

// 导航
await runner.page.goto('http://localhost:3000');

// 运行特定测试
await runner.testSWRegistration();
await runner.testPrefetchFunctionality();

// 获取结果
const network = runner.captureNetworkActivity();
const logs = runner.getConsoleLogs();

// 清理
await runner.cleanup();
```

## 配置

编辑 `test-config.js` 来自定义测试行为：

```javascript
{
  browser: {
    headless: true,        // 无头模式
    slowMo: 0,             // 慢动作（调试用）
    timeout: 30000,        // 超时时间
    browserType: 'chromium' // 浏览器类型
  },
  reporting: {
    verbose: true,         // 详细日志
    saveScreenshots: true, // 保存截图
    saveConsoleLogs: true  // 保存日志
  }
}
```

## 测试流程

```
1. 启动 API 服务器
   ↓
2. 复制测试模板
   ↓
3. 运行 CLI 测试（迁移工具）
   ↓
4. 安装依赖
   ↓
5. 启动开发服务器
   ↓
6. 运行浏览器测试
   ↓
7. 清理资源
```

## 测试内容

### Service Worker 测试
- ✓ 注册验证
- ✓ 激活状态检查
- ✓ Scope 和 scriptURL 验证

### Prefetch 测试
- ✓ Prefetch 请求检测
- ✓ 请求头验证
- ✓ 缓存验证

### 缓存测试
- ✓ 缓存存在性检查
- ✓ 缓存内容验证
- ✓ 缓存命中测试

### 网络和日志
- ✓ 所有网络请求捕获
- ✓ 控制台日志记录
- ✓ 错误和警告捕获

## 输出文件

测试结果保存在 `test-results/` 目录：

```
test-results/
├── screenshots/        # 截图（失败时）
├── logs/              # 日志文件
│   ├── *-console-*.json
│   └── *-network-*.json
└── reports/           # 测试报告
```

## 故障排除

### 浏览器启动失败

```bash
# 重新安装 Playwright 浏览器
npx playwright install
```

### Service Worker 注册超时

- 检查 Service Worker 文件是否存在
- 检查开发服务器是否运行
- 增加超时时间（在 test-config.js 中）

### 端口被占用

- 更改 API 服务器端口（在 test-config.js 中）
- 或停止占用端口的进程

## 更多信息

- 详细文档: `BROWSER_TESTS_README.md`
- 实现总结: `IMPLEMENTATION_SUMMARY.md`
- API 参考: 查看 `browser-tests.js` 中的 JSDoc 注释

## 支持的浏览器

- ✅ Chromium (默认)
- ✅ Firefox
- ✅ WebKit (Safari)

## 下一步

1. 阅读完整文档 `BROWSER_TESTS_README.md`
2. 查看集成示例 `example-integration.js`
3. 根据需要自定义配置
4. 开始编写自己的测试

---

**提示**: 使用 `headless: false` 和 `slowMo: 100` 来观察测试执行过程（调试时很有用）
