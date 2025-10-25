/**
 * 环境检测和配置
 */

// 检测当前环境
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// 检测 Service Worker 环境
export const isServiceWorkerContext = typeof self !== 'undefined' && 'registration' in self;

// 检测 ESM 支持
export const supportsESM = (() => {
  try {
    // 检测是否支持动态 import（在 Service Worker 环境中通常支持）
    return typeof globalThis !== 'undefined' && 'import' in globalThis;
  } catch {
    return false;
  }
})();

// 推荐的加载方式
export const getRecommendedLoadMethod = (): 'esm' | 'importScripts' => {
  // 开发环境优先使用 ESM（便于调试）
  if (isDevelopment && supportsESM) {
    return 'esm';
  }
  
  // 生产环境使用 importScripts（兼容性更好）
  return 'importScripts';
};

// 获取对应的文件路径
export const getWorkerFilePath = (baseUrl: string = '/dist'): string => {
  const method = getRecommendedLoadMethod();
  
  if (method === 'esm') {
    return `${baseUrl}/service-worker.esm.js`;
  } else {
    return `${baseUrl}/service-worker.js`;
  }
};

// 环境信息
export const envInfo = {
  isDevelopment,
  isProduction,
  isServiceWorkerContext,
  supportsESM,
  recommendedMethod: getRecommendedLoadMethod()
};