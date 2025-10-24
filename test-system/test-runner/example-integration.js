#!/usr/bin/env node

/**
 * 集成示例：展示如何将 CLI 测试和浏览器测试结合使用
 */

const path = require('path');
const chalk = require('chalk');
const CLITestRunner = require('./cli-tests');
const BrowserTestRunner = require('./browser-tests');
const TemplateManager = require('./utils/template-manager');
const apiServer = require('../api-server');
const config = require('../test-config');

/**
 * 运行完整的集成测试流程
 */
async function runIntegrationTest() {
  console.log(chalk.bold.blue('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║  Integration Test Example              ║'));
  console.log(chalk.bold.blue('╚════════════════════════════════════════╝\n'));
  
  const templateName = 'react-cra-no-sw';
  let projectDir = null;
  let devServerProcess = null;
  
  try {
    // 1. 启动 API 服务器
    console.log(chalk.bold.cyan('\n📡 Step 1: Starting API Server\n'));
    await apiServer.start();
    console.log(chalk.green('✓ API Server started\n'));
    
    // 2. 复制测试模板
    console.log(chalk.bold.cyan('📋 Step 2: Copying Test Template\n'));
    const templateManager = new TemplateManager(config);
    projectDir = await templateManager.copyTemplate(templateName);
    console.log(chalk.green(`✓ Template copied to: ${projectDir}\n`));
    
    // 3. 运行 CLI 测试
    console.log(chalk.bold.cyan('🔧 Step 3: Running CLI Tests\n'));
    const cliRunner = new CLITestRunner(config);
    await cliRunner.testTemplate(templateName);
    console.log(chalk.green('✓ CLI tests completed\n'));
    
    // 4. 安装依赖（如果需要）
    if (!config.cli.skipInstall) {
      console.log(chalk.bold.cyan('📦 Step 4: Installing Dependencies\n'));
      console.log(chalk.yellow('⚠ This step is skipped in this example'));
      console.log(chalk.gray('  In a real scenario, dependencies would be installed here\n'));
    }
    
    // 5. 启动开发服务器
    console.log(chalk.bold.cyan('🚀 Step 5: Starting Development Server\n'));
    console.log(chalk.yellow('⚠ This step is skipped in this example'));
    console.log(chalk.gray('  In a real scenario, the dev server would be started here'));
    console.log(chalk.gray('  Example: npm start or yarn dev\n'));
    
    const devServerUrl = 'http://localhost:3000';
    
    // 6. 运行浏览器测试
    console.log(chalk.bold.cyan('🌐 Step 6: Running Browser Tests\n'));
    console.log(chalk.yellow('⚠ This step requires a running dev server'));
    console.log(chalk.gray(`  Expected URL: ${devServerUrl}`));
    console.log(chalk.gray('  Skipping browser tests in this example\n'));
    
    // 如果开发服务器正在运行，可以取消注释以下代码：
    /*
    const browserRunner = new BrowserTestRunner(config);
    const templateConfig = await templateManager.getTemplateConfig(templateName);
    
    const browserResults = await browserRunner.runTests(
      projectDir,
      devServerUrl,
      templateConfig
    );
    
    console.log(chalk.green('✓ Browser tests completed\n'));
    
    // 保存测试日志
    await browserRunner.saveLogs(templateName);
    */
    
    // 7. 清理
    console.log(chalk.bold.cyan('🧹 Step 7: Cleanup\n'));
    await templateManager.cleanup(projectDir);
    console.log(chalk.green('✓ Temporary files cleaned up\n'));
    
    // 8. 停止 API 服务器
    console.log(chalk.bold.cyan('🛑 Step 8: Stopping API Server\n'));
    await apiServer.stop();
    console.log(chalk.green('✓ API Server stopped\n'));
    
    // 完成
    console.log(chalk.bold.green('\n✅ Integration test example completed successfully!\n'));
    
    console.log(chalk.bold.blue('Next Steps:'));
    console.log(chalk.gray('  1. Install dependencies in the test project'));
    console.log(chalk.gray('  2. Start the development server'));
    console.log(chalk.gray('  3. Run browser tests against the running server'));
    console.log(chalk.gray('  4. Review test results and logs\n'));
    
  } catch (error) {
    console.error(chalk.bold.red('\n❌ Integration test failed!\n'));
    console.error(chalk.red(`Error: ${error.message}`));
    console.error(chalk.gray(error.stack));
    
    // 清理
    if (projectDir) {
      const templateManager = new TemplateManager(config);
      await templateManager.cleanup(projectDir);
    }
    
    if (apiServer.getStats().isRunning) {
      await apiServer.stop();
    }
    
    process.exit(1);
  }
}

/**
 * 展示如何单独使用浏览器测试运行器
 */
async function browserTestExample() {
  console.log(chalk.bold.blue('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║  Browser Test Runner Example          ║'));
  console.log(chalk.bold.blue('╚════════════════════════════════════════╝\n'));
  
  const browserRunner = new BrowserTestRunner(config);
  
  try {
    // 初始化浏览器
    console.log(chalk.blue('Initializing browser...'));
    await browserRunner.initBrowser();
    await browserRunner.createPage();
    
    // 设置捕获
    browserRunner.setupNetworkCapture();
    browserRunner.setupConsoleCapture();
    
    // 导航到示例页面
    console.log(chalk.blue('Navigating to example.com...'));
    await browserRunner.page.goto('https://example.com', {
      waitUntil: 'networkidle'
    });
    
    console.log(chalk.green('✓ Page loaded successfully'));
    
    // 获取网络活动
    const networkActivity = browserRunner.captureNetworkActivity();
    console.log(chalk.green(`✓ Captured ${networkActivity.length} network requests`));
    
    // 获取控制台日志
    const consoleLogs = browserRunner.getConsoleLogs();
    console.log(chalk.green(`✓ Captured ${consoleLogs.length} console logs`));
    
    // 保存截图
    console.log(chalk.blue('Saving screenshot...'));
    await browserRunner.saveScreenshot('example-page');
    console.log(chalk.green('✓ Screenshot saved'));
    
    // 清理
    await browserRunner.cleanup();
    
    console.log(chalk.bold.green('\n✅ Browser test example completed!\n'));
    
  } catch (error) {
    console.error(chalk.bold.red('\n❌ Browser test failed!\n'));
    console.error(chalk.red(`Error: ${error.message}`));
    
    await browserRunner.cleanup();
    process.exit(1);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'integration';
  
  switch (command) {
    case 'integration':
      await runIntegrationTest();
      break;
    case 'browser':
      await browserTestExample();
      break;
    case 'help':
      console.log(chalk.bold.blue('\nIntegration Test Example\n'));
      console.log('Usage: node example-integration.js [command]\n');
      console.log('Commands:');
      console.log('  integration  - Run full integration test (default)');
      console.log('  browser      - Run browser test example');
      console.log('  help         - Show this help message\n');
      break;
    default:
      console.error(chalk.red(`Unknown command: ${command}`));
      console.log('Run with "help" to see available commands');
      process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('Unexpected error:'), error);
      process.exit(1);
    });
}

module.exports = {
  runIntegrationTest,
  browserTestExample
};
