/**
 * Logger Utility
 * 
 * Simple logger for migration tool.
 * Will be enhanced in Task 14 (Logger Module).
 */

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }
  
  info(message, ...args) {
    console.log(message, ...args);
  }
  
  success(message, ...args) {
    console.log('✓', message, ...args);
  }
  
  warn(message, ...args) {
    console.warn('⚠️ ', message, ...args);
  }
  
  error(message, ...args) {
    console.error('✗', message, ...args);
  }
  
  debug(message, ...args) {
    if (this.verbose) {
      console.log('[DEBUG]', message, ...args);
    }
  }
}

module.exports = Logger;
