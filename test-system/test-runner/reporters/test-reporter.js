const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * TestReporter - 主测试报告器类
 * 负责生成测试报告、保存日志和截图
 */
class TestReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './test-results';
    this.logsDir = path.join(this.outputDir, 'logs');
    this.screenshotsDir = path.join(this.outputDir, 'screenshots');
    this.reportsDir = path.join(this.outputDir, 'reports');
    this.verbose = options.verbose !== false;

    // 确保输出目录存在
    this._ensureDirectories();
  }

  /**
   * 确保所有必要的目录存在
   */
  async _ensureDirectories() {
    await fs.ensureDir(this.logsDir);
    await fs.ensureDir(this.screenshotsDir);
    await fs.ensureDir(this.reportsDir);
  }

  /**
   * 生成测试报告
   * @param {Object} results - 测试结果对象
   * @returns {Promise<string>} 报告文件路径
   */
  async generateReport(results) {
    await this._ensureDirectories();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.reportsDir, `test-report-${timestamp}.txt`);

    const report = this._buildReport(results);
    await fs.writeFile(reportPath, report, 'utf-8');

    if (this.verbose) {
      console.log(chalk.green('✓'), `Report saved to: ${reportPath}`);
    }

    return reportPath;
  }

  /**
   * 构建报告内容
   */
  _buildReport(results) {
    const lines = [];

    // 标题
    lines.push('='.repeat(80));
    lines.push('TEST REPORT');
    lines.push('='.repeat(80));
    lines.push('');

    // 摘要
    lines.push('SUMMARY');
    lines.push('-'.repeat(80));
    lines.push(`Timestamp:     ${results.timestamp || new Date().toISOString()}`);
    lines.push(`Total Tests:   ${results.total}`);
    lines.push(`Passed:        ${results.passed} (${this._percentage(results.passed, results.total)}%)`);
    lines.push(`Failed:        ${results.failed} (${this._percentage(results.failed, results.total)}%)`);
    lines.push(`Skipped:       ${results.skipped || 0} (${this._percentage(results.skipped || 0, results.total)}%)`);
    lines.push(`Duration:      ${results.duration}ms (${(results.duration / 1000).toFixed(2)}s)`);
    lines.push('');

    // 详细结果
    lines.push('DETAILED RESULTS');
    lines.push('-'.repeat(80));
    lines.push('');

    if (results.results && results.results.length > 0) {
      results.results.forEach((result, index) => {
        lines.push(`${index + 1}. ${result.name}`);
        lines.push(`   Status:   ${result.status.toUpperCase()}`);
        lines.push(`   Duration: ${result.duration}ms`);

        if (result.metadata) {
          lines.push('   Metadata:');
          Object.entries(result.metadata).forEach(([key, value]) => {
            lines.push(`     ${key}: ${value}`);
          });
        }

        if (result.error) {
          lines.push('   Error:');
          lines.push(`     ${result.error.message}`);
          if (result.error.stack) {
            lines.push('   Stack Trace:');
            result.error.stack.split('\n').forEach(line => {
              lines.push(`     ${line}`);
            });
          }
        }

        if (result.logs && result.logs.length > 0) {
          lines.push('   Logs:');
          result.logs.forEach(log => {
            lines.push(`     ${log}`);
          });
        }

        lines.push('');
      });
    }

    // 失败测试汇总
    const failedTests = results.results?.filter(r => r.status === 'fail') || [];
    if (failedTests.length > 0) {
      lines.push('FAILED TESTS SUMMARY');
      lines.push('-'.repeat(80));
      failedTests.forEach((result, index) => {
        lines.push(`${index + 1}. ${result.name}`);
        if (result.error) {
          lines.push(`   Error: ${result.error.message}`);
        }
        lines.push('');
      });
    }

    // 结论
    lines.push('='.repeat(80));
    if (results.failed === 0) {
      lines.push('RESULT: ALL TESTS PASSED ✓');
    } else {
      lines.push(`RESULT: ${results.failed} TEST(S) FAILED ✗`);
    }
    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  /**
   * 计算百分比
   */
  _percentage(value, total) {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  }

  /**
   * 生成简短摘要
   */
  generateSummary(results) {
    const summary = {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped || 0,
      duration: results.duration,
      passRate: this._percentage(results.passed, results.total),
      timestamp: results.timestamp || new Date().toISOString()
    };

    return summary;
  }

  /**
   * 打印摘要到控制台
   */
  printSummary(results) {
    console.log('\n' + chalk.bold.cyan('═'.repeat(80)));
    console.log(chalk.bold.cyan('  TEST SUMMARY'));
    console.log(chalk.bold.cyan('═'.repeat(80)));

    console.log(chalk.bold('  Total Tests:  '), results.total);
    console.log(chalk.green.bold('  Passed:       '), `${results.passed} (${this._percentage(results.passed, results.total)}%)`);
    console.log(chalk.red.bold('  Failed:       '), `${results.failed} (${this._percentage(results.failed, results.total)}%)`);

    if (results.skipped > 0) {
      console.log(chalk.yellow.bold('  Skipped:      '), `${results.skipped} (${this._percentage(results.skipped, results.total)}%)`);
    }

    console.log(chalk.gray('  Duration:     '), `${results.duration}ms (${(results.duration / 1000).toFixed(2)}s)`);
    console.log(chalk.bold.cyan('═'.repeat(80)));

    if (results.failed === 0) {
      console.log(chalk.green.bold('\n  ✓ ALL TESTS PASSED!\n'));
    } else {
      console.log(chalk.red.bold(`\n  ✗ ${results.failed} TEST(S) FAILED\n`));
    }
  }

  /**
   * 保存测试日志
   * @param {string} testName - 测试名称
   * @param {Array<string>} logs - 日志内容数组
   * @returns {Promise<string>} 日志文件路径
   */
  async saveLogs(testName, logs) {
    await this._ensureDirectories();

    const sanitizedName = this._sanitizeFilename(testName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(this.logsDir, `${sanitizedName}-${timestamp}.log`);

    const logContent = [
      `Test: ${testName}`,
      `Timestamp: ${new Date().toISOString()}`,
      '='.repeat(80),
      '',
      ...logs
    ].join('\n');

    await fs.writeFile(logPath, logContent, 'utf-8');

    if (this.verbose) {
      console.log(chalk.gray('  Log saved:'), logPath);
    }

    return logPath;
  }

  /**
   * 保存截图
   * @param {string} testName - 测试名称
   * @param {Buffer} screenshot - 截图数据
   * @returns {Promise<string>} 截图文件路径
   */
  async saveScreenshot(testName, screenshot) {
    await this._ensureDirectories();

    const sanitizedName = this._sanitizeFilename(testName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(this.screenshotsDir, `${sanitizedName}-${timestamp}.png`);

    await fs.writeFile(screenshotPath, screenshot);

    if (this.verbose) {
      console.log(chalk.gray('  Screenshot saved:'), screenshotPath);
    }

    return screenshotPath;
  }

  /**
   * 保存失败测试的日志和截图
   * @param {Object} testResult - 测试结果对象
   * @param {Buffer} screenshot - 可选的截图数据
   * @returns {Promise<Object>} 保存的文件路径
   */
  async saveFailureArtifacts(testResult, screenshot = null) {
    const artifacts = {};

    // 保存日志
    if (testResult.logs && testResult.logs.length > 0) {
      artifacts.logPath = await this.saveLogs(testResult.name, testResult.logs);
    }

    // 保存截图
    if (screenshot) {
      artifacts.screenshotPath = await this.saveScreenshot(testResult.name, screenshot);
    }

    // 保存错误详情
    if (testResult.error) {
      const errorLogs = [
        'Error Message:',
        testResult.error.message,
        '',
        'Stack Trace:',
        testResult.error.stack || 'No stack trace available'
      ];

      const sanitizedName = this._sanitizeFilename(testResult.name);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const errorPath = path.join(this.logsDir, `${sanitizedName}-error-${timestamp}.log`);

      await fs.writeFile(errorPath, errorLogs.join('\n'), 'utf-8');
      artifacts.errorPath = errorPath;
    }

    return artifacts;
  }

  /**
   * 清理文件名中的非法字符
   */
  _sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .substring(0, 100); // 限制长度
  }

  /**
   * 获取日志目录路径
   */
  getLogsDir() {
    return this.logsDir;
  }

  /**
   * 获取截图目录路径
   */
  getScreenshotsDir() {
    return this.screenshotsDir;
  }

  /**
   * 获取报告目录路径
   */
  getReportsDir() {
    return this.reportsDir;
  }
}

module.exports = TestReporter;
