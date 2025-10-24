const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { chromium, firefox, webkit } = require('playwright');

/**
 * BrowserTestRunner - 使用 Playwright 进行浏览器自动化测试
 */
class BrowserTestRunner {
  constructor(config, rootDir = null) {
    this.config = config;
    this.rootDir = rootDir || process.cwd();
    
    // 浏览器实例
    this.browser = null;
    this.context = null;
    this.page = null;
    
    // 测试结果收集
    this.results = [];
    
    // 网络活动和日志收集
    this.networkRequests = [];
    this.consoleLogs = [];
  }

  /**
   * 运行浏览器测试套件
   * @param {string} projectDir - 项目目录
   * @param {string} url - 测试 URL
   * @param {Object} templateConfig - 模板配置（可选）
   * @returns {Promise<Object>} 测试结果
   */
  async runTests(projectDir, url, templateConfig = {}) {
    console.log(chalk.bold.blue('\n=== Starting Browser Tests ===\n'));
    console.log(chalk.blue(`Testing URL: ${url}\n`));
    
    const startTime = Date.now();
    this.results = [];
    
    try {
      // 初始化浏览器
      await this.initBrowser();
      
      // 创建新页面
      await this.createPage();
      
      // 设置网络活动捕获和日志记录
      this.setupNetworkCapture();
      this.setupConsoleCapture();
      
      // 导航到测试 URL
      console.log(chalk.blue(`Navigating to ${url}...`));
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.browser.timeout
      });
      
      console.log(chalk.green(`✓ Page loaded successfully\n`));
      
      // 运行测试
      await this.testSWRegistration();
      await this.testPrefetchFunctionality();
      await this.testCacheFunctionality();
      
      // 生成测试摘要
      const duration = Date.now() - startTime;
      const summary = this.generateSummary(duration);
      
      this.printSummary(summary);
      
