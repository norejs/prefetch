/**
 * Service Worker 配置选项
 */
export interface ServiceWorkerConfig {
  /** API 匹配规则，支持字符串或正则表达式 */
  apiMatcher?: string | RegExp;
  /** 请求转换为缓存键的函数 */
  requestToKey?: (request: Request) => Promise<string> | string;
  /** 默认过期时间（毫秒），0 表示不缓存 */
  defaultExpireTime?: number;
  /** 最大缓存数量 */
  maxCacheSize?: number;
  /** 是否开启调试模式 */
  debug?: boolean;
  /** 是否允许跨域请求 */
  allowCrossOrigin?: boolean;
  /** 是否自动跳过等待 */
  autoSkipWaiting?: boolean;
}

/**
 * 缓存项接口
 */
export interface CacheItem {
  /** 过期时间戳 */
  expire: number;
  /** 缓存的响应 */
  response?: Response;
  /** 正在进行的请求 Promise */
  requestPromise?: Promise<Response>;
}

/**
 * 请求处理器函数类型
 */
export type FetchHandler = (event: FetchEvent) => Promise<Response> | Response | void;

/**
 * 消息类型定义
 */
export interface ServiceWorkerMessage {
  type: string;
  [key: string]: any;
}

/**
 * 初始化消息
 */
export interface InitMessage extends ServiceWorkerMessage {
  type: 'PREFETCH_INIT';
  config?: Partial<ServiceWorkerConfig>;
}

/**
 * 初始化成功响应
 */
export interface InitSuccessMessage extends ServiceWorkerMessage {
  type: 'PREFETCH_INIT_SUCCESS';
  config: ServiceWorkerConfig;
  message?: string;
}

/**
 * 初始化失败响应
 */
export interface InitErrorMessage extends ServiceWorkerMessage {
  type: 'PREFETCH_INIT_ERROR';
  error: string;
}

/**
 * 健康检查消息
 */
export interface HealthCheckMessage extends ServiceWorkerMessage {
  type: 'PREFETCH_HEALTH_CHECK';
}

/**
 * 健康检查响应
 */
export interface HealthResponseMessage extends ServiceWorkerMessage {
  type: 'PREFETCH_HEALTH_RESPONSE';
  loaded: boolean;
  initialized: boolean;
  attempts: number;
}

/**
 * 日志级别
 */
export type LogLevel = 'info' | 'warn' | 'error';

/**
 * 日志记录器接口
 */
export interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * 构建格式类型
 */
export type BuildFormat = 'esm' | 'umd' | 'iife';

/**
 * 运行时环境信息
 */
export interface RuntimeInfo {
  format: BuildFormat;
  version: string;
  isDev: boolean;
}

/**
 * 扩展 FetchEvent 以支持更好的类型检查
 */
export interface ExtendedFetchEvent extends FetchEvent {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}