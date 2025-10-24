# Test Reporters

This directory contains reporter classes for generating test reports, logs, and screenshots.

## Overview

The test reporting system consists of three main components:

1. **ConsoleReporter** - Real-time console output with colored formatting
2. **TestReporter** - Detailed text reports and artifact management (logs, screenshots)
3. **JSONReporter** - Machine-readable JSON reports and test history

## Usage

### Basic Usage

```javascript
const { ConsoleReporter, TestReporter, JSONReporter } = require('./reporters');

// Initialize reporters
const consoleReporter = new ConsoleReporter({ verbose: true });
const testReporter = new TestReporter({ outputDir: './test-results' });
const jsonReporter = new JSONReporter({ outputDir: './test-results' });

// Use during test execution
consoleReporter.onSuiteStart('My Test Suite');
consoleReporter.onTestPass('Test 1', 1234);
consoleReporter.onTestFail('Test 2', error, 2345);
consoleReporter.onSuiteEnd(results);

// Generate reports after tests complete
await testReporter.generateReport(results);
await jsonReporter.generateJSONReport(results);
```

## ConsoleReporter

Real-time console output with colored formatting using chalk.

### Methods

- `onTestStart(testName)` - Called when a test starts
- `onTestPass(testName, duration)` - Called when a test passes
- `onTestFail(testName, error, duration)` - Called when a test fails
- `onTestSkip(testName, reason)` - Called when a test is skipped
- `onSuiteStart(suiteName)` - Called when a test suite starts
- `onSuiteEnd(results)` - Called when a test suite ends
- `info(message)` - Output info message
- `warn(message)` - Output warning message
- `error(message)` - Output error message
- `success(message)` - Output success message

### Example

```javascript
const reporter = new ConsoleReporter({ verbose: true });

reporter.onSuiteStart('CLI Tests');
reporter.onTestStart('Framework Detection');
reporter.onTestPass('Framework Detection', 1234);
reporter.onTestFail('SW Detection', new Error('Not found'), 2345);
reporter.onSuiteEnd({
  total: 2,
  passed: 1,
  failed: 1,
  skipped: 0,
  duration: 3579
});
```

## TestReporter

Generates detailed text reports and manages test artifacts (logs, screenshots).

### Methods

- `generateReport(results)` - Generate detailed text report
- `saveLogs(testName, logs)` - Save test logs to file
- `saveScreenshot(testName, screenshot)` - Save screenshot to file
- `saveFailureArtifacts(testResult, screenshot)` - Save all failure artifacts
- `printSummary(results)` - Print summary to console
- `generateSummary(results)` - Generate summary object

### Example

```javascript
const reporter = new TestReporter({ 
  outputDir: './test-results',
  verbose: true 
});

// Generate report
const reportPath = await reporter.generateReport(results);

// Save logs for a specific test
await reporter.saveLogs('Test Name', ['log line 1', 'log line 2']);

// Save screenshot
await reporter.saveScreenshot('Test Name', screenshotBuffer);

// Save all failure artifacts
await reporter.saveFailureArtifacts(failedTestResult, screenshotBuffer);

// Print summary
reporter.printSummary(results);
```

## JSONReporter

Generates machine-readable JSON reports and maintains test history.

### Methods

- `generateJSONReport(results)` - Generate full JSON report
- `generateSummary(results)` - Generate summary JSON
- `generateFailuresReport(results)` - Generate failures-only report
- `appendToHistory(results)` - Add results to test history
- `readHistory()` - Read test history
- `generateFullReport(results)` - Generate all report types

### Example

```javascript
const reporter = new JSONReporter({ 
  outputDir: './test-results',
  verbose: true 
});

// Generate full JSON report
const jsonPath = await reporter.generateJSONReport(results);

// Generate summary
const summaryPath = await reporter.generateSummary(results);

// Generate failures report (if any failures)
const failuresPath = await reporter.generateFailuresReport(results);

// Append to history
await reporter.appendToHistory(results);

// Read history
const history = await reporter.readHistory();

// Generate all reports at once
const reports = await reporter.generateFullReport(results);
// returns: { json: '...', summary: '...', failures: '...' }
```

## Test Results Format

All reporters expect test results in the following format:

```javascript
{
  timestamp: '2024-10-24T12:00:00.000Z',
  total: 5,
  passed: 3,
  failed: 1,
  skipped: 1,
  duration: 5432,
  results: [
    {
      name: 'Test name',
      status: 'pass' | 'fail' | 'skip',
      duration: 1234,
      logs: ['log line 1', 'log line 2'],
      metadata: { key: 'value' },
      error: Error | null
    }
  ]
}
```

## Output Structure

Reports are saved in the following structure:

```
test-results/
├── logs/
│   ├── test-name-2024-10-24T12-00-00-000Z.log
│   └── test-name-error-2024-10-24T12-00-00-000Z.log
├── screenshots/
│   └── test-name-2024-10-24T12-00-00-000Z.png
└── reports/
    ├── test-report-2024-10-24T12-00-00-000Z.txt
    ├── test-report-2024-10-24T12-00-00-000Z.json
    ├── failures-2024-10-24T12-00-00-000Z.json
    ├── latest-summary.json
    └── test-history.json
```

## Example Usage

See `example-usage.js` for a complete working example:

```bash
node test-system/test-runner/reporters/example-usage.js
```

## Integration with Test Runners

To integrate with your test runner:

```javascript
const { ConsoleReporter, TestReporter, JSONReporter } = require('./reporters');

class MyTestRunner {
  constructor() {
    this.consoleReporter = new ConsoleReporter();
    this.testReporter = new TestReporter({ outputDir: './test-results' });
    this.jsonReporter = new JSONReporter({ outputDir: './test-results' });
  }

  async runTests() {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0, results: [] };
    
    this.consoleReporter.onSuiteStart('Test Suite');
    
    for (const test of this.tests) {
      this.consoleReporter.onTestStart(test.name);
      
      const result = await this.runTest(test);
      results.results.push(result);
      results.total++;
      
      if (result.status === 'pass') {
        results.passed++;
        this.consoleReporter.onTestPass(result.name, result.duration);
      } else if (result.status === 'fail') {
        results.failed++;
        this.consoleReporter.onTestFail(result.name, result.error, result.duration);
        
        // Save failure artifacts
        await this.testReporter.saveFailureArtifacts(result, result.screenshot);
      }
    }
    
    this.consoleReporter.onSuiteEnd(results);
    
    // Generate reports
    await this.testReporter.generateReport(results);
    await this.jsonReporter.generateFullReport(results);
    
    return results;
  }
}
```

## Requirements Satisfied

- **6.1**: Real-time console output with colored formatting
- **6.2**: Test summary with totals, passed, failed counts
- **6.3**: Detailed logs saved to separate files
- **6.4**: Screenshots captured on failure
- **6.5**: Error messages and stack traces in reports
- **6.6**: Machine-readable JSON format reports
