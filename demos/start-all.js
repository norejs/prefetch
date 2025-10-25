#!/usr/bin/env node

/**
 * 启动所有演示项目的脚本
 * 同时启动 prefetch-worker 开发服务器和两个演示项目
 */

const { spawn } = require('child_process');
const path = require('path');

class DemoStarter {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  async startAll() {
    console.log('🚀 启动所有演示项目...\n');

    try {
      // 1. 启动 prefetch-worker 开发服务器
      await this.startPrefetchWorkerDevServer();
      
      // 等待一下让开发服务器完全启动
      await this.sleep(2000);
      
      // 2. 启动 importscripts-basic 演示
      await this.startImportScriptsDemo();
      
      // 3. 启动 sw-esm-test 演示
      await this.startESMDemo();
      
      console.log('\n🎉 所有服务已启动！');
      console.log('📋 访问地址:');
      console.log('  - prefetch-worker 开发服务器: http://localhost:18003');
      console.log('  - ImportScripts 演示: http://localhost:8080');
      console.log('  - ESM 测试演示: http://localhost:8081');
      console.log('\n💡 按 Ctrl+C 停止所有服务');
      
      // 设置优雅关闭
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ 启动失败:', error.message);
      await this.stopAll();
      process.exit(1);
    }
  }

  async startPrefetchWorkerDevServer() {
    console.log('1️⃣ 启动 prefetch-worker 开发服务器...');
    
    const process = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..', 'packages', 'prefetch-worker'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    this.processes.push({
      name: 'prefetch-worker',
      process: process,
      port: 18003
    });

    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server:') || output.includes('started')) {
        console.log('   ✅ prefetch-worker 开发服务器已启动');
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      if (!output.includes('ExperimentalWarning')) {
        console.error('   ❌ prefetch-worker 错误:', output);
      }
    });

    process.on('close', (code) => {
      if (!this.isShuttingDown && code !== 0) {
        console.error(`❌ prefetch-worker 进程退出，代码: ${code}`);
      }
    });
  }

  async startImportScriptsDemo() {
    console.log('2️⃣ 启动 ImportScripts 演示...');
    
    // 先安装依赖
    await this.installDependencies('importscripts-basic');
    
    const process = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'importscripts-basic'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    this.processes.push({
      name: 'importscripts-basic',
      process: process,
      port: 8080
    });

    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('8080')) {
        console.log('   ✅ ImportScripts 演示已启动 (端口 8080)');
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      console.error('   ❌ ImportScripts 错误:', output);
    });

    process.on('close', (code) => {
      if (!this.isShuttingDown && code !== 0) {
        console.error(`❌ ImportScripts 进程退出，代码: ${code}`);
      }
    });
  }

  async startESMDemo() {
    console.log('3️⃣ 启动 ESM 测试演示...');
    
    // 先安装依赖
    await this.installDependencies('sw-esm-test');
    
    const process = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'sw-esm-test'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    this.processes.push({
      name: 'sw-esm-test',
      process: process,
      port: 8081
    });

    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('8081')) {
        console.log('   ✅ ESM 测试演示已启动 (端口 8081)');
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      console.error('   ❌ ESM 测试错误:', output);
    });

    process.on('close', (code) => {
      if (!this.isShuttingDown && code !== 0) {
        console.error(`❌ ESM 测试进程退出，代码: ${code}`);
      }
    });
  }

  async installDependencies(demoName) {
    console.log(`   📦 安装 ${demoName} 依赖...`);
    
    return new Promise((resolve, reject) => {
      const process = spawn('npm', ['install'], {
        cwd: path.join(__dirname, demoName),
        stdio: 'pipe',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`   ✅ ${demoName} 依赖安装完成`);
          resolve();
        } else {
          reject(new Error(`${demoName} 依赖安装失败，代码: ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`${demoName} 依赖安装错误: ${error.message}`));
      });
    });
  }

  setupGracefulShutdown() {
    process.on('SIGINT', async () => {
      console.log('\n🛑 正在关闭所有服务...');
      await this.stopAll();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.stopAll();
      process.exit(0);
    });
  }

  async stopAll() {
    this.isShuttingDown = true;
    
    for (const { name, process } of this.processes) {
      try {
        console.log(`🔄 停止 ${name}...`);
        process.kill('SIGTERM');
        
        // 等待进程优雅关闭
        await this.sleep(1000);
        
        // 如果还没关闭，强制杀死
        if (!process.killed) {
          process.kill('SIGKILL');
        }
        
        console.log(`✅ ${name} 已停止`);
      } catch (error) {
        console.error(`❌ 停止 ${name} 失败:`, error.message);
      }
    }
    
    this.processes = [];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行启动器
if (require.main === module) {
  const starter = new DemoStarter();
  starter.startAll().catch(console.error);
}

module.exports = DemoStarter;