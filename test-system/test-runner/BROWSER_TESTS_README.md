# Browser Test Runner

浏览器自动化测试运行器，使用 Playwright 验证 Service Worker 注册和 Prefetch 功能。

## 功能特性

### 1. Service Worker 注册测试
- 验证 Service Worker 是否成功注册
- 验证 Service Worker 是否进入 activated 状态
- 支持超时和重试逻辑
- 获取 Service Worker 详细信息（scope, state, scriptURL 等）

### 2. Prefetch 功能测试
- 检测 prefetch 请求是否正确发起
- 分析网络请求中的 prefetch 标记
- 验证 Service Worker 缓存中的资源

### 3. 缓存功能测试
- 验证资源是否被缓存到 Service Worker cache
- 测试缓存命中（通过重新加载页面）
- 分析缓存响应和缓存详情

### 4. 网络活动捕获
- 捕获所有网络请求和响应
- 记录请求方法、URL、资源类型、headers 等
- 监听请求失败事件

### 5. 控制台日志记录
- 捕获浏览器控制台日志（log, warn, error 等）
- 记录页面错误和堆栈信息
- 支持详细日志输出模式

## 使用方法

### 基本用法

```javascript
const BrowserTestRunner = require('./browser-tests');
const config = require('../test-config');

async function runBrowserTests() {
  const runner = new BrowserTestRunner(config);
  
  try {
    // 运行完整的测试套件
    const results = await runner.runTests(
      '/path/to/project',
      'http://localhost:3000',
      { name: 'my-template', framework: 'react' }
    );
    
    console.log('Test Results:', results);
    
  } catch (error) {
    console.error('Tests failed:', error);
  }
}

runBrowserTests();
```

### 单独运行测试

```javascript
const runner = new BrowserTestRunner(config);

// 初始化浏览器
await runner.initBrowser();
await runner.createPage();

// 设置捕获
runner.setupNetworkCapture();
runner.setupConsoleCapture();

// 导航到页面
await runner.page.goto('http://localhost:3000');

// 运行单个测试
await runner.testSWRegistration();
await runner.testPrefetchFunctionality();
await runner.testCacheFunctionality();

// 清理
await runner.cleanup();
```

## API 文档

### 构造函数

```javascript
new BrowserTestRunner(config, rootDir)
```

- `config`: 测试配置对象（来自 test-config.js）
- `rootDir`: 项目根目录（可选，默认为当前工作目录）

### 主要方法

#### `runTests(projectDir, url, templateConfig)`

运行完整的浏览器测试套件。

**参数:**
- `projectDir` (string): 项目目录路径
- `url` (string): 要测试的 URL
- `templateConfig` (object): 模板配置对象（可选）

**返回:** Promise<Object> - 测试结果摘要

#### `initBrowser()`

初始化 Playwright 浏览器实例。

**返回:** Promise<void>

#### `createPage()`

创建新的浏览器页面和上下文。

**返回:** Promise<void>

#### `testSWRegistration()`

测试 Service Worker 注册和激活。

**返回:** Promise<void>

#### `testPrefetchFunctionality()`

测试 Prefetch 功能是否正常工作。

**返回:** Promise<void>

#### `testCacheFunctionality()`

测试缓存功能和缓存命中。

**返回:** Promise<void>

#### `captureNetworkActivity()`

获取捕获的网络活动记录。

**返回:** Array<Object> - 网络请求列表

#### `getConsoleLogs()`

获取捕获的控制台日志。

**返回:** Array<Object> - 控制台日志列表

#### `saveScreenshot(name)`

保存当前页面截图。

**参数:**
- `name` (string): 截图名称

**返回:** Promise<void>

#### `saveLogs(name)`

保存网络活动和控制台日志到文件。

**参数:**
- `name` (string): 日志文件名称

**返回:** Promise<void>

#### `cleanup()`

清理浏览器资源（关闭页面、上下文和浏览器）。

**返回:** Promise<void>

## 测试结果格式

