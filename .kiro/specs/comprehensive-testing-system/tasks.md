 # Implementation Plan

- [x] 1. 设置测试系统项目结构和配置
  - 创建 test-system 目录结构
  - 创建 package.json 并添加必要的依赖（playwright, express, fs-extra, chalk, execa）
  - 创建配置文件 test-config.js
  - 创建 .gitignore 文件
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. 创建测试项目模板
  - [x] 2.1 创建 React CRA 无 SW 模板
    - 创建基础 React CRA 项目结构
    - 添加简单的组件和路由
    - 配置 package.json
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 创建 React CRA 有 SW 模板
    - 复制无 SW 模板
    - 添加基础 Service Worker 文件
    - 添加 SW 注册代码
    - _Requirements: 1.1, 1.3_

  - [x] 2.3 创建 React CRA 有 Workbox 模板
    - 复制无 SW 模板
    - 添加 Workbox 配置
    - 配置 Workbox Service Worker
    - _Requirements: 1.1, 1.4_

  - [x] 2.4 创建 React CRA 已集成 Prefetch 模板
    - 复制无 SW 模板
    - 集成 prefetch 包
    - 配置 prefetch Service Worker
    - 添加 prefetch 初始化代码
    - _Requirements: 1.1, 1.5_

  - [x] 2.5 创建 Next.js 测试模板
    - 创建 Next.js 无 SW 模板
    - 创建 Next.js 有 SW 模板
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.6 创建 Vue 3 和 React Vite 模板
    - 创建 Vue 3 Vite 无 SW 模板
    - 创建 React Vite 无 SW 模板
    - _Requirements: 1.1, 1.2_

- [x] 3. 实现 API 服务器
  - [x] 3.1 创建 Express 服务器基础结构
    - 创建 api-server/index.js
    - 配置 Express 应用
    - 添加基础中间件（body-parser, cors）
    - 实现服务器启动和停止方法
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 3.2 实现 API 路由
    - 创建 products 路由（GET, POST, PUT, DELETE）
    - 创建 users 路由（GET）
    - 创建 health 检查路由
    - 添加模拟数据
    - _Requirements: 2.1, 2.3_

  - [x] 3.3 实现请求日志和延迟模拟
    - 创建日志中间件记录所有请求
    - 添加可配置的响应延迟
    - 实现获取请求日志的方法
    - _Requirements: 2.3, 2.4_

- [x] 4. 实现模板管理器
  - [x] 4.1 创建 TemplateManager 类
    - 实现 copyTemplate 方法（复制模板到临时目录）
    - 实现 cleanup 方法（清理临时目录）
    - 实现 getAvailableTemplates 方法
    - 添加模板配置读取功能
    - _Requirements: 3.1, 3.8_

  - [x] 4.2 为每个模板创建配置文件
    - 在每个模板目录创建 template-config.json
    - 定义框架类型、SW 状态、入口文件等信息
    - _Requirements: 1.1_

- [x] 5. 实现 CLI 测试运行器
  - [x] 5.1 创建 CLITestRunner 类基础结构
    - 创建 test-runner/cli-tests.js
    - 实现 runTests 主方法
    - 创建测试结果收集机制
    - _Requirements: 3.2_

  - [x] 5.2 实现框架检测测试
    - 实现 testFrameworkDetection 方法
    - 执行 CLI 工具并捕获输出
    - 验证检测到的框架类型是否正确
    - _Requirements: 3.3_

  - [x] 5.3 实现 Service Worker 检测测试
    - 实现 testSWDetection 方法
    - 验证 CLI 工具是否正确检测现有 SW
    - 验证 Workbox 检测
    - _Requirements: 3.4_

  - [x] 5.4 实现文件生成测试
    - 实现 testFileGeneration 方法
    - 验证 Service Worker 文件是否正确生成或更新
    - 验证入口文件是否正确注入初始化代码
    - _Requirements: 3.5, 3.7_

  - [x] 5.5 实现依赖安装测试
    - 实现 testDependencyInstallation 方法
    - 验证 package.json 是否正确更新
    - 验证依赖是否可以成功安装
    - _Requirements: 3.6_

