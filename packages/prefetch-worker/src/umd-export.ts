/**
 * UMD 导出文件
 * 用于通过 importScripts 在 Service Worker 中加载
 */

import setupWorker from './setup';

// 导出到全局对象（Service Worker 中的 self）
export default {
  setup: setupWorker,
  version: '__VERSION__', // 构建时替换
  headers: {
    REQUEST_TYPE: 'X-Prefetch-Request-Type',
    REQUEST_VALUE: 'prefetch',
    EXPIRE_TIME: 'X-Prefetch-Expire-Time'
  }
};