```javascript
{
  total: 3,           // 总测试数
  passed: 3,          // 通过数
  failed: 0,          // 失败数
  skipped: 0,         // 跳过数
  duration: 5234,     // 总执行时间（毫秒）
  timestamp: '2024-01-01T00:00:00.000Z',
  results: [
    {
      name: 'Service Worker Registration',
      status: 'pass',
      duration: 1234,
      error: null,
      logs: [...],
      metadata: {
        scope: 'http://localhost:3000/',
        state: 'activated',
        scriptURL: 'http://localhost:3000/service-worker.js'
      }
    },
    // ... 更多测试结果
  ],
  networkActivity: [...],  // 网络请求记录
  consoleLogs: [...]       // 控制台日志记录
}
```

## 配置选项

在 `test-config.js` 中配置浏览器测试选项：

```javascript
{
  browser: {
    headless: true,           // 无头模式
    slowMo: 0,                // 慢动作模式（毫秒）
    timeout: 30000,           // 测试超时时间（毫秒）
    browserType: 'chromium'   // 浏览器类型：chromium, firefox, webkit
  },
  reporting: {
    outputDir: './test-results',
    verbose: true,            // 详细日志
    saveScreenshots: true,    // 失败时保存截图
    saveConsoleLogs: true     // 保存控制台日志
  }
}
```

## 重试逻辑

Service Worker 注册和激活测试包含重试逻辑：

- **最大重试次数**: 10 次
- **重试间隔**: 1000 毫秒
- **总超时时间**: 约 10 秒

可以通过修改 `waitForSWRegistration()` 和 `waitForSWActivation()` 方法的参数来调整。

## 网络请求检测

### Prefetch 请求检测规则

系统通过以下方式识别 prefetch 请求：

1. 请求头中的 `Purpose: prefetch` 或 `Sec-Fetch-Dest: prefetch`
2. URL 参数中包含 `prefetch=true` 或 `_prefetch=1`
3. 资源类型为 `fetch` 或 `xhr` 且 URL 包含 `/api/`

### 缓存响应检测规则

系统通过以下方式识别缓存响应：

1. 响应头中的 `X-Cache: hit` 或 `X-Cache: sw`
2. HTTP 状态码 304（Not Modified）
3. 响应头中包含 `X-SW-Cache`

## 故障排除

### 浏览器启动失败

如果浏览器启动失败，确保已安装 Playwright 浏览器：

```bash
cd test-system
npm run install:playwright
```

### Service Worker 注册超时

如果 Service Worker 注册超时：

1. 检查 Service Worker 文件是否存在
2. 检查浏览器控制台是否有错误
3. 增加超时时间或重试次数
4. 确保开发服务器正在运行

### 截图保存失败

确保输出目录存在且有写入权限：

```bash
mkdir -p test-system/test-results/screenshots
```

## 示例

### 完整测试示例

```javascript
const BrowserTestRunner = require('./browser-tests');
const config = require('../test-config');

async function example() {
  const runner = new BrowserTestRunner(config);
  
  try {
    const results = await runner.runTests(
      './test-results/temp/react-cra-no-sw',
      'http://localhost:3000',
      {
        name: 'react-cra-no-sw',
        framework: 'cra'
      }
    );
    
    // 保存日志
    await runner.saveLogs('react-cra-test');
    
    // 检查结果
    if (results.failed > 0) {
      console.error('Some tests failed!');
      process.exit(1);
    }
    
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

example();
```

## 注意事项

1. **浏览器资源管理**: 始终调用 `cleanup()` 方法释放浏览器资源
2. **超时设置**: 根据网络条件和项目大小调整超时时间
3. **并发测试**: 避免同时运行多个浏览器实例（资源消耗大）
4. **Service Worker 缓存**: 测试之间可能需要清除 Service Worker 缓存
5. **端口冲突**: 确保测试 URL 的端口没有被占用

## 相关文件

- `browser-tests.js` - 主要实现文件
- `test-browser-runner.js` - 简单测试脚本
- `../test-config.js` - 配置文件
- `../api-server/index.js` - API 服务器（用于测试）
