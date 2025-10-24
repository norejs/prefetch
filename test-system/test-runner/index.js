#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const config = require('../test-config');
const APIServer = require('../api-server');
const CLITestRunner = require('./cli-tests');
const BrowserTestRunner = require('./browser-tests');
const TemplateManager = require('./utils/template-manager');
const { ConsoleReporter, JSONReporter } = require('./reporters');

/**
 * MainTestRunner - 主测试入口和编排
 */
class MainTestRunner {
  constructor(options = {}) {
    // 合并配置
    this.config = this._mergeConfig(config, options);

    // 获取项目根目录（test-system 目录）
    this.rootDir = path.resolve(__dirname, '..');

    // 初始化组件
    this.apiServer = APIServer;
    this.templateManager = new TemplateManager(this.config, this.rootDir);
    this.consoleReporter = new ConsoleReporter({ verbose: this.config.reporting.verbose });
    this.jsonReporter = new JSONReporter({
      outputDir: path.resolve(this.rootDir, this.config.reporting.outputDir),
      verbose: this.config.reporting.verbose
    });

    // 测试结果收集
    this.allResults = {
      cli: null,
      browser: {}
    };

    // 测试统计
    this.stats = {
      totalTemplates: 0,
      completedTemplates: 0,
      failedTemplates: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * 合并配置
   * @param {Object} baseConfig - 基础配置
   * @param {Object} options - 命令行选项
   * @returns {Object} 合并后的配置
   */
  _mergeConfig(baseConfig, options) {
    const merged = JSON.parse(JSON.stringify(baseConfig)); // 深拷贝

    // 应用命令行选项
    if (options.headless !== undefined) {
      merged.browser.headless = options.headless;
    }

    if (options.skipInstall !== undefined) {
      merged.cli.skipInstall = options.skipInstall;
    }

    if (options.skipBrowserTests !== undefined) {
      merged.skipBrowserTests = options.skipBrowserTests;
    }

    if (options.verbose !== undefined) {
      merged.reporting.verbose = options.verbose;
    }

    if (options.logLevel !== undefined) {
      merged.reporting.logLevel = options.logLevel;
    }

    if (options.timeout !== undefined) {
      merged.browser.timeout = options.timeout;
      merged.cli.timeout = options.timeout;
    }

    if (options.templateTimeout !== undefined) {
      merged.templateTimeout = options.templateTimeout;
    }

    if (options.stopOnFailure !== undefined) {
      merged.stopOnFailure = options.stopOnFailure;
    }

    return merged;
  }

  /**
   * 运行完整的测试套件
   * @param {Array<string>} templates - 要测试的模板列表（可选）
   * @returns {Promise<Object>} 测试结果
   */
  async run(templates = null) {
    this.stats.startTime = Date.now();

    try {
      // 打印测试配置
      this._printConfiguration();

      // 1. 启动 API 服务器
      await this._startAPIServer();

      // 2. 获取要测试的模板列表
      const templatesToTest = await this._getTemplatesToTest(templates);
      this.stats.totalTemplates = templatesToTest.length;

      if (templatesToTest.length === 0) {
        throw new Error('No templates found to test');
      }

      this.consoleReporter.info(`Found ${templatesToTest.length} template(s) to test`);
      this.consoleReporter.separator();

      // 3. 遍历所有模板执行测试
      for (const templateName of templatesToTest) {
        try {
          await this._testTemplate(templateName);
          this.stats.completedTemplates++;
        } catch (error) {
          this.consoleReporter.error(`Template "${templateName}" failed: ${error.message}`);
          this.stats.failedTemplates++;

          // 继续测试其他模板
          if (!this.config.stopOnFailure) {
            continue;
          } else {
            throw error;
          }
        }
      }

      // 4. 生成最终报告
      await this._generateFinalReport();

      // 5. 停止 API 服务器
      await this._stopAPIServer();

      this.stats.endTime = Date.now();

      // 6. 打印最终统计
      this._printFinalStats();

      // 返回测试结果
      return this._buildFinalResults();

    } catch (error) {
      this.consoleReporter.error(`Test suite failed: ${error.message}`);

      // 确保清理资源
      await this._cleanup();

      throw error;
    }
  }

  /**
   * 测试单个模板（带超时控制和错误处理）
   * @param {string} templateName - 模板名称
   * @returns {Promise<void>}
   */
  async _testTemplate(templateName) {
    this.consoleReporter.onSuiteStart(`Testing Template: ${templateName}`);

    let projectDir = null;
    let devServerProcess = null;
    const templateStartTime = Date.now();

    try {
      // 使用超时包装整个模板测试流程
      await this._withTimeout(
        this._executeTemplateTests(templateName, (dir, server) => {
          projectDir = dir;
          devServerProcess = server;
        }),
        this.config.templateTimeout || 300000, // 默认 5 分钟超时
        `Template "${templateName}" test timed out`
      );

      const duration = Date.now() - templateStartTime;
      this.consoleReporter.success(`Template "${templateName}" completed successfully in ${(duration / 1000).toFixed(2)}s`);

    } catch (error) {
      const duration = Date.now() - templateStartTime;
      this.consoleReporter.error(`Template "${templateName}" failed after ${(duration / 1000).toFixed(2)}s: ${error.message}`);

      // 记录失败详情
      this._recordTemplateFailure(templateName, error);

      throw error;

    } finally {
      // 确保清理资源（即使发生错误）
      await this._cleanupTemplateResources(devServerProcess, projectDir, templateName);
    }
  }

  /**
   * 执行模板测试流程
   * @param {string} templateName - 模板名称
   * @param {Function} resourceCallback - 资源回调函数
   * @returns {Promise<void>}
   */
  async _executeTemplateTests(templateName, resourceCallback) {
    let projectDir = null;
    let devServerProcess = null;

    try {
      // 1. 复制模板到临时目录
      this.consoleReporter.info(`Step 1/5: Copying template "${templateName}"...`);
      projectDir = await this._withTimeout(
        this.templateManager.copyTemplate(templateName),
        30000,
        'Template copy timed out'
      );
      resourceCallback(projectDir, null);

      // 2. 读取模板配置
      this.consoleReporter.info('Step 2/5: Reading template configuration...');
      const templateConfig = await this.templateManager.getTemplateConfig(templateName);

      // 3. 运行 CLI 测试
      this.consoleReporter.info('Step 3/5: Running CLI tests...');
      const cliRunner = new CLITestRunner(this.config, this.rootDir);
      const cliResults = await this._withTimeout(
        cliRunner.runTests([templateName]),
        this.config.cli.timeout + 10000, // CLI 超时 + 缓冲时间
        'CLI tests timed out'
      );

      // 保存 CLI 测试结果
      if (!this.allResults.cli) {
        this.allResults.cli = cliResults;
      } else {
        // 合并多个模板的 CLI 结果
        this.allResults.cli.results.push(...cliResults.results);
        this.allResults.cli.total += cliResults.total;
        this.allResults.cli.passed += cliResults.passed;
        this.allResults.cli.failed += cliResults.failed;
        this.allResults.cli.skipped += cliResults.skipped || 0;
      }

      // 如果 CLI 测试失败，跳过浏览器测试
      if (cliResults.failed > 0) {
        this.consoleReporter.warn('CLI tests failed, skipping browser tests');
        return;
      }

      // 4. 启动开发服务器（如果需要浏览器测试）
      if (!this.config.skipBrowserTests) {
        this.consoleReporter.info('Step 4/5: Starting development server...');
        devServerProcess = await this._withTimeout(
          this._startDevServer(projectDir, templateConfig),
          this.config.devServer?.startTimeout || 60000,
          'Dev server start timed out'
        );
        resourceCallback(projectDir, devServerProcess);

        // 5. 运行浏览器测试
        this.consoleReporter.info('Step 5/5: Running browser tests...');
        const browserRunner = new BrowserTestRunner(this.config, this.rootDir);
        const browserResults = await this._withTimeout(
          browserRunner.runTests(projectDir, devServerProcess.url, templateConfig),
          this.config.browser.timeout + 30000, // 浏览器超时 + 缓冲时间
          'Browser tests timed out'
        );

        // 保存浏览器测试结果
        this.allResults.browser[templateName] = browserResults;
      } else {
        this.consoleReporter.info('Step 4/5: Skipping browser tests (disabled)');
      }

    } catch (error) {
      // 传播错误到外层处理
      throw error;
    }
  }

  /**
   * 清理模板测试资源
   * @param {Object} devServerProcess - 开发服务器进程
   * @param {string} projectDir - 项目目录
   * @param {string} templateName - 模板名称
   * @returns {Promise<void>}
   */
  async _cleanupTemplateResources(devServerProcess, projectDir, templateName) {
    const cleanupErrors = [];

    // 1. 停止开发服务器
    if (devServerProcess) {
      try {
        await this._withTimeout(
          this._stopDevServer(devServerProcess),
          5000,
          'Dev server stop timed out'
        );
      } catch (error) {
        cleanupErrors.push(`Failed to stop dev server: ${error.message}`);
      }
    }

    // 2. 清理临时目录
    if (projectDir) {
      try {
        await this._withTimeout(
          this.templateManager.cleanup(projectDir),
          10000,
          'Cleanup timed out'
        );
      } catch (error) {
        cleanupErrors.push(`Failed to cleanup directory: ${error.message}`);
      }
    }

    // 报告清理错误（但不抛出）
    if (cleanupErrors.length > 0) {
      this.consoleReporter.warn(`Cleanup warnings for "${templateName}":`);
      cleanupErrors.forEach(err => this.consoleReporter.warn(`  - ${err}`));
    }
  }

  /**
   * 记录模板失败信息
   * @param {string} templateName - 模板名称
   * @param {Error} error - 错误对象
   */
  _recordTemplateFailure(templateName, error) {
    if (!this.allResults.failures) {
      this.allResults.failures = [];
    }

    this.allResults.failures.push({
      templateName,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 带超时的 Promise 包装器
   * @param {Promise} promise - 要执行的 Promise
   * @param {number} timeoutMs - 超时时间（毫秒）
   * @param {string} timeoutMessage - 超时错误消息
   * @returns {Promise} 包装后的 Promise
   */
  async _withTimeout(promise, timeoutMs, timeoutMessage) {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 启动 API 服务器
   * @returns {Promise<void>}
   */
  async _startAPIServer() {
    try {
      this.consoleReporter.info('Starting API server...');
      await this.apiServer.start(this.config.apiServer.port);
      this.consoleReporter.success(`API server running at http://${this.config.apiServer.host}:${this.config.apiServer.port}`);
    } catch (error) {
      throw new Error(`Failed to start API server: ${error.message}`);
    }
  }

  /**
   * 停止 API 服务器
   * @returns {Promise<void>}
   */
  async _stopAPIServer() {
    try {
      this.consoleReporter.info('Stopping API server...');
      await this.apiServer.stop();
      this.consoleReporter.success('API server stopped');
    } catch (error) {
      this.consoleReporter.warn(`Failed to stop API server: ${error.message}`);
    }
  }

  /**
   * 启动开发服务器
   * @param {string} projectDir - 项目目录
   * @param {Object} templateConfig - 模板配置
   * @returns {Promise<Object>} 开发服务器信息 { process, url, port }
   */
  async _startDevServer(projectDir, templateConfig) {
    // 这是一个简化的实现，实际应该使用 dev-server.js 工具
    // 目前返回模拟的服务器信息
    const port = 3000;
    const url = `http://localhost:${port}`;

    this.consoleReporter.warn('Dev server start is not implemented yet, using mock URL');

    return {
      process: null,
      url,
      port
    };
  }

  /**
   * 停止开发服务器
   * @param {Object} devServerInfo - 开发服务器信息
   * @returns {Promise<void>}
   */
  async _stopDevServer(devServerInfo) {
    if (devServerInfo && devServerInfo.process) {
      try {
        devServerInfo.process.kill();
        this.consoleReporter.success('Development server stopped');
      } catch (error) {
        this.consoleReporter.warn(`Failed to stop dev server: ${error.message}`);
      }
    }
  }

  /**
   * 获取要测试的模板列表
   * @param {Array<string>} templates - 指定的模板列表
   * @returns {Promise<Array<string>>} 模板列表
   */
  async _getTemplatesToTest(templates) {
    if (templates && templates.length > 0) {
      // 验证指定的模板是否存在
      const availableTemplates = await this.templateManager.getAvailableTemplates();
      const invalidTemplates = templates.filter(t => !availableTemplates.includes(t));

      if (invalidTemplates.length > 0) {
        throw new Error(`Invalid template(s): ${invalidTemplates.join(', ')}`);
      }

      return templates;
    }

    // 返回所有可用模板
    return await this.templateManager.getAvailableTemplates();
  }

  /**
   * 生成最终报告
   * @returns {Promise<void>}
   */
  async _generateFinalReport() {
    this.consoleReporter.info('Generating test reports...');

    try {
      // 构建综合结果
      const finalResults = this._buildFinalResults();

      // 生成 JSON 报告
      await this.jsonReporter.generateFullReport(finalResults);

      this.consoleReporter.success('Test reports generated');

    } catch (error) {
      this.consoleReporter.warn(`Failed to generate reports: ${error.message}`);
    }
  }

  /**
   * 构建最终结果
   * @returns {Object} 最终测试结果
   */
  _buildFinalResults() {
    const allTestResults = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    // 收集 CLI 测试结果
    if (this.allResults.cli) {
      allTestResults.push(...this.allResults.cli.results);
      totalPassed += this.allResults.cli.passed;
      totalFailed += this.allResults.cli.failed;
      totalSkipped += this.allResults.cli.skipped || 0;
    }

    // 收集浏览器测试结果
    Object.values(this.allResults.browser).forEach(browserResults => {
      allTestResults.push(...browserResults.results);
      totalPassed += browserResults.passed;
      totalFailed += browserResults.failed;
      totalSkipped += browserResults.skipped || 0;
    });

    return {
      total: allTestResults.length,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: this.stats.endTime ? this.stats.endTime - this.stats.startTime : 0,
      timestamp: new Date().toISOString(),
      results: allTestResults,
      stats: this.stats
    };
  }

  /**
   * 打印配置信息
   */
  _printConfiguration() {
    console.log(chalk.bold.blue('\n╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.blue('║         Comprehensive Testing System                      ║'));
    console.log(chalk.bold.blue('╚════════════════════════════════════════════════════════════╝\n'));

    console.log(chalk.bold('Configuration:'));
    console.log(chalk.gray('  API Server:       ') + `http://${this.config.apiServer.host}:${this.config.apiServer.port}`);
    console.log(chalk.gray('  Browser Mode:     ') + (this.config.browser.headless ? 'Headless' : 'Headed'));
    console.log(chalk.gray('  Skip Install:     ') + (this.config.cli.skipInstall ? 'Yes' : 'No'));
    console.log(chalk.gray('  Skip Browser:     ') + (this.config.skipBrowserTests ? 'Yes' : 'No'));
    console.log(chalk.gray('  Verbose:          ') + (this.config.reporting.verbose ? 'Yes' : 'No'));
    console.log(chalk.gray('  Output Dir:       ') + this.config.reporting.outputDir);
    console.log();
  }

  /**
   * 打印最终统计
   */
  _printFinalStats() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationSec = (duration / 1000).toFixed(2);

    console.log(chalk.bold.blue('\n╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.blue('║         Test Suite Completed                               ║'));
    console.log(chalk.bold.blue('╚════════════════════════════════════════════════════════════╝\n'));

    console.log(chalk.bold('Statistics:'));
    console.log(chalk.gray('  Total Templates:      ') + this.stats.totalTemplates);
    console.log(chalk.green('  Completed:            ') + this.stats.completedTemplates);
    console.log(chalk.red('  Failed:               ') + this.stats.failedTemplates);
    console.log(chalk.gray('  Duration:             ') + `${durationSec}s`);
    console.log();

    if (this.stats.failedTemplates === 0) {
      console.log(chalk.green.bold('✓ All templates tested successfully!\n'));
    } else {
      console.log(chalk.red.bold(`✗ ${this.stats.failedTemplates} template(s) failed\n`));
    }
  }

  /**
   * 清理资源
   * @returns {Promise<void>}
   */
  async _cleanup() {
    try {
      await this._stopAPIServer();
      await this.templateManager.cleanupAll();
    } catch (error) {
      // 忽略清理错误
    }
  }
}

/**
 * CLI 入口
 */
async function main() {
  // 解析命令行参数
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options] [templates...]')
    .option('headless', {
      type: 'boolean',
      description: 'Run browser tests in headless mode',
      default: true
    })
    .option('headed', {
      type: 'boolean',
      description: 'Run browser tests in headed mode (opposite of headless)',
      default: false
    })
    .option('skip-install', {
      type: 'boolean',
      description: 'Skip dependency installation',
      default: false
    })
    .option('skip-browser', {
      type: 'boolean',
      description: 'Skip browser tests',
      default: false
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Enable verbose logging',
      default: true
    })
    .option('quiet', {
      alias: 'q',
      type: 'boolean',
      description: 'Minimal output (opposite of verbose)',
      default: false
    })
    .option('log-level', {
      type: 'string',
      description: 'Log level: error, warn, info, debug',
      choices: ['error', 'warn', 'info', 'debug'],
      default: 'info'
    })
    .option('timeout', {
      type: 'number',
      description: 'Test timeout in milliseconds',
      default: 30000
    })
    .option('template-timeout', {
      type: 'number',
      description: 'Template test timeout in milliseconds',
      default: 300000
    })
    .option('stop-on-failure', {
      type: 'boolean',
      description: 'Stop testing on first failure',
      default: false
    })
    .help('h')
    .alias('h', 'help')
    .example('$0', 'Run all tests')
    .example('$0 react-cra-no-sw', 'Test specific template')
    .example('$0 react-cra-no-sw nextjs-no-sw', 'Test multiple templates')
    .example('$0 --headed --verbose', 'Run with headed browser and verbose output')
    .example('$0 --skip-install', 'Skip dependency installation')
    .example('$0 --skip-browser', 'Run only CLI tests')
    .example('$0 --quiet', 'Run with minimal output')
    .example('$0 --log-level=debug', 'Run with debug logging')
    .example('$0 --stop-on-failure', 'Stop on first failure')
    .argv;

  // 处理 headed 选项（覆盖 headless）
  if (argv.headed) {
    argv.headless = false;
  }

  // 处理 quiet 选项（覆盖 verbose）
  if (argv.quiet) {
    argv.verbose = false;
  }

  // 提取模板列表
  const templates = argv._.length > 0 ? argv._ : null;

  // 创建测试运行器
  const runner = new MainTestRunner({
    headless: argv.headless,
    skipInstall: argv.skipInstall,
    skipBrowserTests: argv.skipBrowser,
    verbose: argv.verbose,
    logLevel: argv.logLevel,
    timeout: argv.timeout,
    templateTimeout: argv.templateTimeout,
    stopOnFailure: argv.stopOnFailure
  });

  try {
    // 运行测试
    const results = await runner.run(templates);

    // 根据测试结果设置退出码
    const exitCode = results.failed > 0 ? 1 : 0;
    process.exit(exitCode);

  } catch (error) {
    console.error(chalk.red.bold('\n✗ Test suite failed with error:\n'));
    console.error(chalk.red(error.message));

    if (argv.verbose && error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }

    process.exit(1);
  }
}

// 如果直接运行此文件，执行 CLI
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// 导出类供其他模块使用
module.exports = MainTestRunner;
