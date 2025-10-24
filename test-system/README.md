# Prefetch 综合自动化测试系统

这是一个用于测试 prefetch CLI 迁移工具和 Service Worker 功能的综合自动化测试系统。

## 项目结构

```
test-system/
├── package.json              # 项目依赖配置
├── test-config.js            # 测试系统配置
├── .gitignore               # Git 忽略文件
├── README.md                # 项目说明文档
├── templates/               # 测试项目模板
│   ├── react-cra-no-sw/
│   ├── react-cra-with-sw/
│   ├── react-cra-with-workbox/
│   ├── react-cra-with-prefetch/
│   ├── nextjs-no-sw/
│   ├── nextjs-with-sw/
│   ├── vue3-vite-no-sw/
│   └── react-vite-no-sw/
├── api-server/              # 后端 API 服务器
│   ├── index.js
│   ├── routes/
│   │   ├── products.js
│   │   └── users.js
│   └── middleware/
│       ├── cors.js
│       └── logger.js
├── test-runner/             # 测试运行器
│   ├── index.js             # 主入口
│   ├── cli-tests.js         # CLI 工具测试
│   ├── browser-tests.js     # 浏览器自动化测试
│   ├── utils/
│   │   ├── template-manager.js
│   │   ├── process-runner.js
│   │   ├── file-checker.js
│   │   └── dev-server.js
│   └── reporters/
│       ├── console-reporter.js
│       └── json-reporter.js
└── test-results/            # 测试结果输出
    ├── logs/
    ├── screenshots/
    ├── reports/
    └── temp/
```

## 安装

```bash
cd test-system
npm install
npm run install:playwright
```

## 使用

### 运行完整测试套件

```bash
npm test
```

### 只运行 CLI 测试

```bash
npm run test:cli
```

### 只运行浏览器测试

```bash
npm run test:browser
```

### 启动 API 服务器（用于开发调试）

```bash
npm run api:start
```

## 配置

编辑 `test-config.js` 文件来自定义测试配置：

- **apiServer**: API 服务器端口和延迟设置
- **browser**: 浏览器测试配置（headless、超时等）
- **cli**: CLI 工具测试配置
- **templates**: 模板目录配置
- **reporting**: 测试报告配置

## 测试模板

测试系统包含多个测试项目模板，涵盖不同框架和配置：

- **React CRA**: 无 SW、有 SW、有 Workbox、已集成 Prefetch
- **Next.js**: 无 SW、有 SW
- **Vue 3 (Vite)**: 无 SW
- **React (Vite)**: 无 SW

## 测试流程

1. 启动 API 服务器
2. 遍历所有测试模板
3. 复制模板到临时目录
4. 运行 CLI 工具进行迁移
5. 验证 CLI 输出和生成的文件
6. 安装依赖并启动开发服务器
7. 运行浏览器自动化测试
8. 验证 Service Worker 注册和 Prefetch 功能
9. 清理临时文件
10. 生成测试报告

## 测试报告

测试完成后，会在 `test-results/` 目录生成：

- **reports/**: HTML 和 JSON 格式的测试报告
- **logs/**: 详细的测试日志
- **screenshots/**: 失败测试的截图

## 开发

### 添加新的测试模板

1. 在 `templates/` 目录创建新的项目模板
2. 添加 `template-config.json` 配置文件
3. 运行测试验证

### 调试测试

设置 `test-config.js` 中的以下选项：

```javascript
browser: {
  headless: false,  // 显示浏览器窗口
  slowMo: 100       // 减慢操作速度
},
cli: {
  skipInstall: true // 跳过依赖安装（开发时）
}
```

## 许可证

MIT
