# Prefetch Service Worker Setup Tool

This directory contains the setup tool for adding Prefetch Service Worker functionality to existing frontend projects.

## Overview

The setup tool automates the process of:
1. Detecting the project framework
2. Installing required dependencies  
3. Creating/updating Service Worker files
4. Providing registration instructions (manual integration required)
5. Validating the setup

**Important**: This tool only handles Service Worker setup. You need to manually register the Service Worker in your application.

## Usage

```bash
# Run setup
npx prefetch-migrate

# Development mode (uses local dev server)
npx prefetch-migrate --dev

# Dry run (no changes)
npx prefetch-migrate --dry-run

# Custom configuration
npx prefetch-migrate --config '{"apiMatcher":"/api/*","debug":true}'
```

## What the tool does

✅ **Automated**:
- Detects your project framework
- Installs `@norejs/prefetch` package
- Creates/updates Service Worker with Prefetch integration
- Provides registration code template

❌ **Manual (you need to do)**:
- Add the registration code to your app entry point
- Configure Prefetch rules using `@norejs/prefetch` API
- Test and customize the setup

## Architecture

The tool is modular and consists of:

- `index.js` - Main orchestrator
- `modules/` - Core functionality modules
- `utils/` - Utility functions

## Key Modules

### Framework Detector
Detects the frontend framework and checks compatibility.

### Package Installer  
Handles dependency installation.

### Service Worker Manager
Creates and updates Service Worker files with Prefetch integration.

### Code Generator
Generates Service Worker code and registration templates.

## Example Registration

After running the tool, you'll get registration code like this:

```javascript
// Register Prefetch Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Prefetch Service Worker registered:', registration);
      
      // Send initialization message to Service Worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'PREFETCH_INIT',
          config: {
            // Add your Prefetch configuration here
            // apiMatcher: '/api/*',
            // defaultExpireTime: 30000,
            // maxCacheSize: 100,
            // debug: false
          }
        });
      }
    })
    .catch(error => console.error('Prefetch Service Worker registration failed:', error));
}
```

Add this code to your application entry point (e.g., `src/index.js`, `pages/_app.js`, etc.).

## Directory Structure

```
src/migrate/
├── index.js                    # Main entry point and orchestration
├── modules/                    # Core modules
│   ├── framework-detector.js   # Framework detection and compatibility check
│   ├── package-installer.js    # Dependency installation
│   ├── sw-manager.js           # Service Worker file management
│   ├── code-generator.js       # Code generation (SW and registration)
│   ├── backup-manager.js       # Backup and rollback functionality
│   └── validator.js            # Migration validation
└── utils/                      # Utility functions
    ├── file-utils.js           # File operations
    └── logger.js               # Logging utility
```

## Setup Flow

The setup process follows these steps:

1. **Framework Detection** - Detect the frontend framework and check compatibility
2. **Dependency Installation** - Install `@norejs/prefetch` package if needed
3. **Service Worker Setup** - Create/update Service Worker with Prefetch integration
4. **Registration Instructions** - Provide registration code template (no auto-injection)
5. **Validation** - Validate the setup

## Development

The tool is designed to be:
- Framework-agnostic
- Non-invasive (no automatic code injection)
- Rollback-capable
- Testable

### Philosophy

This tool follows a "Service Worker only" approach:
- ✅ Handles Service Worker creation/updates automatically
- ✅ Provides clear registration instructions
- ❌ Does NOT modify your application code automatically
- ❌ Does NOT inject code into your entry files

This approach gives developers full control over how and where they integrate the Service Worker registration in their applications.