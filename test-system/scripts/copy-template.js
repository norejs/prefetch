#!/usr/bin/env node

/**
 * 复制测试模板到 demos 目录用于手动测试
 * 
 * 使用方法:
 *   node scripts/copy-template.js <template-name>
 *   node scripts/copy-template.js react-cra-no-sw
 *   node scripts/copy-template.js all  # 复制所有模板
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');
const templatesDir = path.join(rootDir, 'templates');
const demosDir = path.join(rootDir, 'demos');
const apiServerSource = path.join(rootDir, 'api-server');

/**
 * 复制模板到 demos 目录
 * @param {string} templateName - 模板名称
 * @returns {Promise<void>}
 */
async function copyTemplate(templateName) {
  const sourcePath = path.join(templatesDir, templateName);
  const destPath = path.join(demosDir, templateName);

  // 验证模板是否存在
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`Template "${templateName}" not found at ${sourcePath}`);
  }

  console.log(chalk.blue(`\n📋 Copying template: ${templateName}`));

  try {
    // 如果目标目录已存在，询问是否覆盖
    if (await fs.pathExists(destPath)) {
      console.log(chalk.yellow(`⚠️  Directory already exists: ${destPath}`));
      console.log(chalk.yellow('   Removing existing directory...'));
      await fs.remove(destPath);
    }

    // 复制模板
    console.log(chalk.blue(`   Copying from: ${sourcePath}`));
    console.log(chalk.blue(`   Copying to:   ${destPath}`));
    
    await fs.copy(sourcePath, destPath, {
      filter: (src) => {
        const relativePath = path.relative(sourcePath, src);
        // 排除 node_modules 和 .git
        return !relativePath.includes('node_modules') && 
               !relativePath.includes('.git');
      }
    });

    console.log(chalk.green(`   ✓ Template copied successfully`));

    // 读取模板配置
    const configPath = path.join(destPath, 'template-config.json');
    let templateConfig = {};
    if (await fs.pathExists(configPath)) {
      templateConfig = await fs.readJson(configPath);
    }

    // 更新 package.json 添加 workspace 依赖
    await updatePackageJson(destPath);

    // 显示下一步操作
    console.log(chalk.cyan(`\n📝 Next steps:`));
    console.log(chalk.gray(`   1. cd test-system/demos/${templateName}`));
    console.log(chalk.gray(`   2. pnpm install  # 自动使用 workspace 依赖`));
    console.log(chalk.gray(`   3. pnpm dev      # or npm start`));
    console.log(chalk.gray(`   4. Open http://localhost:3000 in browser\n`));

    return destPath;
  } catch (error) {
    throw new Error(`Failed to copy template "${templateName}": ${error.message}`);
  }
}

/**
 * 更新 package.json 添加 workspace 依赖
 * @param {string} projectDir - 项目目录
 * @returns {Promise<void>}
 */
async function updatePackageJson(projectDir) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    console.log(chalk.yellow('   ⚠️  No package.json found, skipping dependency update'));
    return;
  }

  try {
    const packageJson = await fs.readJson(packageJsonPath);
    
    // 添加 workspace 依赖
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // 添加或更新 prefetch 依赖为 workspace 版本
    packageJson.dependencies['@norejs/prefetch'] = 'workspace:*';
    packageJson.dependencies['@norejs/prefetch-worker'] = 'workspace:*';
    
    // 保存更新后的 package.json
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    console.log(chalk.green(`   ✓ Updated package.json with workspace dependencies`));
  } catch (error) {
    console.log(chalk.yellow(`   ⚠️  Failed to update package.json: ${error.message}`));
  }
}

/**
 * 显示 API 服务器信息
 * @returns {void}
 */
function showAPIServerInfo() {
  console.log(chalk.blue(`\n🌐 API Server`));
  console.log(chalk.gray(`   Location: test-system/api-server/`));
  console.log(chalk.gray(`   No need to copy - use the original location\n`));
  
  console.log(chalk.cyan(`📝 To start API server:`));
  console.log(chalk.gray(`   1. cd test-system/api-server`));
  console.log(chalk.gray(`   2. npm install`));
  console.log(chalk.gray(`   3. npm start`));
  console.log(chalk.gray(`   4. API will be available at http://localhost:18001\n`));
}

/**
 * 获取所有可用模板
 * @returns {Promise<Array<string>>}
 */
async function getAvailableTemplates() {
  try {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
  } catch (error) {
    throw new Error(`Failed to read templates directory: ${error.message}`);
  }
}

/**
 * 显示可用模板列表
 * @returns {Promise<void>}
 */
async function listTemplates() {
  console.log(chalk.bold.blue('\n📦 Available Templates:\n'));
  
  const templates = await getAvailableTemplates();
  
  for (const templateName of templates) {
    const configPath = path.join(templatesDir, templateName, 'template-config.json');
    let description = '';
    
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      const framework = config.framework || 'unknown';
      const hasSW = config.hasServiceWorker ? 'with SW' : 'no SW';
      const hasWorkbox = config.hasWorkbox ? ', Workbox' : '';
      const hasPrefetch = config.hasPrefetch ? ', Prefetch' : '';
      description = `${framework} (${hasSW}${hasWorkbox}${hasPrefetch})`;
    }
    
    console.log(chalk.cyan(`   • ${templateName}`));
    if (description) {
      console.log(chalk.gray(`     ${description}`));
    }
  }
  
  console.log(chalk.gray(`\n💡 Usage: node scripts/copy-template.js <template-name>`));
  console.log(chalk.gray(`   Example: node scripts/copy-template.js react-cra-no-sw\n`));
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const templateName = args[0];

  console.log(chalk.bold.blue('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║         Template Copy Tool                                 ║'));
  console.log(chalk.bold.blue('╚════════════════════════════════════════════════════════════╝'));

  try {
    // 如果没有参数，显示帮助
    if (!templateName) {
      await listTemplates();
      return;
    }

    // 如果参数是 'list'，显示模板列表
    if (templateName === 'list') {
      await listTemplates();
      return;
    }

    // 如果参数是 'all'，复制所有模板
    if (templateName === 'all') {
      const templates = await getAvailableTemplates();
      console.log(chalk.blue(`\n📦 Copying all ${templates.length} templates...\n`));
      
      // 复制所有模板
      for (const template of templates) {
        await copyTemplate(template);
      }
      
      // 显示 API 服务器信息
      showAPIServerInfo();
      
      console.log(chalk.green.bold(`\n✅ All templates copied successfully!`));
      console.log(chalk.gray(`\n📁 Templates location: ${demosDir}\n`));
      return;
    }

    // 复制指定的模板
    await copyTemplate(templateName);
    
    // 显示 API 服务器信息
    showAPIServerInfo();

    console.log(chalk.green.bold(`\n✅ Template copied successfully!`));
    console.log(chalk.gray(`\n📁 Location: ${path.join(demosDir, templateName)}\n`));

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
  copyTemplate,
  getAvailableTemplates,
  listTemplates,
  updatePackageJson
};