      return summary;
      
    } catch (error) {
      console.error(chalk.red(`\nBrowser Tests failed: ${error.message}`));
      
      // 保存失败截图
      if (this.page && this.config.reporting.saveScreenshots) {
        await this.saveScreenshot('test-failure');
      }
      
      throw error;
      
    } finally {
      // 清理浏览器资源
      await this.cleanup();
    }
  }

  /**
   * 初始化 Playwright 浏览器
   * @returns {Promise<void>}
   */
  async initBrowser() {
    console.log(chalk.blue('Initializing browser...'));
    
    try {
      const browserType = this.config.browser.browserType || 'chromium';
      const launchOptions = {
        headless: this.config.browser.headless,
        slowMo: this.config.browser.slowMo
      };
      
      // 根据配置选择浏览器类型
      switch (browserType) {
        case 'firefox':
          this.browser = await firefox.launch(launchOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(launchOptions);
          break;
        case 'chromium':
        default:
          this.browser = await chromium.launch(launchOptions);
          break;
      }
      
      console.log(chalk.green(`✓ Browser initialized (${browserType})\n`));
      
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error.message}`);
    }
  }

  /**
   * 创建新的浏览器页面
   * @returns {Promise<void>}
   */
  async createPage() {
    try {
      // 创建浏览器上下文
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Playwright Test Runner)'
      });
      
      // 创建新页面
      this.page = await this.context.newPage();
      
      // 设置默认超时
      this.page.setDefaultTimeout(this.config.browser.timeout);
      
    } catch (error) {
      throw new Error(`Failed to create page: ${error.message}`);
    }
  }

  /**
   * 设置网络活动捕获
   * @private
   */
  setupNetworkCapture() {
    this.networkRequests = [];
    
    // 监听请求
    this.page.on('request', (request) => {
      this.networkRequests.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        headers: request.headers(),
        timestamp: Date.now()
      });
    });
    
    // 监听响应
    this.page.on('response', (response) => {
      this.networkRequests.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: Date.now()
      });
    });
    
    // 监听请求失败
    this.page.on('requestfailed', (request) => {
      this.networkRequests.push({
        type: 'request-failed',
        url: request.url(),
        failure: request.failure(),
        timestamp: Date.now()
      });
    });
  }

  /**
   * 设置控制台日志捕获
   * @private
   */
  setupConsoleCapture() {
    this.consoleLogs = [];
    
    this.page.on('console', (msg) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: Date.now()
      };
      
      this.consoleLogs.push(logEntry);
      
      // 在详细模式下输出控制台日志
      if (this.config.reporting.verbose) {
        const prefix = chalk.gray(`[Browser Console ${msg.type()}]`);
        console.log(`${prefix} ${msg.text()}`);
      }
    });
    
    // 监听页面错误
    this.page.on('pageerror', (error) => {
      this.consoleLogs.push({
        type: 'error',
        text: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      console.error(chalk.red(`[Browser Error] ${error.message}`));
    });
  }

  /**
   * 测试 Service Worker 注册
   * @returns {Promise<void>}
   */
  async testSWRegistration() {
    const testName = 'Service Worker Registration';
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing Service Worker registration...`));
    
    try {
      // 等待 Service Worker 注册
      const swRegistered = await this.waitForSWRegistration();
      
      if (!swRegistered) {
        throw new Error('Service Worker was not registered within timeout period');
      }
      
      console.log(chalk.green('✓ Service Worker registered'));
      
      // 验证 Service Worker 是否进入 activated 状态
      const swActivated = await this.waitForSWActivation();
      
      if (!swActivated) {
        throw new Error('Service Worker did not reach activated state within timeout period');
      }
      
      console.log(chalk.green('✓ Service Worker activated'));
      
      // 获取 Service Worker 详细信息
      const swInfo = await this.getSWInfo();
      
      const duration = Date.now() - startTime;
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs: [
          'Service Worker registered successfully',
          'Service Worker activated successfully',
          `SW State: ${swInfo.state}`,
          `SW Scope: ${swInfo.scope}`
        ],
        metadata: swInfo
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ Service Worker registration failed: ${error.message}`));
      
      // 保存失败截图
      if (this.config.reporting.saveScreenshots) {
        await this.saveScreenshot('sw-registration-failure');
      }
      
      this.addResult({
        name: testName,
        status: 'fail',
        duration,
        error,
        logs: [error.message, error.stack]
      });
      
      throw error;
    }
  }

  /**
   * 等待 Service Worker 注册（带重试逻辑）
   * @param {number} maxRetries - 最大重试次数
   * @param {number} retryInterval - 重试间隔（毫秒）
   * @returns {Promise<boolean>}
   */
  async waitForSWRegistration(maxRetries = 10, retryInterval = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const hasRegistration = await this.page.evaluate(() => {
          return navigator.serviceWorker.getRegistration()
            .then(reg => reg !== undefined && reg !== null);
        });
        
        if (hasRegistration) {
          return true;
        }
        
        // 等待后重试
        await this.page.waitForTimeout(retryInterval);
        
      } catch (error) {
        // 继续重试
      }
    }
    
    return false;
  }

  /**
   * 等待 Service Worker 激活（带重试逻辑）
   * @param {number} maxRetries - 最大重试次数
   * @param {number} retryInterval - 重试间隔（毫秒）
   * @returns {Promise<boolean>}
   */
  async waitForSWActivation(maxRetries = 10, retryInterval = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const isActivated = await this.page.evaluate(() => {
          return navigator.serviceWorker.getRegistration()
            .then(reg => {
              if (!reg) return false;
              return reg.active !== null && reg.active.state === 'activated';
            });
        });
        
        if (isActivated) {
          return true;
        }
        
        // 等待后重试
        await this.page.waitForTimeout(retryInterval);
        
      } catch (error) {
        // 继续重试
      }
    }
    
    return false;
  }

  /**
   * 获取 Service Worker 信息
   * @returns {Promise<Object>}
   */
  async getSWInfo() {
    try {
      return await this.page.evaluate(() => {
        return navigator.serviceWorker.getRegistration()
          .then(reg => {
            if (!reg) return null;
            
            return {
              scope: reg.scope,
              state: reg.active ? reg.active.state : 'unknown',
              scriptURL: reg.active ? reg.active.scriptURL : null,
              updateViaCache: reg.updateViaCache,
              installing: reg.installing !== null,
              waiting: reg.waiting !== null,
              active: reg.active !== null
            };
          });
      });
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  /**
   * 测试 Prefetch 功能
   * @returns {Promise<void>}
   */
  async testPrefetchFunctionality() {
    const testName = 'Prefetch Functionality';
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing Prefetch functionality...`));
    
    try {
      // 清空之前的网络请求记录
      const previousRequestCount = this.networkRequests.length;
      
      // 触发 prefetch（通过页面交互或等待自动 prefetch）
      // 等待一段时间让 prefetch 发生
      await this.page.waitForTimeout(2000);
      
      // 分析网络请求，查找 prefetch 请求
      const newRequests = this.networkRequests.slice(previousRequestCount);
      const prefetchRequests = this.findPrefetchRequests(newRequests);
      
      if (prefetchRequests.length === 0) {
        // 尝试通过检查 Service Worker 缓存来验证
        const hasCachedResources = await this.checkSWCache();
        
        if (!hasCachedResources) {
          throw new Error('No prefetch requests detected and no cached resources found');
        }
        
        console.log(chalk.yellow('⚠ No explicit prefetch requests detected, but resources are cached'));
      } else {
        console.log(chalk.green(`✓ Detected ${prefetchRequests.length} prefetch request(s)`));
      }
      
      const duration = Date.now() - startTime;
      
      const logs = [
        `Total new requests: ${newRequests.length}`,
        `Prefetch requests: ${prefetchRequests.length}`
      ];
      
      // 添加 prefetch 请求详情
      prefetchRequests.forEach((req, index) => {
        logs.push(`  ${index + 1}. ${req.url}`);
      });
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs,
        metadata: {
          prefetchRequestCount: prefetchRequests.length,
          prefetchRequests: prefetchRequests.map(r => ({
            url: r.url,
            method: r.method,
            resourceType: r.resourceType
          }))
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ Prefetch functionality test failed: ${error.message}`));
      
      // 保存失败截图
      if (this.config.reporting.saveScreenshots) {
        await this.saveScreenshot('prefetch-failure');
      }
      
      this.addResult({
        name: testName,
        status: 'fail',
        duration,
        error,
        logs: [error.message, error.stack]
      });
      
      throw error;
    }
  }

  /**
   * 查找 prefetch 请求
   * @param {Array} requests - 请求列表
   * @returns {Array} Prefetch 请求列表
   */
  findPrefetchRequests(requests) {
    return requests.filter(req => {
      if (req.type !== 'request') return false;
      
      // 检查请求头中的 prefetch 标记
      const headers = req.headers || {};
      const purpose = headers['purpose'] || headers['Purpose'] || '';
      const secFetchDest = headers['sec-fetch-dest'] || headers['Sec-Fetch-Dest'] || '';
      
      // 检查是否为 prefetch 请求
      if (purpose.toLowerCase().includes('prefetch')) return true;
      if (secFetchDest.toLowerCase().includes('prefetch')) return true;
      
      // 检查 URL 中是否包含 prefetch 参数
      if (req.url.includes('prefetch=true') || req.url.includes('_prefetch=1')) return true;
      
      // 检查资源类型（API 请求通常是 fetch 或 xhr）
      if (req.resourceType === 'fetch' || req.resourceType === 'xhr') {
        // 检查 URL 是否指向 API 端点
        if (req.url.includes('/api/')) return true;
      }
      
      return false;
    });
  }

  /**
   * 检查 Service Worker 缓存
   * @returns {Promise<boolean>}
   */
  async checkSWCache() {
    try {
      const cacheInfo = await this.page.evaluate(async () => {
        const cacheNames = await caches.keys();
        let totalCachedItems = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalCachedItems += keys.length;
        }
        
        return {
          cacheNames,
          totalCachedItems
        };
      });
      
      return cacheInfo.totalCachedItems > 0;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * 测试缓存功能
   * @returns {Promise<void>}
   */
  async testCacheFunctionality() {
    const testName = 'Cache Functionality';
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing cache functionality...`));
    
    try {
      // 获取当前缓存状态
      const cacheInfo = await this.getCacheInfo();
      
      if (!cacheInfo || cacheInfo.cacheNames.length === 0) {
        throw new Error('No Service Worker caches found');
      }
      
      console.log(chalk.green(`✓ Found ${cacheInfo.cacheNames.length} cache(s)`));
      console.log(chalk.gray(`  Total cached items: ${cacheInfo.totalCachedItems}`));
      
      // 验证资源是否被缓存
      if (cacheInfo.totalCachedItems === 0) {
        throw new Error('No resources cached in Service Worker');
      }
      
      // 测试缓存命中：重新加载页面并检查是否使用缓存
      console.log(chalk.blue('Testing cache hit by reloading page...'));
      
      const beforeReloadRequests = this.networkRequests.length;
      
      // 重新加载页面
      await this.page.reload({
        waitUntil: 'networkidle',
        timeout: this.config.browser.timeout
      });
      
      console.log(chalk.green('✓ Page reloaded'));
      
      // 分析重新加载后的请求
      const afterReloadRequests = this.networkRequests.slice(beforeReloadRequests);
      const cachedResponses = this.findCachedResponses(afterReloadRequests);
      
      console.log(chalk.green(`✓ Detected ${cachedResponses.length} cached response(s)`));
      
      const duration = Date.now() - startTime;
      
      const logs = [
        `Cache names: ${cacheInfo.cacheNames.join(', ')}`,
        `Total cached items: ${cacheInfo.totalCachedItems}`,
        `Requests after reload: ${afterReloadRequests.length}`,
        `Cached responses: ${cachedResponses.length}`
      ];
      
      // 添加缓存详情
      cacheInfo.cacheDetails.forEach((cache, index) => {
        logs.push(`  Cache ${index + 1}: ${cache.name} (${cache.items.length} items)`);
        cache.items.slice(0, 5).forEach(item => {
          logs.push(`    - ${item}`);
        });
        if (cache.items.length > 5) {
          logs.push(`    ... and ${cache.items.length - 5} more`);
        }
      });
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs,
        metadata: {
          cacheCount: cacheInfo.cacheNames.length,
          totalCachedItems: cacheInfo.totalCachedItems,
          cachedResponseCount: cachedResponses.length,
          cacheNames: cacheInfo.cacheNames
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ Cache functionality test failed: ${error.message}`));
      
      // 保存失败截图
      if (this.config.reporting.saveScreenshots) {
        await this.saveScreenshot('cache-failure');
      }
      
      this.addResult({
        name: testName,
        status: 'fail',
        duration,
        error,
        logs: [error.message, error.stack]
      });
      
      throw error;
    }
  }

  /**
   * 获取缓存信息
   * @returns {Promise<Object>}
   */
  async getCacheInfo() {
    try {
      return await this.page.evaluate(async () => {
        const cacheNames = await caches.keys();
        const cacheDetails = [];
        let totalCachedItems = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          const items = keys.map(req => req.url);
          
          cacheDetails.push({
            name: cacheName,
            items
          });
          
          totalCachedItems += items.length;
        }
        
        return {
          cacheNames,
          cacheDetails,
          totalCachedItems
        };
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * 查找缓存响应
   * @param {Array} requests - 请求列表
   * @returns {Array} 缓存响应列表
   */
  findCachedResponses(requests) {
    const responses = requests.filter(req => req.type === 'response');
    
    return responses.filter(res => {
      // 检查响应头中的缓存标记
      const headers = res.headers || {};
      const xCache = headers['x-cache'] || headers['X-Cache'] || '';
      
      // 检查是否从 Service Worker 返回
      if (xCache.toLowerCase().includes('hit')) return true;
      if (xCache.toLowerCase().includes('sw')) return true;
      
      // 检查状态码（304 表示使用缓存）
      if (res.status === 304) return true;
      
      // 检查是否有 Service Worker 相关的响应头
      const swHeader = headers['x-sw-cache'] || headers['X-SW-Cache'];
      if (swHeader) return true;
      
      return false;
    });
  }

  /**
   * 捕获网络活动
   * @returns {Array} 网络请求列表
   */
  captureNetworkActivity() {
    return [...this.networkRequests];
  }

  /**
   * 获取控制台日志
   * @returns {Array} 控制台日志列表
   */
  getConsoleLogs() {
    return [...this.consoleLogs];
  }

  /**
   * 保存截图
   * @param {string} name - 截图名称
   * @returns {Promise<void>}
   */
  async saveScreenshot(name) {
    if (!this.page) return;
    
    try {
      const screenshotDir = path.join(
        this.rootDir,
        this.config.reporting.outputDir,
        'screenshots'
      );
      
      await fs.ensureDir(screenshotDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.png`;
      const filepath = path.join(screenshotDir, filename);
      
      await this.page.screenshot({
        path: filepath,
        fullPage: true
      });
      
      console.log(chalk.gray(`Screenshot saved: ${filepath}`));
      
    } catch (error) {
      console.error(chalk.red(`Failed to save screenshot: ${error.message}`));
    }
  }

  /**
   * 保存日志
   * @param {string} name - 日志名称
   * @returns {Promise<void>}
   */
  async saveLogs(name) {
    try {
      const logsDir = path.join(
        this.rootDir,
        this.config.reporting.outputDir,
        'logs'
      );
      
      await fs.ensureDir(logsDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // 保存控制台日志
      if (this.config.reporting.saveConsoleLogs && this.consoleLogs.length > 0) {
        const consoleLogFile = path.join(logsDir, `${name}-console-${timestamp}.json`);
        await fs.writeJson(consoleLogFile, this.consoleLogs, { spaces: 2 });
        console.log(chalk.gray(`Console logs saved: ${consoleLogFile}`));
      }
      
      // 保存网络活动日志
      if (this.networkRequests.length > 0) {
        const networkLogFile = path.join(logsDir, `${name}-network-${timestamp}.json`);
        await fs.writeJson(networkLogFile, this.networkRequests, { spaces: 2 });
        console.log(chalk.gray(`Network logs saved: ${networkLogFile}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`Failed to save logs: ${error.message}`));
    }
  }

  /**
   * 清理浏览器资源
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log(chalk.gray('\nBrowser resources cleaned up'));
      
    } catch (error) {
      console.error(chalk.red(`Error during cleanup: ${error.message}`));
    }
  }

  /**
   * 添加测试结果
   * @param {Object} result - 测试结果
   */
  addResult(result) {
    this.results.push({
      name: result.name,
      status: result.status || 'pass',
      duration: result.duration || 0,
      error: result.error || null,
      logs: result.logs || [],
      metadata: result.metadata || {}
    });
  }

  /**
   * 生成测试摘要
   * @param {number} totalDuration - 总执行时间
   * @returns {Object} 测试摘要
   */
  generateSummary(totalDuration) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    
    return {
      total,
      passed,
      failed,
      skipped,
      duration: totalDuration,
      timestamp: new Date().toISOString(),
      results: this.results,
      networkActivity: this.captureNetworkActivity(),
      consoleLogs: this.getConsoleLogs()
    };
  }

  /**
   * 打印测试摘要
   * @param {Object} summary - 测试摘要
   */
  printSummary(summary) {
    console.log(chalk.bold.blue('\n=== Browser Test Summary ===\n'));
    console.log(`Total Tests:  ${summary.total}`);
    console.log(chalk.green(`Passed:       ${summary.passed}`));
    console.log(chalk.red(`Failed:       ${summary.failed}`));
    console.log(chalk.yellow(`Skipped:      ${summary.skipped}`));
    console.log(`Duration:     ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`Timestamp:    ${summary.timestamp}`);
    console.log(`Network Reqs: ${summary.networkActivity.length}`);
    console.log(`Console Logs: ${summary.consoleLogs.length}\n`);
    
    // 显示失败的测试
    if (summary.failed > 0) {
      console.log(chalk.bold.red('Failed Tests:\n'));
      summary.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(chalk.red(`  ✗ ${result.name}`));
          if (result.error) {
            console.log(chalk.gray(`    ${result.error.message}`));
          }
        });
      console.log();
    }
  }

  /**
   * 获取测试结果
   * @returns {Array<Object>} 测试结果数组
   */
  getResults() {
    return this.results;
  }
}

module.exports = BrowserTestRunner;
