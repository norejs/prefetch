const chalk = require('chalk');

/**
 * ConsoleReporter - 实时控制台输出测试结果
 */
class ConsoleReporter {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.startTime = null;
  }

  /**
   * 测试开始
   */
  onTestStart(testName) {
    if (this.verbose) {
      console.log(chalk.blue('▶'), chalk.bold(testName));
    }
  }

  /**
   * 测试通过
   */
  onTestPass(testName, duration) {
    const durationStr = duration ? chalk.gray(`(${duration}ms)`) : '';
    console.log(chalk.green('✓'), testName, durationStr);
  }

  /**
   * 测试失败
   */
  onTestFail(testName, error, duration) {
    const durationStr = duration ? chalk.gray(`(${duration}ms)`) : '';
    console.log(chalk.red('✗'), testName, durationStr);
    if (error && this.verbose) {
      console.log(chalk.red('  Error:'), error.message);
      if (error.stack) {
        console.log(chalk.gray(this._indentLines(error.stack, 2)));
      }
    }
  }

  /**
   * 测试跳过
   */
  onTestSkip(testName, reason) {
    const reasonStr = reason ? chalk.gray(`(${reason})`) : '';
    console.log(chalk.yellow('○'), testName, reasonStr);
  }

  /**
   * 套件开始
   */
  onSuiteStart(suiteName) {
    console.log('\n' + chalk.bold.cyan('━'.repeat(60)));
    console.log(chalk.bold.cyan(`  ${suiteName}`));
    console.log(chalk.bold.cyan('━'.repeat(60)) + '\n');
    this.startTime = Date.now();
  }

  /**
   * 套件结束
   */
  onSuiteEnd(results) {
    const duration = this.startTime ? Date.now() - this.startTime : 0;
    
    console.log('\n' + chalk.bold.cyan('━'.repeat(60)));
    console.log(chalk.bold('  Test Summary'));
    console.log(chalk.bold.cyan('━'.repeat(60)));
    
    console.log(chalk.bold('  Total:   '), results.total);
    console.log(chalk.green.bold('  Passed:  '), results.passed);
    console.log(chalk.red.bold('  Failed:  '), results.failed);
    
    if (results.skipped > 0) {
      console.log(chalk.yellow.bold('  Skipped: '), results.skipped);
    }
    
    console.log(chalk.gray('  Duration:'), chalk.gray(`${duration}ms`));
    console.log(chalk.bold.cyan('━'.repeat(60)) + '\n');
    
    // 显示整体状态
    if (results.failed === 0) {
      console.log(chalk.green.bold('✓ All tests passed!') + '\n');
    } else {
      console.log(chalk.red.bold(`✗ ${results.failed} test(s) failed`) + '\n');
    }
  }

  /**
   * 输出分隔符
   */
  separator() {
    console.log(chalk.gray('─'.repeat(60)));
  }

  /**
   * 输出信息
   */
  info(message) {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * 输出警告
   */
  warn(message) {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * 输出错误
   */
  error(message) {
    console.log(chalk.red('✖'), message);
  }

  /**
   * 输出成功消息
   */
  success(message) {
    console.log(chalk.green('✓'), message);
  }

  /**
   * 缩进文本行
   */
  _indentLines(text, spaces) {
    const indent = ' '.repeat(spaces);
    return text.split('\n').map(line => indent + line).join('\n');
  }

  /**
   * 格式化测试结果详情
   */
  printTestDetails(result) {
    console.log('\n' + chalk.bold('Test Details:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold('Name:    '), result.name);
    console.log(chalk.bold('Status:  '), this._formatStatus(result.status));
    console.log(chalk.bold('Duration:'), `${result.duration}ms`);
    
    if (result.metadata) {
      console.log(chalk.bold('Metadata:'));
      Object.entries(result.metadata).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    if (result.logs && result.logs.length > 0) {
      console.log(chalk.bold('Logs:'));
      result.logs.forEach(log => {
        console.log(chalk.gray('  ' + log));
      });
    }
    
    console.log(chalk.gray('─'.repeat(60)));
  }

  /**
   * 格式化状态
   */
  _formatStatus(status) {
    switch (status) {
      case 'pass':
        return chalk.green('PASS');
      case 'fail':
        return chalk.red('FAIL');
      case 'skip':
        return chalk.yellow('SKIP');
      default:
        return chalk.gray(status.toUpperCase());
    }
  }
}

module.exports = ConsoleReporter;
