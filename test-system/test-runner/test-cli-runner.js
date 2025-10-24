#!/usr/bin/env node

/**
 * Simple test script to verify CLI Test Runner
 */

const path = require('path');
const CLITestRunner = require('./cli-tests');
const config = require('../test-config');

async function main() {
  console.log('Testing CLI Test Runner...\n');
  
  try {
    // Get the root directory (test-system)
    const rootDir = path.resolve(__dirname, '..');
    
    // Create CLI test runner
    const runner = new CLITestRunner(config, rootDir);
    
    // Run tests (limit to first template for quick test)
    const templates = await runner.templateManager.getAvailableTemplates();
    
    if (templates.length === 0) {
      console.error('No templates found!');
      process.exit(1);
    }
    
    console.log(`Found ${templates.length} templates: ${templates.join(', ')}\n`);
    console.log('Running test on first template only...\n');
    
    // Test with just the first template
    const results = await runner.runTests([templates[0]]);
    
    console.log('\nTest completed!');
    console.log(`Results: ${results.passed} passed, ${results.failed} failed\n`);
    
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
