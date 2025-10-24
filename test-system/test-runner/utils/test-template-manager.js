#!/usr/bin/env node

/**
 * 简单的测试脚本来验证 TemplateManager 功能
 */

const TemplateManager = require('./template-manager');
const config = require('../../test-config');
const chalk = require('chalk');
const path = require('path');

async function testTemplateManager() {
  console.log(chalk.bold.blue('\n=== Testing TemplateManager ===\n'));
  
  // 获取 test-system 目录的绝对路径
  const testSystemRoot = path.resolve(__dirname, '../..');
  const manager = new TemplateManager(config, testSystemRoot);
  
  try {
    // 测试 1: 获取所有可用模板
    console.log(chalk.bold('Test 1: Get Available Templates'));
    const templates = await manager.getAvailableTemplates();
    console.log(chalk.green(`✓ Found ${templates.length} templates:`));
    templates.forEach(t => console.log(`  - ${t}`));
    console.log();
    
    // 测试 2: 读取模板配置
    console.log(chalk.bold('Test 2: Get Template Configs'));
    const configs = await manager.getAllTemplatesWithConfig();
    console.log(chalk.green(`✓ Loaded ${configs.length} template configs`));
    configs.forEach(c => {
      console.log(`  - ${c.name}: ${c.framework} (SW: ${c.hasServiceWorker}, Workbox: ${c.hasWorkbox}, Prefetch: ${c.hasPrefetch})`);
    });
    console.log();
    
    // 测试 3: 验证模板结构
    console.log(chalk.bold('Test 3: Validate Templates'));
    for (const templateName of templates) {
      const validation = await manager.validateTemplate(templateName);
      if (validation.valid) {
        console.log(chalk.green(`  ✓ ${templateName} is valid`));
      } else {
        console.log(chalk.red(`  ✗ ${templateName} has errors:`));
        validation.errors.forEach(err => console.log(chalk.red(`    - ${err}`)));
      }
    }
    console.log();
    
    // 测试 4: 复制模板
    console.log(chalk.bold('Test 4: Copy Template'));
    const testTemplate = templates[0];
    const tempPath = await manager.copyTemplate(testTemplate);
    console.log(chalk.green(`✓ Template copied to: ${tempPath}`));
    console.log();
    
    // 测试 5: 清理
    console.log(chalk.bold('Test 5: Cleanup'));
    await manager.cleanup(tempPath);
    console.log();
    
    console.log(chalk.bold.green('\n=== All Tests Passed! ===\n'));
    
  } catch (error) {
    console.error(chalk.bold.red('\n=== Test Failed ==='));
    console.error(chalk.red(error.message));
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testTemplateManager();