- [x] 6. 实现浏览器测试运行器
  - [x] 6.1 创建 BrowserTestRunner 类基础结构
    - 创建 test-runner/browser-tests.js
    - 初始化 Playwright 浏览器
    - 实现 runTests 主方法
    - 实现浏览器和页面的生命周期管理
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 实现 Service Worker 注册测试
    - 实现 testSWRegistration 方法
    - 验证 SW 是否成功注册
    - 验证 SW 是否进入 activated 状态
    - 添加超时和重试逻辑
    - _Requirements: 4.3, 4.4_

  - [x] 6.3 实现 Prefetch 功能测试
    - 实现 testPrefetchFunctionality 方法
    - 验证 prefetch 请求是否正确发起
    - 检查网络请求中的 prefetch 标记
    - _Requirements: 4.5_

  - [x] 6.4 实现缓存功能测试
    - 实现 testCacheFunctionality 方法
    - 验证资源是否被缓存到 SW cache
    - 验证后续请求是否使用缓存
    - _Requirements: 4.6, 4.7_

  - [x] 6.5 实现网络活动捕获和日志记录
    - 实现 captureNetworkActivity 方法
    - 捕获所有网络请求和响应
    - 记录控制台日志
    - _Requirements: 4.8_

- [ ] 7. 实现测试报告器
  - [ ] 7.1 创建 TestReporter 类
    - 创建 test-runner/reporters/console-reporter.js
    - 实现实时控制台输出
    - 使用 chalk 美化输出
    - _Requirements: 6.1_

  - [ ] 7.2 实现测试报告生成
    - 实现 generateReport 方法
    - 生成测试摘要（总数、通过、失败）
    - 生成详细的测试结果报告
    - _Requirements: 6.2_

  - [ ] 7.3 实现日志和截图保存
    - 实现 saveLogs 方法
    - 实现 saveScreenshot 方法
    - 在测试失败时自动保存截图
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 7.4 实现 JSON 报告生成
    - 创建 test-runner/reporters/json-reporter.js
    - 实现 generateJSONReport 方法
    - 保存机器可读的测试结果
    - _Requirements: 6.6_

- [ ] 8. 实现主测试入口和编排
  - [ ] 8.1 创建主测试入口文件
    - 创建 test-runner/index.js
    - 实现测试流程编排
    - 启动 API 服务器
    - 遍历所有模板执行测试
    - _Requirements: 3.1, 3.2_

  - [ ] 8.2 实现测试流程控制
    - 实现模板复制 → CLI 测试 → 浏览器测试的流程
    - 添加错误处理和清理逻辑
    - 实现测试超时控制
    - _Requirements: 3.8, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.3 添加命令行参数支持
    - 支持指定要测试的模板
    - 支持跳过依赖安装
    - 支持 headless/headed 模式切换
    - 支持详细日志级别控制
    - _Requirements: 6.1_

- [ ] 9. 创建工具函数和辅助模块
  - [ ] 9.1 创建进程运行器
    - 创建 test-runner/utils/process-runner.js
    - 封装 execa 执行 CLI 命令
    - 实现超时和错误处理
    - _Requirements: 3.2_

  - [ ] 9.2 创建文件检查器
    - 创建 test-runner/utils/file-checker.js
    - 实现文件存在性检查
    - 实现文件内容验证
    - _Requirements: 3.5, 3.6, 3.7_

  - [ ] 9.3 创建开发服务器管理器
    - 创建 test-runner/utils/dev-server.js
    - 实现启动和停止开发服务器
    - 实现端口可用性检查
    - 等待服务器就绪
    - _Requirements: 4.2_

- [ ] 10. 集成和端到端测试
  - [ ] 10.1 测试完整的测试流程
    - 运行完整的测试套件
    - 验证所有模板都能正确测试
    - 验证测试报告生成正确
    - _Requirements: 所有需求_

  - [ ] 10.2 优化和调试
    - 修复发现的问题
    - 优化测试执行速度
    - 改进错误消息和日志
    - _Requirements: 6.5_

- [ ] 11. 文档和示例
  - [ ] 11.1 创建 README 文档
    - 说明测试系统的用途和架构
    - 提供安装和使用说明
    - 添加配置选项说明
    - _Requirements: 6.1, 6.2_

  - [ ] 11.2 添加使用示例
    - 提供运行测试的示例命令
    - 展示测试报告示例
    - 说明如何添加新的测试模板
    - _Requirements: 6.1_
