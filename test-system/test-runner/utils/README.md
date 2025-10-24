# Test Runner Utilities

This directory contains utility modules for the test system.

## TemplateManager

The `TemplateManager` class handles all operations related to test project templates.

### Usage

```javascript
const TemplateManager = require('./template-manager');
const config = require('../../test-config');
const path = require('path');

// Create instance with test-system root directory
const testSystemRoot = path.resolve(__dirname, '../..');
const manager = new TemplateManager(config, testSystemRoot);

// Get all available templates
const templates = await manager.getAvailableTemplates();
console.log('Available templates:', templates);

// Get template configuration
const config = await manager.getTemplateConfig('react-cra-no-sw');
console.log('Template config:', config);

// Copy template to temporary directory
const tempPath = await manager.copyTemplate('react-cra-no-sw');
console.log('Template copied to:', tempPath);

// Cleanup temporary directory
await manager.cleanup(tempPath);

// Cleanup all temporary directories
await manager.cleanupAll();

// Validate template structure
const validation = await manager.validateTemplate('react-cra-no-sw');
if (validation.valid) {
  console.log('Template is valid');
} else {
  console.log('Template errors:', validation.errors);
}
```

### API Reference

#### `constructor(config, rootDir = null)`
Creates a new TemplateManager instance.
- `config`: Test configuration object
- `rootDir`: Optional root directory (defaults to process.cwd())

#### `async copyTemplate(templateName, targetDir = null)`
Copies a template to a temporary directory.
- `templateName`: Name of the template to copy
- `targetDir`: Optional target directory (defaults to tempDir/templateName)
- Returns: Path to the copied template

#### `async cleanup(dir)`
Cleans up a specific directory.
- `dir`: Directory path to clean up

#### `async cleanupAll()`
Cleans up all temporary directories.

#### `async getAvailableTemplates()`
Gets a list of all available template names.
- Returns: Array of template names

#### `async getTemplateConfig(templateName)`
Reads the configuration for a specific template.
- `templateName`: Name of the template
- Returns: Template configuration object

#### `async getAllTemplatesWithConfig()`
Gets all templates with their configurations.
- Returns: Array of template configuration objects

#### `async validateTemplate(templateName)`
Validates a template's structure and configuration.
- `templateName`: Name of the template to validate
- Returns: `{ valid: boolean, errors: Array<string> }`

### Template Configuration Format

Each template must have a `template-config.json` file with the following structure:

```json
{
  "name": "template-name",
  "framework": "react-cra|nextjs|vue-vite|react-vite",
  "hasServiceWorker": false,
  "hasWorkbox": false,
  "hasPrefetch": false,
  "entryFile": "src/index.js",
  "publicDir": "public"
}
```

### Testing

Run the test script to verify TemplateManager functionality:

```bash
node test-system/test-runner/utils/test-template-manager.js
```
