/**
 * Service Worker 入口文件
 * 
 * 支持主进程消息通讯的初始化
 */

import { initializePrefetchWorker } from './main.js';

// 初始化，支持主进程配置
initializePrefetchWorker();