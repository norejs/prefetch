#!/usr/bin/env node

/**
 * 运行 demo 项目
 * 自动启动 API 服务器（如果未运行）
 * 支持手动选择要运行的 demo
 * 
 * 使用方法:
 *   node scripts/run-demo.js                    # 交互式选择
 *   node scripts/run-demo.js react-cra-no-sw   # 直接运行指定 demo
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');
const readline = require('readline');
const http = require('http');

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');
const demosDir = path.join(rootDir, 'demos');
const apiServerDir = path.join(rootDir, 'api-server');

/**
 * 检查 API 服务器是否正在运行
 * @returns {Promise<boolean>}
 */
async function isAPIServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/api/health', (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * 启动 API 服务器
 * @returns {Promise<Object>} 服务器进程
 */
async function startAPIServer() {
  console.log(chalk.blue('\n🌐 Starting API server...'));
  
  // 检查是否已安装依赖
  const nodeModulesPath = path.join(apiServerDir, 'node_modules');
  if (!await fs.pathExists(nodeModulesPath)) {
    console.log(chalk.yellow('   Installing API server dependencies...'));
    console.log(chalk.gray('   Using pnpm to install dependencies...\n'));
    
    const installProcess = spawn('pnpm', ['install'], {
      cwd: apiServerDir,
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve, reject) => {
      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('\n   ✓ Dependencies installed\n'));
          resolve();
        } else {
          reject(new Error(`pnpm install failed with code ${code}`));
        }
      });
    });
  }
  
  // 启动服务器
  const serverProcess = spawn('pnpm', ['start'], {
    cwd: apiServerDir,
    stdio: 'pipe',
    shell: true,
    detached: false
  });
  
  // 等待服务器启动
  console.log(chalk.blue('   Waiting for API server to start...'));
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (await isAPIServerRunning()) {
      console.log(chalk.green('   ✓ API server started at http://localhost:3001\n'));
      return serverProcess;
    }
    
    attempts++;
  }
  
  throw new Error('API server failed to start within 30 seconds');
}

/**
 * 获取所有可用的 demo
 * @returns {Promise<Array<string>>}
 */
async function getAvailableDemos() {
  try {
    const entries = await fs.readdir(demosDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
  } catch (error) {
    return [];
  }
}

/**
 * 交互式选择 demo
 * @param {Array<string>} demos - 可用的 demo 列表
 * @returns {Promise<string>} 选择的 demo 名称
 */
async function selectDemo(demos) {
  console.log(chalk.bold.blue('\n📦 Available Demos:\n'));
  
  demos.forEach((demo, index) => {
    console.log(chalk.cyan(`   ${index + 1}. ${demo}`));
  });
  
  console.log(chalk.gray('\n   0. Exit\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(chalk.yellow('Select a demo (enter number): '), (answer) => {
      rl.close();
      
      const selection = parseInt(answer);
      
      if (selection === 0 || isNaN(selection)) {
        console.log(chalk.gray('\nExiting...\n'));
        process.exit(0);
      }
      
      if (selection < 1 || selection > demos.length) {
        console.log(chalk.red('\nInvalid selection!\n'));
        process.exit(1);
      }
      
      resolve(demos[selection - 1]);
    });
  });
}

/**
 * 运行 demo 项目
 * @param {string} demoName - demo 名称
 * @returns {Promise<void>}
 */
async function runDemo(demoName) {
  const demoPath = path.join(demosDir, demoName);
  
  // 验证 demo 是否存在
  if (!await fs.pathExists(demoPath)) {
    throw new Error(`Demo "${demoName}" not found at ${demoPath}`);
  }
  
  console.log(chalk.blue(`\n🚀 Running demo: ${demoName}`));
  console.log(chalk.gray(`   Location: ${demoPath}\n`));
  
  // 检查是否已安装依赖
  const nodeModulesPath = path.join(demoPath, 'node_modules');
  if (!await fs.pathExists(nodeModulesPath)) {
    console.log(chalk.yellow('   Installing dependencies...'));
    console.log(chalk.gray('   This may take a while...\n'));
    
    const installProcess = spawn('pnpm', ['install'], {
      cwd: demoPath,
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve, reject) => {
      installProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pnpm install failed with code ${code}`));
        }
      });
    });
    
    console.log(chalk.green('\n   ✓ Dependencies installed\n'));
  }
  
  // 读取 package.json 确定启动命令
  const packageJsonPath = path.join(demoPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  let startCommand = 'dev';
  if (packageJson.scripts) {
    if (packageJson.scripts.dev) {
      startCommand = 'dev';
    } else if (packageJson.scripts.start) {
      startCommand = 'start';
    }
  }
  
  console.log(chalk.blue(`   Starting demo with: pnpm ${startCommand}`));
  console.log(chalk.gray('   Press Ctrl+C to stop\n'));
  
  // 启动 demo
  const demoProcess = spawn('pnpm', [startCommand], {
    cwd: demoPath,
    stdio: 'inherit',
    shell: true
  });
  
  // 处理退出
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⚠️  Stopping demo...\n'));
    demoProcess.kill('SIGINT');
    process.exit(0);
  });
  
  return new Promise((resolve, reject) => {
    demoProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Demo exited with code ${code}`));
      }
    });
  });
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const demoName = args[0];

  console.log(chalk.bold.blue('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║         Demo Runner                                        ║'));
  console.log(chalk.bold.blue('╚════════════════════════════════════════════════════════════╝'));

  try {
    // 1. 检查是否有可用的 demos
    const demos = await getAvailableDemos();
    
    if (demos.length === 0) {
      console.log(chalk.yellow('\n⚠️  No demos found!'));
      console.log(chalk.gray('\nTo create a demo, run:'));
      console.log(chalk.cyan('   pnpm demo:copy <template-name>\n'));
      process.exit(1);
    }
    
    // 2. 选择要运行的 demo
    let selectedDemo = demoName;
    
    if (!selectedDemo) {
      selectedDemo = await selectDemo(demos);
    } else if (!demos.includes(selectedDemo)) {
      console.log(chalk.red(`\n❌ Demo "${selectedDemo}" not found!`));
      console.log(chalk.gray('\nAvailable demos:'));
      demos.forEach(demo => console.log(chalk.cyan(`   • ${demo}`)));
      console.log();
      process.exit(1);
    }
    
    // 3. 检查并启动 API 服务器
    const apiRunning = await isAPIServerRunning();
    
    if (!apiRunning) {
      console.log(chalk.yellow('⚠️  API server is not running'));
      await startAPIServer();
    } else {
      console.log(chalk.green('✓ API server is already running at http://localhost:3001\n'));
    }
    
    // 4. 运行 demo
    await runDemo(selectedDemo);

  } catch (error) {
    console.error(chalk.red.bold(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Unexpected error:'), error);
    process.exit(1);
  });
}

module.exports = {
  isAPIServerRunning,
  startAPIServer,
  getAvailableDemos,
  runDemo
};
