/**
 * Package Installer Module
 * 
 * Handles dependency installation for the Prefetch package.
 * Detects package manager and installs @norejs/prefetch.
 */

const path = require('path');
const { spawn } = require('child_process');
const { fileExists, readFile } = require('../utils/file-utils');

class PackageInstaller {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.packageName = '@norejs/prefetch';
  }
  
  /**
   * Detect the package manager used in the project
   * @returns {Promise<string>} 'npm' | 'yarn' | 'pnpm'
   */
  async detectPackageManager() {
    // Check for lock files
    const pnpmLock = path.join(this.rootDir, 'pnpm-lock.yaml');
    const yarnLock = path.join(this.rootDir, 'yarn.lock');
    const npmLock = path.join(this.rootDir, 'package-lock.json');
    
    if (await fileExists(pnpmLock)) {
      return 'pnpm';
    }
    
    if (await fileExists(yarnLock)) {
      return 'yarn';
    }
    
    if (await fileExists(npmLock)) {
      return 'npm';
    }
    
    // Default to npm if no lock file found
    return 'npm';
  }
  
  /**
   * Check if @norejs/prefetch is already installed
   * @returns {Promise<Object>} { installed: boolean, version: string | null, needsUpdate: boolean }
   */
  async checkInstallation() {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    
    if (!await fileExists(packageJsonPath)) {
      return {
        installed: false,
        version: null,
        needsUpdate: false
      };
    }
    
    try {
      const content = await readFile(packageJsonPath);
      const packageJson = JSON.parse(content);
      
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      const installedVersion = dependencies[this.packageName];
      
      if (!installedVersion) {
        return {
          installed: false,
          version: null,
          needsUpdate: false
        };
      }
      
      // Check if it's a workspace dependency
      const isWorkspace = installedVersion.startsWith('workspace:');
      
      return {
        installed: true,
        version: installedVersion,
        isWorkspace,
        needsUpdate: false // TODO: Implement version comparison
      };
      
    } catch (error) {
      throw new Error(`Failed to check installation: ${error.message}`);
    }
  }
  
  /**
   * Install @norejs/prefetch package
   * @param {string} packageManager
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async install(packageManager, options = {}) {
    const { dryRun = false, verbose = false } = options;
    
    if (dryRun) {
      console.log(`  [DRY RUN] Would install ${this.packageName} using ${packageManager}`);
      return;
    }
    
    return new Promise((resolve, reject) => {
      // Determine install command
      let command, args;
      
      switch (packageManager) {
        case 'pnpm':
          command = 'pnpm';
          args = ['add', this.packageName];
          break;
        
        case 'yarn':
          command = 'yarn';
          args = ['add', this.packageName];
          break;
        
        case 'npm':
        default:
          command = 'npm';
          args = ['install', this.packageName, '--save'];
          break;
      }
      
      console.log(`  Installing ${this.packageName}...`);
      if (verbose) {
        console.log(`  Command: ${command} ${args.join(' ')}`);
      }
      
      // Spawn the install process
      const child = spawn(command, args, {
        cwd: this.rootDir,
        stdio: verbose ? 'inherit' : 'pipe',
        shell: true
      });
      
      let output = '';
      let errorOutput = '';
      
      if (!verbose) {
        child.stdout?.on('data', (data) => {
          output += data.toString();
        });
        
        child.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });
      }
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`  ✓ ${this.packageName} installed successfully`);
          resolve();
        } else {
          const error = new Error(`Installation failed with code ${code}`);
          error.output = output;
          error.errorOutput = errorOutput;
          reject(error);
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`Failed to spawn ${command}: ${error.message}`));
      });
    });
  }
  
  /**
   * Get manual installation command
   * @param {string} packageManager
   * @returns {string}
   */
  getManualInstallCommand(packageManager) {
    switch (packageManager) {
      case 'pnpm':
        return `pnpm add ${this.packageName}`;
      case 'yarn':
        return `yarn add ${this.packageName}`;
      case 'npm':
      default:
        return `npm install ${this.packageName}`;
    }
  }
}

module.exports = PackageInstaller;
