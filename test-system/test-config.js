// 测试系统配置文件
module.exports = {
  // API 服务器配置
  apiServer: {
    port: 3001,
    host: 'localhost',
    // 模拟网络延迟（毫秒）
    responseDelay: 0
  },

  // 浏览器测试配置
  browser: {
    // 是否使用无头模式
    headless: true,
    // 慢动作模式（毫秒），用于调试
    slowMo: 0,
    // 测试超时时间（毫秒）
    timeout: 30000,
    // 浏览器类型：chromium, firefox, webkit
    browserType: 'chromium'
  },

  // CLI 工具测试配置
  cli: {
    // CLI 执行超时时间（毫秒）
    timeout: 60000,
    // 依赖安装超时时间（毫秒）
    installTimeout: 120000,
    // 开发时可设为 true 跳过依赖安装
    skipInstall: false,
    // CLI 工具路径（相对于 test-system 目录）
    // 使用 workspace 中的 prefetch 包
    cliPath: '../packages/prefetch/bin/prefetch-migrate.js'
  },

  // 模板配置
  templates: {
    // 模板基础目录
    baseDir: './templates',
    // 临时测试目录（运行完成后保留，用于调试）
    tempDir: '../test-apps'
  },

  // 测试报告配置
  reporting: {
    // 输出目录
    outputDir: './test-results',
    // 详细日志
    verbose: true,
    // 失败时保存截图
    saveScreenshots: true,
    // 保存控制台日志
    saveConsoleLogs: true
  },

  // 开发服务器配置
  devServer: {
    // 等待服务器就绪的超时时间（毫秒）
    startTimeout: 60000,
    // 检查服务器就绪的间隔（毫秒）
    checkInterval: 1000,
    // 默认端口范围
    portRange: {
      start: 3000,
      end: 3100
    }
  }
};
