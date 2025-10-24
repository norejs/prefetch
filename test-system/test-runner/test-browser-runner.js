#!/usr/bin/env node

/**
 * 简单的测试脚本，用于验证 BrowserTestRunner 的基本功能
 */

const BrowserTestRunner = require('./browser-tests');
const config = require('../test-config');

async function testBrowserRunner() {
  console.log('Testing BrowserTestRunner initialization...\n');
  
  try {
    // 创建 BrowserTestRunner 实例
    const runner = new BrowserTestRunner(config);
    console.log('✓ BrowserTestRunner instance created');
    
    // 测试浏览器初始化
    console.log('\nTesting browser initialization...');
    await runner.initBrowser();
    console.log('✓ Browser initialized successfully');
    
    // 测试页面创建
    console.log('\nTesting page creation...');
    await runner.createPage();
    console.log('✓ Page created successfully');
    
    // 测试网络捕获设置
    console.log('\nTesting network capture setup...');
    runner.setupNetworkCapture();
    console.log('✓ Network capture setup complete');
    
    // 测试控制台捕获设置
    console.log('\nTesting console capture setup...');
    runner.setupConsoleCapture();
    console.log('✓ Console capture setup complete');
    
    // 测试导航到一个简单的页面
    console.log('\nTesting page navigation...');
    await runner.page.goto('https://example.com', { waitUntil: 'networkidle' });
    console.log('✓ Page navigation successful');
    
    // 获取网络活动
    const networkActivity = runner.captureNetworkActivity();
    console.log(`✓ Captured ${networkActivity.length} network requests`);
    
    // 获取控制台日志
    const consoleLogs = runner.getConsoleLogs();
    console.log(`✓ Captured ${consoleLogs.length} console logs`);
    
    // 清理
    console.log('\nCleaning up...');
    await runner.cleanup();
    console.log('✓ Cleanup complete');
    
    console.log('\n✅ All basic tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testBrowserRunner()
    .then(() => {
      console.log('Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testBrowserRunner;
