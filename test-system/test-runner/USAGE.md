# Test Runner Usage Guide

## Overview

The main test runner orchestrates the complete testing workflow for the prefetch CLI tool and Service Worker functionality. It manages template testing, API server lifecycle, CLI tests, and browser automation tests.

## Installation

First, install dependencies:

```bash
cd test-system
npm install
```

Install Playwright browsers:

```bash
npm run install:playwright
```

## Basic Usage

### Run All Tests

```bash
npm test
# or
node test-runner/index.js
```

### Test Specific Templates

```bash
node test-runner/index.js react-cra-no-sw
node test-runner/index.js react-cra-no-sw nextjs-no-sw
```

## Command Line Options

### Browser Options

- `--headless` - Run browser tests in headless mode (default: true)
- `--headed` - Run browser tests in headed mode (shows browser window)
- `--skip-browser` - Skip browser tests entirely

Examples:
```bash
# Run with visible browser
node test-runner/index.js --headed

# Skip browser tests (CLI only)
node test-runner/index.js --skip-browser
```

### Installation Options

- `--skip-install` - Skip dependency installation (faster for development)

Example:
```bash
# Skip npm install for faster testing
node test-runner/index.js --skip-install
```

### Logging Options

- `--verbose` / `-v` - Enable verbose logging (default: true)
- `--quiet` / `-q` - Minimal output
- `--log-level <level>` - Set log level: error, warn, info, debug

Examples:
```bash
# Minimal output
node test-runner/index.js --quiet

# Debug logging
node test-runner/index.js --log-level=debug
```

### Timeout Options

- `--timeout <ms>` - Test timeout in milliseconds (default: 30000)
- `--template-timeout <ms>` - Template test timeout in milliseconds (default: 300000)

Examples:
```bash
# Increase timeout for slow tests
node test-runner/index.js --timeout=60000

# Set template timeout to 10 minutes
node test-runner/index.js --template-timeout=600000
```

### Control Flow Options

- `--stop-on-failure` - Stop testing on first failure

Example:
```bash
# Stop immediately on first failure
node test-runner/index.js --stop-on-failure
```

### Help

- `--help` / `-h` - Show help message

```bash
node test-runner/index.js --help
```

## Complete Examples

### Development Mode (Fast)

```bash
# Skip install, skip browser tests, quiet output
node test-runner/index.js --skip-install --skip-browser --quiet
```

### Full Test Suite (CI Mode)

```bash
# Headless, verbose, stop on failure
node test-runner/index.js --headless --verbose --stop-on-failure
```

### Debug Mode

```bash
# Headed browser, debug logging, single template
node test-runner/index.js react-cra-no-sw --headed --log-level=debug
```

### Quick Smoke Test

```bash
# Test one template, skip install
node test-runner/index.js react-cra-no-sw --skip-install --skip-browser
```

## Test Flow

The test runner executes the following workflow for each template:

1. **Start API Server** - Launches the Express API server on port 3001
2. **Copy Template** - Copies the template to a temporary directory
3. **Read Configuration** - Loads the template configuration
4. **Run CLI Tests** - Executes CLI migration tool tests
   - Framework detection
   - Service Worker detection
   - File generation
   - Dependency installation
5. **Start Dev Server** - Launches the development server (if browser tests enabled)
6. **Run Browser Tests** - Executes browser automation tests
   - Service Worker registration
   - Prefetch functionality
   - Cache functionality
7. **Cleanup** - Stops dev server and removes temporary files
8. **Generate Reports** - Creates JSON and console reports

## Output

### Console Output

The test runner provides real-time console output with:
- Test progress indicators
- Pass/fail status for each test
- Error messages and stack traces
- Summary statistics

### JSON Reports

Reports are saved to `test-results/reports/`:
- `test-report-<timestamp>.json` - Full test results
- `latest-summary.json` - Latest test summary
- `failures-<timestamp>.json` - Failed tests only (if any)
- `test-history.json` - Historical test results

### Logs and Screenshots

- `test-results/logs/` - Console and network logs
- `test-results/screenshots/` - Screenshots of failures

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed or error occurred

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, stop the conflicting process or modify `test-config.js`:

```javascript
apiServer: {
  port: 3002, // Change to available port
  // ...
}
```

### Timeout Errors

Increase timeout values:

```bash
node test-runner/index.js --timeout=60000 --template-timeout=600000
```

### Browser Launch Failures

Install Playwright browsers:

```bash
npm run install:playwright
```

### Dependency Installation Failures

Skip installation during development:

```bash
node test-runner/index.js --skip-install
```

## Advanced Usage

### Programmatic Usage

```javascript
const MainTestRunner = require('./test-runner');

const runner = new MainTestRunner({
  headless: true,
  skipInstall: false,
  verbose: true
});

runner.run(['react-cra-no-sw'])
  .then(results => {
    console.log('Tests completed:', results);
  })
  .catch(error => {
    console.error('Tests failed:', error);
  });
```

### Custom Configuration

Create a custom config file and modify `test-config.js` or pass options programmatically.

## See Also

- [CLI Tests Documentation](./cli-tests.js)
- [Browser Tests Documentation](./browser-tests.js)
- [Template Manager Documentation](./utils/template-manager.js)
- [Test Configuration](../test-config.js)
