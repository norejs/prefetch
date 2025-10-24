/**
 * File Utilities
 * 
 * Common file operations used across modules.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file content
 */
async function readFile(filePath) {
  return await fs.readFile(filePath, 'utf8');
}

/**
 * Write file content
 */
async function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Copy file
 */
async function copyFile(src, dest) {
  const dir = path.dirname(dest);
  await fs.mkdir(dir, { recursive: true });
  await fs.copyFile(src, dest);
}

module.exports = {
  fileExists,
  readFile,
  writeFile,
  copyFile
};
