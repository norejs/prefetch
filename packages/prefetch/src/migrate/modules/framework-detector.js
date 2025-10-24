/**
 * Framework Detector Module
 * 
 * Detects the frontend framework used in the project and checks compatibility.
 * 
 * Supported frameworks:
 * - Next.js
 * - Create React App
 * - React + Vite
 * - Vue CLI
 * - Vue + Vite
 * - Nuxt
 * - Remix
 * - Astro
 */

const path = require('path');
const { fileExists, readFile } = require('../utils/file-utils');

class FrameworkDetector {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }
  
  /**
   * Detect the framework used in the project
   * @returns {Promise<FrameworkInfo>}
   */
  async detect() {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    
    // Check if package.json exists
    if (!await fileExists(packageJsonPath)) {
      return {
        name: 'unknown',
        version: null,
        publicDir: 'public',
        buildDir: 'dist',
        detected: false,
        reason: 'No package.json found'
      };
    }
    
    // Read and parse package.json
    let packageJson;
    try {
      const content = await readFile(packageJsonPath);
      packageJson = JSON.parse(content);
    } catch (error) {
      return {
        name: 'unknown',
        version: null,
        publicDir: 'public',
        buildDir: 'dist',
        detected: false,
        reason: 'Failed to parse package.json'
      };
    }
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    // Detect framework based on dependencies
    const frameworkInfo = this._detectFramework(dependencies);
    
    return {
      ...frameworkInfo,
      detected: true,
      packageJson
    };
  }
  
  /**
   * Detect framework from dependencies
   * @private
   */
  _detectFramework(dependencies) {
    // Next.js
    if (dependencies['next']) {
      return {
        name: 'nextjs',
        version: dependencies['next'],
        publicDir: 'public',
        buildDir: '.next',
        entryFiles: ['app/layout.tsx', 'app/layout.js', 'pages/_app.tsx', 'pages/_app.js'],
        description: 'Next.js'
      };
    }
    
    // Nuxt
    if (dependencies['nuxt']) {
      return {
        name: 'nuxt',
        version: dependencies['nuxt'],
        publicDir: 'public',
        buildDir: '.nuxt',
        entryFiles: ['app.vue', 'nuxt.config.ts', 'nuxt.config.js'],
        description: 'Nuxt'
      };
    }
    
    // Remix
    if (dependencies['@remix-run/react'] || dependencies['@remix-run/node']) {
      return {
        name: 'remix',
        version: dependencies['@remix-run/react'] || dependencies['@remix-run/node'],
        publicDir: 'public',
        buildDir: 'build',
        entryFiles: ['app/root.tsx', 'app/root.jsx'],
        description: 'Remix'
      };
    }
    
    // Astro
    if (dependencies['astro']) {
      return {
        name: 'astro',
        version: dependencies['astro'],
        publicDir: 'public',
        buildDir: 'dist',
        entryFiles: ['src/pages/index.astro'],
        description: 'Astro'
      };
    }
    
    // React-based frameworks
    if (dependencies['react'] || dependencies['react-dom']) {
      // Create React App
      if (dependencies['react-scripts']) {
        return {
          name: 'cra',
          version: dependencies['react-scripts'],
          publicDir: 'public',
          buildDir: 'build',
          entryFiles: ['src/index.tsx', 'src/index.js'],
          description: 'Create React App'
        };
      }
      
      // React + Vite
      if (dependencies['vite']) {
        return {
          name: 'react-vite',
          version: dependencies['vite'],
          publicDir: 'public',
          buildDir: 'dist',
          entryFiles: ['src/main.tsx', 'src/main.jsx'],
          description: 'React + Vite'
        };
      }
      
      // Generic React
      return {
        name: 'react',
        version: dependencies['react'],
        publicDir: 'public',
        buildDir: 'build',
        entryFiles: ['src/index.tsx', 'src/index.js', 'src/main.tsx', 'src/main.jsx'],
        description: 'React'
      };
    }
    
    // Vue-based frameworks
    if (dependencies['vue']) {
      // Vue CLI
      if (dependencies['@vue/cli-service']) {
        return {
          name: 'vue-cli',
          version: dependencies['@vue/cli-service'],
          publicDir: 'public',
          buildDir: 'dist',
          entryFiles: ['src/main.ts', 'src/main.js'],
          description: 'Vue CLI'
        };
      }
      
      // Vue + Vite
      if (dependencies['vite']) {
        return {
          name: 'vue-vite',
          version: dependencies['vite'],
          publicDir: 'public',
          buildDir: 'dist',
          entryFiles: ['src/main.ts', 'src/main.js'],
          description: 'Vue 3 + Vite'
        };
      }
      
      // Generic Vue
      return {
        name: 'vue',
        version: dependencies['vue'],
        publicDir: 'public',
        buildDir: 'dist',
        entryFiles: ['src/main.ts', 'src/main.js'],
        description: 'Vue'
      };
    }
    
    // Vite (generic)
    if (dependencies['vite']) {
      return {
        name: 'vite',
        version: dependencies['vite'],
        publicDir: 'public',
        buildDir: 'dist',
        entryFiles: ['src/main.ts', 'src/main.js', 'src/index.ts', 'src/index.js'],
        description: 'Vite'
      };
    }
    
    // Unknown framework
    return {
      name: 'unknown',
      version: null,
      publicDir: 'public',
      buildDir: 'dist',
      entryFiles: ['src/index.ts', 'src/index.js', 'src/main.ts', 'src/main.js'],
      description: 'Unknown framework'
    };
  }
  
  /**
   * Check if the project is compatible with Prefetch migration
   * @param {FrameworkInfo} frameworkInfo
   * @returns {Promise<CompatibilityResult>}
   */
  async checkCompatibility(frameworkInfo) {
    const issues = [];
    const warnings = [];
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (nodeMajorVersion < 16) {
      issues.push({
        type: 'error',
        code: 'NODE_VERSION',
        message: `Node.js version ${nodeVersion} is not supported. Minimum required: 16.0.0`,
        suggestion: 'Please upgrade Node.js to version 16 or higher'
      });
    }
    
    // Check if framework is supported
    const supportedFrameworks = [
      'nextjs', 'cra', 'react-vite', 'react',
      'vue-cli', 'vue-vite', 'vue',
      'nuxt', 'remix', 'astro', 'vite'
    ];
    
    if (!supportedFrameworks.includes(frameworkInfo.name)) {
      warnings.push({
        type: 'warning',
        code: 'UNKNOWN_FRAMEWORK',
        message: `Framework "${frameworkInfo.description}" is not officially supported`,
        suggestion: 'Migration may still work, but has not been tested with this framework'
      });
    }
    
    // Check framework-specific compatibility
    if (frameworkInfo.name === 'nextjs') {
      const version = frameworkInfo.version;
      if (version && version.startsWith('12.')) {
        warnings.push({
          type: 'warning',
          code: 'NEXTJS_VERSION',
          message: 'Next.js 12 is supported but Next.js 13+ is recommended',
          suggestion: 'Consider upgrading to Next.js 13 or higher for better Service Worker support'
        });
      }
    }
    
    // Check if package.json exists
    if (!frameworkInfo.detected) {
      issues.push({
        type: 'error',
        code: 'NO_PACKAGE_JSON',
        message: frameworkInfo.reason || 'Could not detect project framework',
        suggestion: 'Make sure you are running this command in a valid frontend project directory'
      });
    }
    
    const compatible = issues.length === 0;
    
    return {
      compatible,
      issues,
      warnings,
      nodeVersion,
      frameworkInfo
    };
  }
}

module.exports = FrameworkDetector;
