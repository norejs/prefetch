#!/usr/bin/env node

/**
 * CDN 集成测试脚本
 * 测试两个演示项目是否能正确通过 CDN 引入 prefetch-worker
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

class CDNIntegrationTester {
  constructor() {
    this.devServerProcess = null;
    this.testResults = {
      devServer: false,
      importScriptsDemo: false,
      esmDemo: false
    };
  }

  async runTests() {
    console.log('🧪 开始 CDN 集成测试...\n');

    try {
      // 1. 检查开发服务器
      await this.testDevServer();
      
      // 2. 测试 importscripts-basic 演示
      await this.testImportScriptsDemo();
      
      // 3. 测试 sw-esm-test 演示
      await this.testESMDemo();
      
      // 4. 输出测试结果
      this.printResults();
      
    } catch (error) {
      console.error('❌ 测试过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  async testDevServer() {
    console.log('1️⃣ 测试 prefetch-worker 开发服务器...');
    
    try {
      // 测试健康检查端点
      const healthCheck = await this.httpRequest('http://localhost:18003/health');
      if (healthCheck.status === 'ok') {
        console.log('   ✅ 开发服务器运行正常');
        this.testResults.devServer = true;
      }
      
      // 测试 service-worker.js 文件
      const swFile = await this.httpRequest('http://localhost:18003/service-worker.js', false);
      if (swFile && swFile.includes('prefetch-worker')) {
        console.log('   ✅ service-worker.js 文件可访问');
      }
      
      // 测试 service-worker.esm.js 文件
      const esmFile = await this.httpRequest('http://localhost:18003/service-worker.esm.js', false);
      if (esmFile && esmFile.includes('export')) {
        console.log('   ✅ service-worker.esm.js 文件可访问');
      }
      
    } catch (error) {
      console.log('   ❌ 开发服务器不可用:', error.message);
      console.log('   💡 请先启动开发服务器: cd packages/prefetch-worker && npm run dev');
    }
    
    console.log('');
  }

  async testImportScriptsDemo() {
    console.log('2️⃣ 测试 importscripts-basic 演示...');
    
    try {
      const fs = require('fs');
      
      // 检查 package.json 文件
      const packagePath = path.join(__dirname, 'importscripts-basic', 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (packageContent.name === '@norejs/demo-importscripts-basic') {
          console.log('   ✅ package.json 配置正确');
        }
        if (packageContent.scripts && packageContent.scripts.dev) {
          console.log('   ✅ npm dev 脚本配置正确');
        }
      }
      
      // 检查 service-worker.js 文件中的 CDN 引用
      const swPath = path.join(__dirname, 'importscripts-basic', 'service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (swContent.includes('http://localhost:18003/service-worker.js')) {
        console.log('   ✅ service-worker.js 包含正确的 CDN 引用');
        this.testResults.importScriptsDemo = true;
      } else {
        console.log('   ❌ service-worker.js 未包含 CDN 引用');
      }
      
      // 检查旧的 server.js 文件是否已删除
      const oldServerPath = path.join(__dirname, 'importscripts-basic', 'server.js');
      if (!fs.existsSync(oldServerPath)) {
        console.log('   ✅ 旧的 server.js 文件已删除');
      } else {
        console.log('   ⚠️  旧的 server.js 文件仍存在');
      }
      
      // 检查本地 prefetch-worker.js 文件是否已删除
      const localPrefetchPath = path.join(__dirname, 'importscripts-basic', 'prefetch-worker.js');
      if (!fs.existsSync(localPrefetchPath)) {
        console.log('   ✅ 本地 prefetch-worker.js 文件已删除');
      } else {
        console.log('   ⚠️  本地 prefetch-worker.js 文件仍存在');
      }
      
    } catch (error) {
      console.log('   ❌ 检查失败:', error.message);
    }
    
    console.log('');
  }

  async testESMDemo() {
    console.log('3️⃣ 测试 sw-esm-test 演示...');
    
    try {
      const fs = require('fs');
      
      // 检查 package.json 文件
      const packagePath = path.join(__dirname, 'sw-esm-test', 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (packageContent.name === '@norejs/demo-sw-esm-test') {
          console.log('   ✅ package.json 配置正确');
        }
        if (packageContent.scripts && packageContent.scripts.dev) {
          console.log('   ✅ npm dev 脚本配置正确');
        }
      }
      
      // 检查 sw-module.js 文件中的 CDN 引用
      const swPath = path.join(__dirname, 'sw-esm-test', 'sw-module.js');
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (swContent.includes('http://localhost:18003/service-worker.esm.js')) {
        console.log('   ✅ sw-module.js 包含正确的 CDN 引用');
        this.testResults.esmDemo = true;
      } else {
        console.log('   ❌ sw-module.js 未包含 CDN 引用');
      }
      
      // 检查旧的 server.js 文件是否已删除
      const oldServerPath = path.join(__dirname, 'sw-esm-test', 'server.js');
      if (!fs.existsSync(oldServerPath)) {
        console.log('   ✅ 旧的 server.js 文件已删除');
      } else {
        console.log('   ⚠️  旧的 server.js 文件仍存在');
      }
      
      // 检查本地 prefetch-worker.js 文件是否已删除
      const localPrefetchPath = path.join(__dirname, 'sw-esm-test', 'modules', 'prefetch-worker.js');
      if (!fs.existsSync(localPrefetchPath)) {
        console.log('   ✅ 本地 modules/prefetch-worker.js 文件已删除');
      } else {
        console.log('   ⚠️  本地 modules/prefetch-worker.js 文件仍存在');
      }
      
    } catch (error) {
      console.log('   ❌ 检查失败:', error.message);
    }
    
    console.log('');
  }

  printResults() {
    console.log('📊 测试结果汇总:');
    console.log('================');
    
    const results = [
      { name: 'prefetch-worker 开发服务器', status: this.testResults.devServer },
      { name: 'importscripts-basic CDN 集成', status: this.testResults.importScriptsDemo },
      { name: 'sw-esm-test CDN 集成', status: this.testResults.esmDemo }
    ];
    
    results.forEach(result => {
      const icon = result.status ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
    });
    
    const allPassed = results.every(r => r.status);
    
    console.log('\n' + '='.repeat(50));
    
    if (allPassed) {
      console.log('🎉 所有测试通过！CDN 集成配置正确。');
      console.log('\n📝 下一步:');
      console.log('1. 启动 prefetch-worker 开发服务器: cd packages/prefetch-worker && npm run dev');
      console.log('2. 启动演示项目:');
      console.log('   - ImportScripts: cd demos/importscripts-basic && npm install && npm run dev');
      console.log('   - ESM Test: cd demos/sw-esm-test && npm install && npm run dev');
      console.log('3. 在浏览器中测试功能');
    } else {
      console.log('⚠️  部分测试失败，请检查配置。');
      
      if (!this.testResults.devServer) {
        console.log('\n💡 开发服务器问题:');
        console.log('   请确保 prefetch-worker 开发服务器正在运行');
        console.log('   命令: cd packages/prefetch-worker && npm run dev');
      }
      
      if (!this.testResults.importScriptsDemo || !this.testResults.esmDemo) {
        console.log('\n💡 CDN 引用问题:');
        console.log('   请检查演示项目中的 CDN 引用是否正确');
      }
    }
  }

  httpRequest(url, parseJson = true) {
    return new Promise((resolve, reject) => {
      const request = http.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            if (parseJson) {
              resolve(JSON.parse(data));
            } else {
              resolve(data);
            }
          } catch (error) {
            if (parseJson) {
              reject(new Error('Invalid JSON response'));
            } else {
              resolve(data);
            }
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(5000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }
}

// 运行测试
if (require.main === module) {
  const tester = new CDNIntegrationTester();
  tester.runTests().catch(console.error);
}

module.exports = CDNIntegrationTester;