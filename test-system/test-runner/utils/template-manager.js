const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * TemplateManager - 管理测试项目模板的创建、复制和清理
 */
class TemplateManager {
  constructor(config, rootDir = null) {
    // 如果提供了 rootDir，使用它作为基准；否则使用当前工作目录
    const baseRoot = rootDir || process.cwd();
    
    // 如果配置路径是相对路径，则相对于 rootDir 解析
    this.baseDir = path.isAbsolute(config.templates.baseDir) 
      ? config.templates.baseDir 
      : path.resolve(baseRoot, config.templates.baseDir);
      
    this.tempDir = path.isAbsolute(config.templates.tempDir)
      ? config.templates.tempDir
      : path.resolve(baseRoot, config.templates.tempDir);
  }

  /**
   * 复制模板到临时目录
   * @param {string} templateName - 模板名称
   * @param {string} targetDir - 目标目录（可选，默认使用 tempDir/templateName）
   * @param {boolean} cleanFirst - 是否先清理已存在的目录（默认 true）
   * @returns {Promise<string>} 临时目录路径
   */
  async copyTemplate(templateName, targetDir = null, cleanFirst = true) {
    const sourcePath = path.join(this.baseDir, templateName);
    
    // 验证模板是否存在
    if (!await fs.pathExists(sourcePath)) {
      throw new Error(`Template "${templateName}" not found at ${sourcePath}`);
    }

    // 确定目标路径
    const destPath = targetDir || path.join(this.tempDir, templateName);
    
    try {
      // 确保临时目录存在
      await fs.ensureDir(path.dirname(destPath));
      
      // 如果目标目录已存在，先清理（如果 cleanFirst 为 true）
      if (await fs.pathExists(destPath)) {
        if (cleanFirst) {
          console.log(chalk.yellow(`Cleaning existing directory: ${destPath}`));
          await fs.remove(destPath);
        } else {
          console.log(chalk.yellow(`Directory already exists, skipping: ${destPath}`));
          return destPath;
        }
      }
      
      // 复制模板
      console.log(chalk.blue(`Copying template "${templateName}" to ${destPath}`));
      await fs.copy(sourcePath, destPath, {
        // 过滤掉 node_modules 和其他不需要的文件
        filter: (src) => {
          const relativePath = path.relative(sourcePath, src);
          return !relativePath.includes('node_modules') && 
                 !relativePath.includes('.git');
        }
      });
      
      console.log(chalk.green(`✓ Template "${templateName}" copied successfully`));
      return destPath;
    } catch (error) {
      throw new Error(`Failed to copy template "${templateName}": ${error.message}`);
    }
  }

  /**
   * 清理临时测试目录
   * @param {string} dir - 要清理的目录
   * @returns {Promise<void>}
   */
  async cleanup(dir) {
    try {
      if (await fs.pathExists(dir)) {
        console.log(chalk.blue(`Cleaning up directory: ${dir}`));
        await fs.remove(dir);
        console.log(chalk.green(`✓ Directory cleaned up successfully`));
      }
    } catch (error) {
      console.error(chalk.red(`Failed to cleanup directory "${dir}": ${error.message}`));
      // 不抛出错误，清理失败不应该中断测试流程
    }
  }

  /**
   * 清理所有临时目录
   * @returns {Promise<void>}
   */
  async cleanupAll() {
    try {
      if (await fs.pathExists(this.tempDir)) {
        console.log(chalk.blue(`Cleaning up all temporary directories in: ${this.tempDir}`));
        await fs.remove(this.tempDir);
        console.log(chalk.green(`✓ All temporary directories cleaned up`));
      }
    } catch (error) {
      console.error(chalk.red(`Failed to cleanup temp directory: ${error.message}`));
    }
  }

  /**
   * 获取所有可用模板
   * @returns {Promise<Array<string>>} 模板名称列表
   */
  async getAvailableTemplates() {
    try {
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
      
      // 过滤出目录，排除隐藏文件和特殊文件
      const templates = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name);
      
      return templates;
    } catch (error) {
      throw new Error(`Failed to read templates directory: ${error.message}`);
    }
  }

  /**
   * 读取模板配置
   * @param {string} templateName - 模板名称
   * @returns {Promise<Object>} 模板配置对象
   */
  async getTemplateConfig(templateName) {
    const configPath = path.join(this.baseDir, templateName, 'template-config.json');
    
    try {
      if (!await fs.pathExists(configPath)) {
        throw new Error(`Template config not found: ${configPath}`);
      }
      
      const config = await fs.readJson(configPath);
      return config;
    } catch (error) {
      throw new Error(`Failed to read template config for "${templateName}": ${error.message}`);
    }
  }

  /**
   * 获取所有模板及其配置
   * @returns {Promise<Array<Object>>} 模板配置数组
   */
  async getAllTemplatesWithConfig() {
    const templates = await this.getAvailableTemplates();
    const configs = [];
    
    for (const templateName of templates) {
      try {
        const config = await this.getTemplateConfig(templateName);
        configs.push(config);
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not load config for template "${templateName}": ${error.message}`));
      }
    }
    
    return configs;
  }

  /**
   * 验证模板结构
   * @param {string} templateName - 模板名称
   * @returns {Promise<Object>} 验证结果 { valid: boolean, errors: Array<string> }
   */
  async validateTemplate(templateName) {
    const errors = [];
    const templatePath = path.join(this.baseDir, templateName);
    
    // 检查模板目录是否存在
    if (!await fs.pathExists(templatePath)) {
      errors.push(`Template directory does not exist: ${templatePath}`);
      return { valid: false, errors };
    }
    
    // 检查配置文件
    const configPath = path.join(templatePath, 'template-config.json');
    if (!await fs.pathExists(configPath)) {
      errors.push('Missing template-config.json');
    } else {
      try {
        const config = await fs.readJson(configPath);
        
        // 验证必需字段
        const requiredFields = ['name', 'framework', 'hasServiceWorker', 'hasWorkbox', 'hasPrefetch', 'entryFile', 'publicDir'];
        for (const field of requiredFields) {
          if (!(field in config)) {
            errors.push(`Missing required field in config: ${field}`);
          }
        }
      } catch (error) {
        errors.push(`Invalid template-config.json: ${error.message}`);
      }
    }
    
    // 检查 package.json
    const packagePath = path.join(templatePath, 'package.json');
    if (!await fs.pathExists(packagePath)) {
      errors.push('Missing package.json');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = TemplateManager;
