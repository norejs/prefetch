/**
 * File Injector Module
 * 
 * Injects registration code into the application entry file.
 * For simplicity, we append code to the end of the file rather than using AST.
 */

const path = require('path');
const { fileExists, readFile, writeFile } = require('../utils/file-utils');

class FileInjector {
  constructor(rootDir, frameworkInfo) {
    this.rootDir = rootDir;
    this.frameworkInfo = frameworkInfo;
  }
  
  /**
   * Locate the application entry file
   * @returns {Promise<string|null>}
   */
  async locateEntryFile() {
    const entryFiles = this.frameworkInfo.entryFiles || [];
    
    // Try each potential entry file
    for (const entryFile of entryFiles) {
      const filePath = path.join(this.rootDir, entryFile);
      
      if (await fileExists(filePath)) {
        return filePath;
      }
    }
    
    // If no entry file found, return null
    return null;
  }
  
  /**
   * Check if registration code already exists
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async hasRegistrationCode(filePath) {
    try {
      const content = await readFile(filePath);
      
      // Check for Service Worker registration patterns
      const patterns = [
        'navigator.serviceWorker.register',
        'serviceWorker.register',
        'service-worker.js',
        'sw.js'
      ];
      
      return patterns.some(pattern => content.includes(pattern));
      
    } catch (error) {
      throw new Error(`Failed to check registration code: ${error.message}`);
    }
  }
  
  /**
   * Inject registration code into entry file
   * @param {string} filePath
   * @param {string} code
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async inject(filePath, code, options = {}) {
    const { dryRun = false } = options;
    
    if (dryRun) {
      console.log(`  [DRY RUN] Would inject registration code into: ${path.relative(this.rootDir, filePath)}`);
      return;
    }
    
    try {
      // Read existing content
      const existingContent = await readFile(filePath);
      
      // Check if already has registration code
      if (await this.hasRegistrationCode(filePath)) {
        console.log(`  ℹ️  Entry file already has Service Worker registration code`);
        return;
      }
      
      // Prepare injection marker
      const marker = '\n\n// Service Worker Registration - Added by @norejs/prefetch-migrate\n';
      
      // Append registration code
      const newContent = existingContent + marker + code + '\n';
      
      // Write updated file
      await writeFile(filePath, newContent);
      
    } catch (error) {
      throw new Error(`Failed to inject code: ${error.message}`);
    }
  }
  
  /**
   * Generate instruction for manual registration
   * @param {string} registrationCode
   * @returns {string}
   */
  generateManualInstructions(registrationCode) {
    const framework = this.frameworkInfo.name;
    const entryFiles = this.frameworkInfo.entryFiles || [];
    
    let instructions = '\n📝 Manual Registration Required\n\n';
    instructions += 'Could not automatically inject Service Worker registration code.\n';
    instructions += 'Please add the following code to your application entry file:\n\n';
    
    if (entryFiles.length > 0) {
      instructions += `Suggested file(s):\n`;
      entryFiles.forEach(file => {
        instructions += `  - ${file}\n`;
      });
      instructions += '\n';
    }
    
    instructions += 'Registration code:\n';
    instructions += '```javascript\n';
    instructions += registrationCode;
    instructions += '\n```\n';
    
    // Framework-specific tips
    switch (framework) {
      case 'nextjs':
        instructions += '\n💡 Next.js Tips:\n';
        instructions += '  - For App Router: Add to app/layout.tsx in a <Script> tag or useEffect\n';
        instructions += '  - For Pages Router: Add to pages/_app.tsx in useEffect\n';
        instructions += '  - Make sure to use "use client" directive if using App Router\n';
        break;
      
      case 'nuxt':
        instructions += '\n💡 Nuxt Tips:\n';
        instructions += '  - Add to app.vue or a plugin file\n';
        instructions += '  - Wrap in process.client check\n';
        break;
      
      case 'vue-vite':
      case 'vue-cli':
      case 'vue':
        instructions += '\n💡 Vue Tips:\n';
        instructions += '  - Add to src/main.ts or src/main.js\n';
        instructions += '  - Place after app.mount() call\n';
        break;
      
      case 'cra':
      case 'react-vite':
      case 'react':
        instructions += '\n💡 React Tips:\n';
        instructions += '  - Add to src/index.tsx or src/index.js\n';
        instructions += '  - Place after ReactDOM.render() or root.render() call\n';
        break;
    }
    
    return instructions;
  }
}

module.exports = FileInjector;
