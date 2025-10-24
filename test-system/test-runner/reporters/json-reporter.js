const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * JSONReporter - 生成机器可读的 JSON 格式测试报告
 */
class JSONReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './test-results';
    this.reportsDir = path.join(this.outputDir, 'reports');
    this.verbose = options.verbose !== false;
    
    // 确保输出目录存在
    this._ensureDirectories();
  }

  /**
   * 确保报告目录存在
   */
  async _ensureDirectories() {
    await fs.ensureDir(this.reportsDir);
  }

  /**
   * 生成 JSON 报告
   * @param {Object} results - 测试结果对象
   * @returns {Promise<string>} JSON 报告文件路径
   */
  async generateJSONReport(results) {
    await this._ensureDirectories();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.reportsDir, `test-report-${timestamp}.json`);
    
    const jsonReport = this._buildJSONReport(results);
    await fs.writeFile(reportPath, JSON.stringify(jsonReport, null, 2), 'utf-8');
    
    if (this.verbose) {
      console.log(chalk.green('✓'), `JSON report saved to: ${reportPath}`);
    }
    
    return reportPath;
  }

  /**
   * 构建 JSON 报告对象
   */
  _buildJSONReport(results) {
    return {
      version: '1.0.0',
      timestamp: results.timestamp || new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped || 0,
        duration: results.duration,
        passRate: this._calculatePassRate(results.passed, results.total),
        status: results.failed === 0 ? 'success' : 'failure'
      },
      results: this._formatResults(results.results || []),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  /**
   * 格式化测试结果
   */
  _formatResults(results) {
    return results.map(result => ({
      name: result.name,
      status: result.status,
      duration: result.duration,
      metadata: result.metadata || {},
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack,
        name: result.error.name
      } : null,
      logs: result.logs || []
    }));
  }

  /**
   * 计算通过率
   */
  _calculatePassRate(passed, total) {
    if (total === 0) return 0;
    return parseFloat(((passed / total) * 100).toFixed(2));
  }

  /**
   * 生成简化的 JSON 摘要
   * @param {Object} results - 测试结果对象
   * @returns {Promise<string>} JSON 摘要文件路径
   */
  async generateSummary(results) {
    await this._ensureDirectories();
    
    const summaryPath = path.join(this.reportsDir, 'latest-summary.json');
    
    const summary = {
      timestamp: results.timestamp || new Date().toISOString(),
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped || 0,
      duration: results.duration,
      passRate: this._calculatePassRate(results.passed, results.total),
      status: results.failed === 0 ? 'success' : 'failure'
    };
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    
    if (this.verbose) {
      console.log(chalk.green('✓'), `Summary saved to: ${summaryPath}`);
    }
    
    return summaryPath;
  }

  /**
   * 生成失败测试的 JSON 报告
   * @param {Object} results - 测试结果对象
   * @returns {Promise<string>} 失败测试报告文件路径
   */
  async generateFailuresReport(results) {
    const failedTests = (results.results || []).filter(r => r.status === 'fail');
    
    if (failedTests.length === 0) {
      return null;
    }
    
    await this._ensureDirectories();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const failuresPath = path.join(this.reportsDir, `failures-${timestamp}.json`);
    
    const failuresReport = {
      timestamp: results.timestamp || new Date().toISOString(),
      totalFailed: failedTests.length,
      failures: this._formatResults(failedTests)
    };
    
    await fs.writeFile(failuresPath, JSON.stringify(failuresReport, null, 2), 'utf-8');
    
    if (this.verbose) {
      console.log(chalk.yellow('⚠'), `Failures report saved to: ${failuresPath}`);
    }
    
    return failuresPath;
  }

  /**
   * 追加测试结果到历史记录
   * @param {Object} results - 测试结果对象
   * @returns {Promise<string>} 历史记录文件路径
   */
  async appendToHistory(results) {
    await this._ensureDirectories();
    
    const historyPath = path.join(this.reportsDir, 'test-history.json');
    
    let history = [];
    if (await fs.pathExists(historyPath)) {
      const content = await fs.readFile(historyPath, 'utf-8');
      history = JSON.parse(content);
    }
    
    const entry = {
      timestamp: results.timestamp || new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped || 0,
        duration: results.duration,
        passRate: this._calculatePassRate(results.passed, results.total)
      }
    };
    
    history.push(entry);
    
    // 只保留最近 100 条记录
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8');
    
    return historyPath;
  }

  /**
   * 读取测试历史
   * @returns {Promise<Array>} 历史记录数组
   */
  async readHistory() {
    const historyPath = path.join(this.reportsDir, 'test-history.json');
    
    if (await fs.pathExists(historyPath)) {
      const content = await fs.readFile(historyPath, 'utf-8');
      return JSON.parse(content);
    }
    
    return [];
  }

  /**
   * 生成完整的测试报告包（包含所有格式）
   * @param {Object} results - 测试结果对象
   * @returns {Promise<Object>} 所有生成的报告路径
   */
  async generateFullReport(results) {
    const reports = {};
    
    reports.json = await this.generateJSONReport(results);
    reports.summary = await this.generateSummary(results);
    
    if (results.failed > 0) {
      reports.failures = await this.generateFailuresReport(results);
    }
    
    await this.appendToHistory(results);
    
    return reports;
  }
}

module.exports = JSONReporter;
