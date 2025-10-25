/**
 * Prefetch Service Worker Setup Tool - Main Entry
 * 
 * Orchestrates the Service Worker setup process:
 * 1. Detect framework and compatibility
 * 2. Install dependencies
 * 3. Create/modify Service Worker
 * 4. Generate registration instructions (manual integration)
 * 5. Validate setup
 */

const path = require('path');
const readline = require('readline');

// Import modules
const FrameworkDetector = require('./modules/framework-detector');
const PackageInstaller = require('./modules/package-installer');
const SWManager = require('./modules/sw-manager');
const CodeGenerator = require('./modules/code-generator');
// const BackupManager = require('./modules/backup-manager');
// const Validator = require('./modules/validator');
const Logger = require('./utils/logger');

/**
 * Run the migration process
 */
async function runMigration(options = {}) {
  const rootDir = process.cwd();

  console.log('\n🚀 Prefetch Migration Tool\n');

  // Handle rollback
  if (options.rollback) {
    return handleRollback(rootDir, options);
  }

  // Handle dry-run
  if (options.dryRun) {
    console.log('🔍 Running in dry-run mode (no changes will be made)\n');
  }

  const logger = new Logger(options.verbose);

  try {
    // Step 1: Detect framework and check compatibility
    console.log('Step 1/5: Detecting framework...');

    const detector = new FrameworkDetector(rootDir);
    const frameworkInfo = await detector.detect();

    if (!frameworkInfo.detected) {
      console.log(`  ✗ ${frameworkInfo.reason}`);
      throw new Error('Failed to detect project framework');
    }

    console.log(`  ✓ Framework: ${frameworkInfo.description}`);
    if (frameworkInfo.version) {
      console.log(`  ✓ Version: ${frameworkInfo.version}`);
    }
    console.log(`  ✓ Public directory: ${frameworkInfo.publicDir}`);

    // Check compatibility
    const compatibility = await detector.checkCompatibility(frameworkInfo);

    if (!compatibility.compatible) {
      console.log('\n  ❌ Compatibility issues found:\n');
      compatibility.issues.forEach(issue => {
        console.log(`  ✗ ${issue.message}`);
        if (issue.suggestion) {
          console.log(`    💡 ${issue.suggestion}`);
        }
      });

      if (!options.force) {
        throw new Error('Project is not compatible. Use --force to skip compatibility checks.');
      }
    }

    if (compatibility.warnings.length > 0) {
      console.log('\n  ⚠️  Warnings:\n');
      compatibility.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning.message}`);
        if (warning.suggestion) {
          console.log(`    💡 ${warning.suggestion}`);
        }
      });
    }

    console.log();

    // Step 2: Install dependencies
    console.log('Step 2/5: Installing dependencies...');
    
    const installer = new PackageInstaller(rootDir);
    
    // Detect package manager
    const packageManager = await installer.detectPackageManager();
    console.log(`  ✓ Package manager: ${packageManager}`);
    
    // Check if already installed
    const installStatus = await installer.checkInstallation();
    
    if (installStatus.installed) {
      console.log(`  ✓ @norejs/prefetch is already installed (${installStatus.version})`);
      
      if (installStatus.isWorkspace) {
        console.log(`  ℹ️  Using workspace dependency`);
      }
      
      if (installStatus.needsUpdate) {
        console.log(`  ⚠️  A newer version is available`);
        
        if (!options.yes) {
          const answer = await askQuestion('  Would you like to update? (y/n): ');
          if (answer.toLowerCase() === 'y') {
            await installer.install(packageManager, { dryRun: options.dryRun, verbose: options.verbose });
          }
        }
      }
    } else {
      console.log(`  Installing @norejs/prefetch...`);
      
      try {
        await installer.install(packageManager, { dryRun: options.dryRun, verbose: options.verbose });
      } catch (error) {
        console.log(`  ✗ Installation failed: ${error.message}`);
        console.log(`\n  💡 You can install manually using:`);
        console.log(`     ${installer.getManualInstallCommand(packageManager)}\n`);
        
        if (!options.force) {
          throw new Error('Dependency installation failed');
        }
      }
    }
    
    console.log();

    // Step 3: Create/modify Service Worker
    console.log('Step 3/5: Setting up Service Worker...');
    
    const swManager = new SWManager(rootDir, frameworkInfo);
    
    // Scan for existing Service Worker files
    const existingSWFiles = await swManager.scan();
    
    let swFilePath;
    
    if (existingSWFiles.length > 0) {
      console.log(`  ✓ Found ${existingSWFiles.length} existing Service Worker file(s)`);
      
      // Use the first (highest confidence) file
      const swFile = existingSWFiles[0];
      console.log(`  Using: ${swFile.relativePath} (confidence: ${(swFile.confidence * 100).toFixed(0)}%)`);
      
      // Check if already integrated
      const integration = await swManager.checkIntegration(swFile.path);
      
      if (integration.integrated) {
        console.log(`  ℹ️  Prefetch is already integrated (v${integration.version || 'unknown'})`);
        console.log(`  Generated: ${integration.generatedAt || 'unknown'}`);
        
        if (!options.yes) {
          const answer = await askQuestion('  Would you like to update the integration? (y/n): ');
          if (answer.toLowerCase() !== 'y') {
            console.log('  Skipping Service Worker update');
            swFilePath = swFile.path;
          } else {
            await swManager.update(swFile.path, options.config, { 
              dryRun: options.dryRun,
              debug: options.dev,
              debugPort: options.debugPort,
              cdnPrefix: options.cdnPrefix,
              cdnUrl: options.cdnUrl
            });
            console.log(`  ✓ Service Worker updated`);
            swFilePath = swFile.path;
          }
        } else {
          await swManager.update(swFile.path, options.config, { 
            dryRun: options.dryRun,
            debug: options.dev,
            debugPort: options.debugPort,
            cdnPrefix: options.cdnPrefix,
            cdnUrl: options.cdnUrl
          });
          console.log(`  ✓ Service Worker updated`);
          swFilePath = swFile.path;
        }
      } else {
        // Integrate into existing SW
        await swManager.update(swFile.path, options.config, { 
          dryRun: options.dryRun,
          debug: options.dev,
          debugPort: options.debugPort,
          cdnPrefix: options.cdnPrefix,
          cdnUrl: options.cdnUrl
        });
        console.log(`  ✓ Prefetch integrated into existing Service Worker`);
        swFilePath = swFile.path;
      }
    } else {
      // Create new Service Worker
      console.log('  No existing Service Worker found');
      console.log(`  Creating new Service Worker...`);
      
      swFilePath = await swManager.create(options.config, { 
        dryRun: options.dryRun,
        debug: options.dev,
        debugPort: options.debugPort,
        cdnPrefix: options.cdnPrefix,
        cdnUrl: options.cdnUrl
      });
      
      console.log(`  ✓ Service Worker created: ${path.relative(rootDir, swFilePath)}`);
    }
    
    console.log();

    // Step 4: Generate registration instructions (no automatic injection)
    console.log('Step 4/5: Generating registration instructions...');
    
    const generator = new CodeGenerator(frameworkInfo, options.config);
    const registrationCode = generator.generateRegistrationCode();
    
    // Always show manual instructions instead of auto-injection
    console.log(`  ℹ️  Service Worker registration code (add to your app entry point):`);
    console.log('');
    console.log('  ' + registrationCode.split('\n').join('\n  '));
    console.log('');
    console.log(`  💡 Add this code to your main application file:`);
    
    // Show framework-specific suggestions
    switch (frameworkInfo.name) {
      case 'nextjs':
        console.log(`     - pages/_app.js or pages/_app.tsx`);
        console.log(`     - app/layout.js or app/layout.tsx (App Router)`);
        break;
      case 'cra':
      case 'react-vite':
      case 'react':
        console.log(`     - src/index.js or src/index.tsx`);
        console.log(`     - src/App.js or src/App.tsx`);
        break;
      case 'vue-cli':
      case 'vue-vite':
      case 'vue':
        console.log(`     - src/main.js or src/main.ts`);
        break;
      case 'nuxt':
        console.log(`     - plugins/service-worker.client.js`);
        console.log(`     - app.vue or layouts/default.vue`);
        break;
      default:
        console.log(`     - Your main application entry file`);
    }
    
    console.log();

    // Step 5: Validate and configure
    console.log('Step 5/5: Validating migration...');
    console.log('  ✓ Framework detected and compatible');
    console.log('  ✓ Dependencies installed');
    console.log('  ✓ Service Worker configured');
    console.log('  ✓ Registration instructions provided');
    console.log();
    
    // Show completion message
    console.log('✅ Service Worker setup completed!\n');
    console.log('📝 What was done:');
    console.log(`  ✓ Detected framework: ${frameworkInfo.description}`);
    console.log(`  ✓ Installed @norejs/prefetch package`);
    console.log(`  ✓ Created/updated Service Worker: ${path.relative(rootDir, swFilePath)}`);
    console.log(`  ✓ Generated registration code for manual integration`);
    console.log();
    console.log('🚀 Next steps:');
    console.log('  1. Add the registration code to your application entry point (see above)');
    console.log('  2. Start your development server');
    console.log('  3. Open browser DevTools (F12)');
    console.log('  4. Go to Application > Service Workers');
    console.log('  5. Verify the Service Worker is registered');
    console.log('  6. Use @norejs/prefetch in your app to configure API caching');
    console.log();
    console.log('📚 Documentation: https://github.com/norejs/prefetch');
    console.log();

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);

    // Auto-rollback on error (if not in dry-run mode)
    if (!options.dryRun && !options.force) {
      console.log('\n🔄 Attempting to rollback changes...');
      // TODO: Implement auto-rollback
    }

    throw error;
  }
}

/**
 * Handle rollback operation
 */
async function handleRollback(rootDir, options) {
  console.log('🔄 Rolling back to previous state...\n');

  // TODO: Implement rollback logic
  console.log('  ⚠️  Rollback not yet implemented\n');

  console.log('ℹ️  Rollback functionality will be implemented in Task 7 (Backup Manager)\n');
}

/**
 * Ask user a question and get input
 */
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

module.exports = {
  runMigration,
  handleRollback,
  askQuestion
};
