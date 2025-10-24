# Test Runner

This directory contains the test runners for the comprehensive testing system.

## CLI Test Runner

The CLI Test Runner (`cli-tests.js`) automates testing of the prefetch CLI migration tool.

### Features

- **Framework Detection Testing**: Verifies that the CLI tool correctly identifies the project framework (React CRA, Next.js, Vue, etc.)
- **Service Worker Detection Testing**: Validates detection of existing Service Workers, Workbox configurations, and Prefetch integrations
- **File Generation Testing**: Ensures Service Worker files are correctly generated or updated and entry files are properly injected with initialization code
- **Dependency Installation Testing**: Verifies that package.json is updated with required dependencies and that dependencies can be successfully installed

### Usage

```javascript
const CLITestRunner = require('./cli-tests');
const config = require('../test-config');

const runner = new CLITestRunner(config);

// Run tests on all templates
const results = await runner.runTests();

// Run tests on specific templates
const results = await runner.runTests(['react-cra-no-sw', 'nextjs-no-sw']);
```

### Test Flow

For each template, the CLI Test Runner:

1. Copies the template to a temporary directory
2. Reads the template configuration
3. Tests framework detection
4. Tests Service Worker detection
5. Runs the CLI migration tool
6. Tests file generation (Service Worker and entry files)
7. Tests dependency installation
8. Cleans up temporary files

### Configuration

The CLI test runner uses the following configuration from `test-config.js`:

```javascript
{
  cli: {
    timeout: 60000,           // CLI execution timeout
    installTimeout: 120000,   // Dependency installation timeout
    skipInstall: false,       // Skip dependency installation (for faster testing)
    cliPath: '../packages/prefetch/bin/prefetch-migrate.js'
  }
}
```

### Test Results

The runner collects detailed test results including:

- Test name and status (pass/fail/skip)
- Execution duration
- Error messages and stack traces
- Logs and metadata
- Summary statistics (total, passed, failed, skipped)

### Quick Test

To quickly test the CLI runner with a single template:

```bash
node test-runner/test-cli-runner.js
```

This will run tests on the first available template only.

## Browser Test Runner

Coming soon...

## Reporters

Coming soon...
