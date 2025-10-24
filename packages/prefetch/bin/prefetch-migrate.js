#!/usr/bin/env node

/**
 * Prefetch Migration Tool
 * 
 * A project migration tool that helps existing frontend projects
 * quickly support Prefetch API caching and prefetching functionality.
 * 
 * @version 1.0.0
 */

const path = require('path');
const { runMigration } = require('../src/migrate');

// Parse command line arguments
const args = process.argv.slice(2);

// Show help
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Show version
if (args.includes('--version') || args.includes('-v')) {
  const packageJson = require('../package.json');
  console.log(`prefetch-migrate v${packageJson.version}`);
  process.exit(0);
}

// Parse options
const options = parseOptions(args);

// If no arguments provided, run default migration
if (args.length === 0) {
  console.log('🚀 Running default migration...\n');
  options.yes = true; // Auto-confirm for default migration
}

// Run migration
runMigration(options)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  });

/**
 * Parse command line options
 */
function parseOptions(args) {
  const options = {
    // Mode options
    rollback: false,
    dryRun: false,

    // Development options
    dev: false,
    cdnPrefix: null,
    cdnUrl: null,
    debugPort: 3100,

    // Configuration options
    config: {},

    // Output options
    verbose: false,

    // Other options
    force: false,
    yes: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--rollback':
        options.rollback = true;
        break;

      case '--dry-run':
        options.dryRun = true;
        break;

      case '--dev':
        options.dev = true;
        break;

      case '--cdn-prefix':
        options.cdnPrefix = args[++i];
        break;

      case '--cdn-url':
        options.cdnUrl = args[++i];
        break;

      case '--debug-port':
        options.debugPort = parseInt(args[++i], 10);
        break;

      case '--config':
        try {
          options.config = JSON.parse(args[++i]);
        } catch (error) {
          console.error('Error: Invalid JSON in --config');
          process.exit(1);
        }
        break;

      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--force':
      case '-f':
        options.force = true;
        break;

      case '--yes':
      case '-y':
        options.yes = true;
        break;

      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          console.error('Run with --help for usage information');
          process.exit(1);
        }
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🚀 Prefetch Migration Tool

Automatically migrate your frontend project to support Prefetch API caching.

Usage:
  prefetch-migrate [options]

  Run without options to start default migration with auto-confirmation.

Options:
  --rollback              Rollback to previous state
  --dry-run               Simulate migration without making changes
  
  --dev                   Enable development mode (use local dev server)
  --cdn-prefix <url>      Custom CDN URL prefix
  --cdn-url <url>         Complete CDN URL (overrides prefix)
  --debug-port <port>     Debug server port (default: 3100)
  
  --config <json>         Prefetch configuration (JSON string)
  --verbose, -v           Show detailed logs
  --force, -f             Skip compatibility checks
  --yes, -y               Skip confirmation prompts
  
  --help, -h              Show this help
  --version, -v           Show version

Examples:
  # Default migration (auto-confirm all prompts)
  prefetch-migrate
  
  # Interactive migration (with prompts)
  prefetch-migrate --verbose
  
  # Development mode
  prefetch-migrate --dev
  
  # Custom CDN
  prefetch-migrate --cdn-prefix http://localhost:3100
  
  # Dry run (simulate without changes)
  prefetch-migrate --dry-run
  
  # Rollback previous migration
  prefetch-migrate --rollback

Documentation: https://github.com/norejs/prefetch
`);
}
