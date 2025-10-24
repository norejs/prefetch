/**
 * Example usage of the reporter classes
 * This demonstrates how to use the reporters in your test runner
 */

const { ConsoleReporter, TestReporter, JSONReporter } = require('./index');

// Example test results
const exampleResults = {
  timestamp: new Date().toISOString(),
  total: 5,
  passed: 3,
  failed: 1,
  skipped: 1,
  duration: 5432,
  results: [
    {
      name: 'Test framework detection',
      status: 'pass',
      duration: 1234,
      logs: ['Framework detected: React CRA'],
      metadata: { framework: 'react-cra' }
    },
    {
      name: 'Test Service Worker registration',
      status: 'pass',
      duration: 2100,
      logs: ['SW registered successfully'],
      metadata: { hasServiceWorker: true }
    },
    {
      name: 'Test prefetch functionality',
      status: 'fail',
      duration: 1500,
      error: new Error('Prefetch request not found'),
      logs: ['Starting prefetch test', 'Error: Prefetch request not found'],
      metadata: { hasPrefetch: false }
    },
    {
      name: 'Test cache functionality',
      status: 'pass',
      duration: 598,
      logs: ['Cache verified'],
      metadata: { cacheSize: 3 }
    },
    {
      name: 'Test optional feature',
      status: 'skip',
      duration: 0,
      logs: ['Test skipped - optional feature not enabled']
    }
  ]
};

async function demonstrateReporters() {
  console.log('=== Reporter Usage Example ===\n');

  // 1. Console Reporter - for real-time output
  console.log('1. Console Reporter - Real-time output:');
  console.log('-'.repeat(60));
  const consoleReporter = new ConsoleReporter({ verbose: true });
  
  consoleReporter.onSuiteStart('Example Test Suite');
  
  exampleResults.results.forEach(result => {
    consoleReporter.onTestStart(result.name);
    
    if (result.status === 'pass') {
      consoleReporter.onTestPass(result.name, result.duration);
    } else if (result.status === 'fail') {
      consoleReporter.onTestFail(result.name, result.error, result.duration);
    } else if (result.status === 'skip') {
      consoleReporter.onTestSkip(result.name, 'Optional feature');
    }
  });
  
  consoleReporter.onSuiteEnd(exampleResults);
  
  // 2. Test Reporter - for detailed reports and artifact saving
  console.log('\n2. Test Reporter - Generating reports:');
  console.log('-'.repeat(60));
  const testReporter = new TestReporter({ 
    outputDir: './test-results',
    verbose: true 
  });
  
  // Generate text report
  const reportPath = await testReporter.generateReport(exampleResults);
  console.log(`Report generated: ${reportPath}`);
  
  // Save logs for failed test
  const failedTest = exampleResults.results.find(r => r.status === 'fail');
  if (failedTest) {
    const logPath = await testReporter.saveLogs(failedTest.name, failedTest.logs);
    console.log(`Logs saved: ${logPath}`);
  }
  
  // Print summary
  testReporter.printSummary(exampleResults);
  
  // 3. JSON Reporter - for machine-readable reports
  console.log('\n3. JSON Reporter - Generating JSON reports:');
  console.log('-'.repeat(60));
  const jsonReporter = new JSONReporter({ 
    outputDir: './test-results',
    verbose: true 
  });
  
  // Generate full JSON report
  const jsonPath = await jsonReporter.generateJSONReport(exampleResults);
  console.log(`JSON report generated: ${jsonPath}`);
  
  // Generate summary
  const summaryPath = await jsonReporter.generateSummary(exampleResults);
  console.log(`Summary generated: ${summaryPath}`);
  
  // Generate failures report
  const failuresPath = await jsonReporter.generateFailuresReport(exampleResults);
  if (failuresPath) {
    console.log(`Failures report generated: ${failuresPath}`);
  }
  
  // Append to history
  await jsonReporter.appendToHistory(exampleResults);
  console.log('Results appended to test history');
  
  console.log('\n=== Example Complete ===\n');
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateReporters().catch(console.error);
}

module.exports = { demonstrateReporters };
