/**
 * Service Worker Manager Module
 * 
 * Manages Service Worker files:
 * - Scans for existing SW files
 * - Creates new SW files
 * - Updates existing SW files with Prefetch integration
 */

const path = require('path');
const fs = require('fs').promises;
const { fileExists, readFile, writeFile } = require('../utils/file-utils');

class SWManager {
  constructor(rootDir, frameworkInfo) {
    this.rootDir = rootDir;
    this.frameworkInfo = frameworkInfo;
    
    // Common Service Worker file patterns
    this.filePatterns = [
      'service-worker.js',
      'sw.js',
      'worker.js',
      'serviceworker.js'
    ];
    
    // Common directories to search
    this.searchDirs = [
      frameworkInfo.publicDir || 'public',
      'src',
      'static',
      'assets',
      '.'
    ];
  }
  
  /**
   * Scan for existing Service Worker files
   * @returns {Promise<Array<Object>>}
   */
  async scan() {
    const foundFiles = [];
    
    // Search in common directories
    for (const dir of this.searchDirs) {
      const dirPath = path.join(this.rootDir, dir);
      
      // Check if directory exists
      try {
        await fs.access(dirPath);
      } catch {
        continue; // Directory doesn't exist, skip
      }
      
      // Check for each file pattern
      for (const pattern of this.filePatterns) {
        const filePath = path.join(dirPath, pattern);
        
        if (await fileExists(filePath)) {
          // Calculate confidence score based on file content
          const confidence = await this._calculateConfidence(filePath);
          
          foundFiles.push({
            path: filePath,
            relativePath: path.relative(this.rootDir, filePath),
            name: pattern,
            directory: dir,
            confidence
          });
        }
      }
    }
    
    // Sort by confidence (highest first)
    foundFiles.sort((a, b) => b.confidence - a.confidence);
    
    return foundFiles;
  }
  
  /**
   * Calculate confidence score that a file is a Service Worker
   * @private
   */
  async _calculateConfidence(filePath) {
    try {
      const content = await readFile(filePath);
      let score = 0.5; // Base score
      
      // Check for Service Worker characteristics
      if (content.includes('self.addEventListener')) score += 0.2;
      if (content.includes('fetch')) score += 0.1;
      if (content.includes('install')) score += 0.1;
      if (content.includes('activate')) score += 0.1;
      
      return Math.min(score, 1.0);
    } catch {
      return 0.5;
    }
  }
  
  /**
   * Check if SW has Prefetch integration
   * @param {string} filePath
   * @returns {Promise<Object>}
   */
  async checkIntegration(filePath) {
    try {
      const content = await readFile(filePath);
      
      // Check for Prefetch integration marker
      const hasPrefetch = content.includes('Prefetch Worker Integration');
      
      if (!hasPrefetch) {
        return {
          integrated: false,
          version: null,
          generatedAt: null
        };
      }
      
      // Extract version information
      const versionMatch = content.match(/Version:\s*([\d\w.-]+)/);
      const version = versionMatch ? versionMatch[1] : null;
      
      // Extract generation timestamp
      const timestampMatch = content.match(/Generated:\s*(.+)/);
      const generatedAt = timestampMatch ? timestampMatch[1] : null;
      
      return {
        integrated: true,
        version,
        generatedAt
      };
      
    } catch (error) {
      throw new Error(`Failed to check integration: ${error.message}`);
    }
  }
  
  /**
   * Create new Service Worker file
   * @param {Object} config
   * @param {Object} options
   * @returns {Promise<string>}
   */
  async create(config, options = {}) {
    const { dryRun = false } = options;
    
    // Determine output path
    const publicDir = this.frameworkInfo.publicDir || 'public';
    const outputPath = path.join(this.rootDir, publicDir, 'service-worker.js');
    
    if (dryRun) {
      console.log(`  [DRY RUN] Would create Service Worker at: ${path.relative(this.rootDir, outputPath)}`);
      return outputPath;
    }
    
    // Generate Service Worker code
    const CodeGenerator = require('./code-generator');
    const generator = new CodeGenerator(this.frameworkInfo, config);
    const swCode = generator.generateServiceWorker(options);
    
    // Write file
    await writeFile(outputPath, swCode);
    
    return outputPath;
  }
  
  /**
   * Update existing Service Worker file
   * @param {string} filePath
   * @param {Object} config
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async update(filePath, config, options = {}) {
    const { dryRun = false } = options;
    
    if (dryRun) {
      console.log(`  [DRY RUN] Would update Service Worker at: ${path.relative(this.rootDir, filePath)}`);
      return;
    }
    
    // Read existing content
    const existingContent = await readFile(filePath);
    
    // Remove old Prefetch integration if exists
    const cleanContent = this._removeOldIntegration(existingContent);
    
    // Generate new integration code
    const CodeGenerator = require('./code-generator');
    const generator = new CodeGenerator(this.frameworkInfo, config);
    const integrationCode = generator.generateIntegrationCode(options);
    
    // Combine content
    const newContent = cleanContent + '\n' + integrationCode;
    
    // Write updated file
    await writeFile(filePath, newContent);
  }
  
  /**
   * Remove old Prefetch integration code
   * @private
   */
  _removeOldIntegration(content) {
    // Remove integration code block
    const pattern = /\/\/ ={40,}\n\/\/ Prefetch Worker Integration[\s\S]*?\/\/ End of Prefetch Worker Integration\n\/\/ ={40,}\n?/g;
    return content.replace(pattern, '').trim();
  }
  
  /**
   * Get recommended Service Worker path
   * @returns {string}
   */
  getRecommendedPath() {
    const publicDir = this.frameworkInfo.publicDir || 'public';
    return path.join(this.rootDir, publicDir, 'service-worker.js');
  }
}

module.exports = SWManager;
