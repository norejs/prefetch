import type { Logger, LogLevel } from '../types.js';

/**
 * 创建日志记录器
 */
export function createLogger(debug = false, prefix = 'prefetch'): Logger {
  const noop = () => {};
  
  const log = (level: LogLevel, message: string, ...args: any[]) => {
    if (!debug && level === 'info') return;
    
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${prefix}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  };

  return {
    info: debug ? (message: string, ...args: any[]) => log('info', message, ...args) : noop,
    warn: (message: string, ...args: any[]) => log('warn', message, ...args),
    error: (message: string, ...args: any[]) => log('error', message, ...args),
  };
}

/**
 * 默认日志记录器
 */
export const logger = createLogger(
  typeof self !== 'undefined' && (self as any).__DEBUG__,
  'prefetch-worker'
);