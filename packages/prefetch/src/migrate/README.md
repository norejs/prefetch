# Prefetch Migration Tool

This directory contains the implementation of the `prefetch-migrate` CLI tool - a project migration tool that helps existing frontend projects quickly support Prefetch API caching and prefetching functionality.

## Directory Structure

```
src/migrate/
├── index.js                    # Main entry point and orchestration
├── modules/                    # Core modules
│   ├── framework-detector.js   # Framework detection and compatibility check
│   ├── package-installer.js    # Dependency installation
│   ├── sw-manager.js           # Service Worker file management
│   ├── code-generator.js       # Code generation (SW and registration)
│   ├── file-injector.js        # Code injection using AST
│   ├── backup-manager.js       # Backup and rollback functionality
│   └── validator.js            # Migration validation
├── templates/                  # Code templates
│   ├── service-worker/         # SW templates (to be added)
│   └── registration/           # Registration code templates (to be added)
└── utils/                      # Utility functions
    ├── file-utils.js           # File operations
    └── logger.js               # Logging utility
```

## Migration Flow

The migration process follows these steps:

1. **Framework Detection** (`framework-detector.js`)
   - Detect the frontend framework (Next.js, CRA, Vue, etc.)
   - Check Node.js and framework version compatibility
   - Determine project structure (publicDir, buildDir, entry files)

2. **Dependency Installation** (`package-installer.js`)
   - Detect package manager (npm, yarn, pnpm)
   - Check if `@norejs/prefetch` is already installed
   - Install the package if needed

3. **Service Worker Setup** (`sw-manager.js`)
   - Scan for existing Service Worker files
   - Check if Prefetch is already integrated
   - Create new SW or update existing one
   - Backup files before modification

4. **Registration Code Generation** (`code-generator.js` + `file-injector.js`)
   - Generate framework-specific registration code
   - Locate application entry file
   - Inject registration code using AST manipulation
   - Preserve code style and formatting

5. **Validation** (`validator.js`)
   - Validate all file modifications
   - Verify dependency installation
   - Check registration code correctness
   - Generate validation report

## Module Status

| Module | Status | Task |
|--------|--------|------|
| Framework Detector | 🔨 Skeleton | Task 2 |
| Package Installer | 🔨 Skeleton | Task 3 |
| SW Manager | 🔨 Skeleton | Task 4 |
| Code Generator | 🔨 Skeleton | Task 5 |
| File Injector | 🔨 Skeleton | Task 6 |
| Backup Manager | 🔨 Skeleton | Task 7 |
| Validator | 🔨 Skeleton | Task 8 |

## Usage

```bash
# Basic migration
prefetch-migrate

# Development mode (use local dev server)
prefetch-migrate --dev

# Custom CDN
prefetch-migrate --cdn-prefix http://localhost:3100

# Dry run (simulate without changes)
prefetch-migrate --dry-run

# Rollback to previous state
prefetch-migrate --rollback

# Verbose output
prefetch-migrate --verbose
```

## Development

### Adding a New Module

1. Create the module file in `modules/`
2. Export a class with clear methods
3. Add JSDoc comments
4. Import and use in `index.js`

### Adding Templates

1. Create template files in `templates/`
2. Use placeholders for dynamic content
3. Document template variables

### Testing

Test templates will be created in Phase 2 (Task 11-12).

## Implementation Progress

- [x] Task 1.1: Project structure created
- [x] Task 1.2: Module skeleton files created
- [ ] Task 2: Framework Detector (Next)
- [ ] Task 3: Package Installer
- [ ] Task 4: SW Manager
- [ ] Task 5: Code Generator
- [ ] Task 6: File Injector
- [ ] Task 7: Backup Manager
- [ ] Task 8: Validator
- [ ] Task 9: Interactive Flow
- [ ] Task 10: Main Orchestration

## Notes

- All modules use async/await for consistency
- Error handling will be added during implementation
- Backup is created before any file modification
- Auto-rollback on error (unless in dry-run mode)
