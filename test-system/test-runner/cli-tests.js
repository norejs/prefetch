const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const TemplateManager = require('./utils/template-manager');

/**
 * CLITestRunner - 自动化测试 CLI 迁移工具的功能
 */
class CLITestRunner {
  constructor(config, rootDir = null) {
    this.config = config;
    this.rootDir = rootDir || process.cwd();
    this.templateManager = new TemplateManager(config, rootDir);
    
    // 解析 CLI 工具路径
    this.cliPath = path.isAbsolute(config.cli.cliPath)
      ? config.cli.cliPath
      : path.resolve(this.rootDir, config.cli.cliPath);
    
    // 测试结果收集
    this.results = [];
  }

  /**
   * 运行 CLI 测试套件
   * @param {Array<string>} templates - 要测试的模板列表（可选）
   * @returns {Promise<Object>} 测试结果
   */
  async runTests(templates = null) {
    console.log(chalk.bold.blue('\n=== Starting CLI Tests ===\n'));
    
    const startTime = Date.now();
    this.results = [];
    
    try {
      // 获取要测试的模板列表
      const templatesToTest = templates || await this.templateManager.getAvailableTemplates();
      
      if (templatesToTest.length === 0) {
        throw new Error('No templates found to test');
      }
      
      console.log(chalk.blue(`Found ${templatesToTest.length} templates to test\n`));
      
      // 遍历每个模板执行测试
      for (const templateName of templatesToTest) {
        console.log(chalk.bold.cyan(`\n--- Testing template: ${templateName} ---\n`));
        
        try {
          await this.testTemplate(templateName);
        } catch (error) {
          console.error(chalk.red(`Error testing template "${templateName}": ${error.message}`));
          this.addResult({
            name: `Template: ${templateName}`,
            status: 'fail',
            error: error,
            logs: [error.message, error.stack]
          });
        }
      }
      
      // 生成测试摘要
      const duration = Date.now() - startTime;
      const summary = this.generateSummary(duration);
      
      this.printSummary(summary);
      
      return summary;
      
    } catch (error) {
      console.error(chalk.red(`\nCLI Tests failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * 测试单个模板
   * @param {string} templateName - 模板名称
   * @returns {Promise<void>}
   */
  async testTemplate(templateName) {
    let projectDir = null;
    
    try {
      // 1. 复制模板到临时目录
      projectDir = await this.templateManager.copyTemplate(templateName);
      
      // 2. 读取模板配置
      const templateConfig = await this.templateManager.getTemplateConfig(templateName);
      
      // 3. 运行框架检测测试
      await this.testFrameworkDetection(projectDir, templateConfig);
      
      // 4. 运行 Service Worker 检测测试
      await this.testSWDetection(projectDir, templateConfig);
      
      // 5. 运行 CLI 工具（实际迁移）
      await this.runCLIMigration(projectDir, templateName);
      
      // 6. 运行文件生成测试
      await this.testFileGeneration(projectDir, templateConfig);
      
      // 7. 运行依赖安装测试
      await this.testDependencyInstallation(projectDir, templateConfig);
      
      console.log(chalk.green(`✓ All CLI tests passed for template: ${templateName}\n`));
      
    } finally {
      // 清理临时目录
      if (projectDir) {
        await this.templateManager.cleanup(projectDir);
      }
    }
  }

  /**
   * 运行 CLI 迁移工具
   * @param {string} projectDir - 项目目录
   * @param {string} templateName - 模板名称
   * @returns {Promise<Object>} CLI 执行结果
   */
  async runCLIMigration(projectDir, templateName) {
    const testName = `CLI Migration: ${templateName}`;
    const startTime = Date.now();
    
    console.log(chalk.blue(`Running CLI migration tool...`));
    
    try {
      // 执行 CLI 工具（使用 --yes 跳过确认，--verbose 获取详细输出）
      const result = await execa('node', [this.cliPath, '--yes', '--verbose'], {
        cwd: projectDir,
        timeout: this.config.cli.timeout,
        reject: false // 不自动抛出错误，我们手动处理
      });
      
      const duration = Date.now() - startTime;
      
      // 检查执行结果
      if (result.exitCode !== 0) {
        throw new Error(`CLI tool exited with code ${result.exitCode}\nStderr: ${result.stderr}`);
      }
      
      console.log(chalk.green(`✓ CLI migration completed successfully`));
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs: [result.stdout, result.stderr].filter(Boolean),
        metadata: { templateName }
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ CLI migration failed: ${error.message}`));
      
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
   * 测试框架检测
   * @param {string} projectDir - 项目目录
   * @param {Object} templateConfig - 模板配置
   * @returns {Promise<void>}
   */
  async testFrameworkDetection(projectDir, templateConfig) {
    const testName = `Framework Detection: ${templateConfig.name}`;
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing framework detection...`));
    
    try {
      // 读取 package.json 来模拟框架检测
      const packageJsonPath = path.join(projectDir, 'package.json');
      
      if (!await fs.pathExists(packageJsonPath)) {
        throw new Error('package.json not found');
      }
      
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // 检测框架类型
      let detectedFramework = 'unknown';
      
      if (dependencies['next']) {
        detectedFramework = 'nextjs';
      } else if (dependencies['react-scripts']) {
        detectedFramework = 'cra';
      } else if (dependencies['react'] && dependencies['vite']) {
        detectedFramework = 'react-vite';
      } else if (dependencies['vue'] && dependencies['@vue/cli-service']) {
        detectedFramework = 'vue-cli';
      } else if (dependencies['vue'] && dependencies['vite']) {
        detectedFramework = 'vue-vite';
      } else if (dependencies['nuxt']) {
        detectedFramework = 'nuxt';
      } else if (dependencies['@remix-run/react']) {
        detectedFramework = 'remix';
      } else if (dependencies['astro']) {
        detectedFramework = 'astro';
      }
      
      // 验证检测结果是否与模板配置匹配
      const expectedFramework = templateConfig.framework;
      
      if (detectedFramework !== expectedFramework) {
        throw new Error(
          `Framework detection mismatch: expected "${expectedFramework}", detected "${detectedFramework}"`
        );
      }
      
      const duration = Date.now() - startTime;
      
      console.log(chalk.green(`✓ Framework detected correctly: ${detectedFramework}`));
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs: [`Detected framework: ${detectedFramework}`],
        metadata: {
          templateName: templateConfig.name,
          expectedFramework,
          detectedFramework
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ Framework detection failed: ${error.message}`));
      
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
   * 测试 Service Worker 检测
   * @param {string} projectDir - 项目目录
   * @param {Object} templateConfig - 模板配置
   * @returns {Promise<void>}
   */
  async testSWDetection(projectDir, templateConfig) {
    const testName = `Service Worker Detection: ${templateConfig.name}`;
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing Service Worker detection...`));
    
    try {
      // 定义常见的 Service Worker 文件模式
      const swFilePatterns = [
        'service-worker.js',
        'sw.js',
        'worker.js',
        'serviceworker.js'
      ];
      
      // 定义要搜索的目录
      const searchDirs = [
        templateConfig.publicDir || 'public',
        'src',
        'static',
        '.'
      ];
      
      // 搜索 Service Worker 文件
      let foundSW = false;
      let foundWorkbox = false;
      let foundPrefetch = false;
      let swFilePath = null;
      
      for (const dir of searchDirs) {
        const dirPath = path.join(projectDir, dir);
        
        if (!await fs.pathExists(dirPath)) {
          continue;
        }
        
        for (const pattern of swFilePatterns) {
          const filePath = path.join(dirPath, pattern);
          
          if (await fs.pathExists(filePath)) {
            foundSW = true;
            swFilePath = filePath;
            
            // 读取文件内容检查 Workbox 和 Prefetch
            const content = await fs.readFile(filePath, 'utf-8');
            
            // 检查 Workbox
            if (content.includes('workbox') || content.includes('Workbox')) {
              foundWorkbox = true;
            }
            
            // 检查 Prefetch 集成
            if (content.includes('Prefetch Worker Integration') || 
                content.includes('prefetch') || 
                content.includes('@norejs/prefetch-worker')) {
              foundPrefetch = true;
            }
            
            break;
          }
        }
        
        if (foundSW) break;
      }
      
      // 验证检测结果是否与模板配置匹配
      const expectedHasSW = templateConfig.hasServiceWorker;
      const expectedHasWorkbox = templateConfig.hasWorkbox;
      const expectedHasPrefetch = templateConfig.hasPrefetch;
      
      const errors = [];
      
      if (foundSW !== expectedHasSW) {
        errors.push(
          `Service Worker detection mismatch: expected ${expectedHasSW}, found ${foundSW}`
        );
      }
      
      if (foundSW && foundWorkbox !== expectedHasWorkbox) {
        errors.push(
          `Workbox detection mismatch: expected ${expectedHasWorkbox}, found ${foundWorkbox}`
        );
      }
      
      if (foundSW && foundPrefetch !== expectedHasPrefetch) {
        errors.push(
          `Prefetch detection mismatch: expected ${expectedHasPrefetch}, found ${foundPrefetch}`
        );
      }
      
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
      
      const duration = Date.now() - startTime;
      
      const detectionInfo = [
        `Service Worker: ${foundSW ? 'found' : 'not found'}`,
        foundSW ? `  Path: ${path.relative(projectDir, swFilePath)}` : '',
        foundSW ? `  Workbox: ${foundWorkbox}` : '',
        foundSW ? `  Prefetch: ${foundPrefetch}` : ''
      ].filter(Boolean).join('\n');
      
      console.log(chalk.green(`✓ Service Worker detection correct`));
      console.log(chalk.gray(detectionInfo));
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs: [detectionInfo],
        metadata: {
          templateName: templateConfig.name,
          hasServiceWorker: foundSW,
          hasWorkbox: foundWorkbox,
          hasPrefetch: foundPrefetch,
          swFilePath: swFilePath ? path.relative(projectDir, swFilePath) : null
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ Service Worker detection failed: ${error.message}`));
      
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
   * 测试文件生成
   * @param {string} projectDir - 项目目录
   * @param {Object} templateConfig - 模板配置
   * @returns {Promise<void>}
   */
  async testFileGeneration(projectDir, templateConfig) {
    const testName = `File Generation: ${templateConfig.name}`;
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing file generation...`));
    
    try {
      const errors = [];
      const logs = [];
      
      // 1. 验证 Service Worker 文件是否正确生成或更新
      const publicDir = templateConfig.publicDir || 'public';
      const swPath = path.join(projectDir, publicDir, 'service-worker.js');
      
      if (!await fs.pathExists(swPath)) {
        errors.push(`Service Worker file not found at expected location: ${swPath}`);
      } else {
        logs.push(`✓ Service Worker file exists: ${path.relative(projectDir, swPath)}`);
        
        // 读取 Service Worker 内容验证
        const swContent = await fs.readFile(swPath, 'utf-8');
        
        // 检查是否包含 Prefetch 集成代码
        if (!swContent.includes('Prefetch Worker Integration') && 
            !swContent.includes('@norejs/prefetch-worker')) {
          errors.push('Service Worker file does not contain Prefetch integration code');
        } else {
          logs.push('✓ Service Worker contains Prefetch integration');
        }
        
        // 检查基本的 Service Worker 结构
        const hasInstallListener = swContent.includes('install') || swContent.includes('addEventListener');
        const hasFetchListener = swContent.includes('fetch');
        
        if (!hasInstallListener && !hasFetchListener) {
          errors.push('Service Worker file appears to be invalid (missing event listeners)');
        } else {
          logs.push('✓ Service Worker has valid structure');
        }
      }
      
      // 2. 验证入口文件是否正确注入初始化代码
      const entryFile = templateConfig.entryFile;
      const entryPath = path.join(projectDir, entryFile);
      
      if (!await fs.pathExists(entryPath)) {
        errors.push(`Entry file not found: ${entryPath}`);
      } else {
        logs.push(`✓ Entry file exists: ${path.relative(projectDir, entryPath)}`);
        
        // 读取入口文件内容验证
        const entryContent = await fs.readFile(entryPath, 'utf-8');
        
        // 检查是否包含 Prefetch 初始化代码
        const hasPrefetchImport = entryContent.includes('@norejs/prefetch') || 
                                  entryContent.includes('prefetch');
        const hasPrefetchSetup = entryContent.includes('setup') || 
                                 entryContent.includes('registerServiceWorker');
        
        if (!hasPrefetchImport) {
          // 如果模板已经有 Prefetch，这是正常的
          if (!templateConfig.hasPrefetch) {
            errors.push('Entry file does not contain Prefetch import');
          }
        } else {
          logs.push('✓ Entry file contains Prefetch import');
        }
        
        if (!hasPrefetchSetup && !templateConfig.hasPrefetch) {
          errors.push('Entry file does not contain Prefetch initialization code');
        } else if (hasPrefetchSetup) {
          logs.push('✓ Entry file contains Prefetch initialization');
        }
      }
      
      // 3. 检查备份文件是否创建（如果有修改）
      const backupDir = path.join(projectDir, '.prefetch-backup');
      if (await fs.pathExists(backupDir)) {
        logs.push('✓ Backup directory created');
        
        // 列出备份文件
        const backupFiles = await fs.readdir(backupDir);
        if (backupFiles.length > 0) {
          logs.push(`  Backup files: ${backupFiles.join(', ')}`);
        }
      }
      
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
      
      const duration = Date.now() - startTime;
      
      console.log(chalk.green(`✓ File generation verified`));
      logs.forEach(log => console.log(chalk.gray(`  ${log}`)));
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs,
        metadata: {
          templateName: templateConfig.name,
          swPath: path.relative(projectDir, swPath),
          entryPath: path.relative(projectDir, entryPath)
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ File generation test failed: ${error.message}`));
      
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
   * 测试依赖安装
   * @param {string} projectDir - 项目目录
   * @param {Object} templateConfig - 模板配置
   * @returns {Promise<void>}
   */
  async testDependencyInstallation(projectDir, templateConfig) {
    const testName = `Dependency Installation: ${templateConfig.name}`;
    const startTime = Date.now();
    
    console.log(chalk.blue(`Testing dependency installation...`));
    
    try {
      const errors = [];
      const logs = [];
      
      // 1. 验证 package.json 是否正确更新
      const packageJsonPath = path.join(projectDir, 'package.json');
      
      if (!await fs.pathExists(packageJsonPath)) {
        throw new Error('package.json not found');
      }
      
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // 检查必需的 Prefetch 依赖
      const requiredDeps = ['@norejs/prefetch', '@norejs/prefetch-worker'];
      const missingDeps = [];
      
      for (const dep of requiredDeps) {
        if (!dependencies[dep]) {
          missingDeps.push(dep);
        } else {
          logs.push(`✓ Dependency added: ${dep}@${dependencies[dep]}`);
        }
      }
      
      if (missingDeps.length > 0) {
        errors.push(`Missing required dependencies: ${missingDeps.join(', ')}`);
      }
      
      // 2. 验证依赖是否可以成功安装（如果未跳过安装）
      if (!this.config.cli.skipInstall) {
        console.log(chalk.blue(`  Installing dependencies (this may take a while)...`));
        
        try {
          // 检测包管理器
          const hasYarnLock = await fs.pathExists(path.join(projectDir, 'yarn.lock'));
          const hasPnpmLock = await fs.pathExists(path.join(projectDir, 'pnpm-lock.yaml'));
          
          let installCmd = 'npm';
          let installArgs = ['install'];
          
          if (hasPnpmLock) {
            installCmd = 'pnpm';
            installArgs = ['install'];
          } else if (hasYarnLock) {
            installCmd = 'yarn';
            installArgs = ['install'];
          }
          
          // 执行安装
          const installResult = await execa(installCmd, installArgs, {
            cwd: projectDir,
            timeout: this.config.cli.installTimeout,
            reject: false
          });
          
          if (installResult.exitCode !== 0) {
            errors.push(`Dependency installation failed: ${installResult.stderr}`);
          } else {
            logs.push(`✓ Dependencies installed successfully using ${installCmd}`);
            
            // 验证 node_modules 是否存在
            const nodeModulesPath = path.join(projectDir, 'node_modules');
            if (await fs.pathExists(nodeModulesPath)) {
              logs.push('✓ node_modules directory created');
              
              // 验证关键包是否安装
              for (const dep of requiredDeps) {
                const depPath = path.join(nodeModulesPath, dep);
                if (await fs.pathExists(depPath)) {
                  logs.push(`✓ Package installed: ${dep}`);
                } else {
                  errors.push(`Package not found in node_modules: ${dep}`);
                }
              }
            } else {
              errors.push('node_modules directory not created');
            }
          }
          
        } catch (error) {
          if (error.message.includes('timed out')) {
            errors.push(`Dependency installation timed out after ${this.config.cli.installTimeout}ms`);
          } else {
            errors.push(`Dependency installation error: ${error.message}`);
          }
        }
      } else {
        logs.push('⊘ Dependency installation skipped (skipInstall=true)');
      }
      
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
      
      const duration = Date.now() - startTime;
      
      console.log(chalk.green(`✓ Dependency installation verified`));
      logs.forEach(log => console.log(chalk.gray(`  ${log}`)));
      
      this.addResult({
        name: testName,
        status: 'pass',
        duration,
        logs,
        metadata: {
          templateName: templateConfig.name,
          dependencies: requiredDeps,
          skipInstall: this.config.cli.skipInstall
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(chalk.red(`✗ Dependency installation test failed: ${error.message}`));
      
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
      results: this.results
    };
  }

  /**
   * 打印测试摘要
   * @param {Object} summary - 测试摘要
   */
  printSummary(summary) {
    console.log(chalk.bold.blue('\n=== CLI Test Summary ===\n'));
    console.log(`Total Tests:  ${summary.total}`);
    console.log(chalk.green(`Passed:       ${summary.passed}`));
    console.log(chalk.red(`Failed:       ${summary.failed}`));
    console.log(chalk.yellow(`Skipped:      ${summary.skipped}`));
    console.log(`Duration:     ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`Timestamp:    ${summary.timestamp}\n`);
    
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

module.exports = CLITestRunner;
