/**
 * Service Worker 类型定义
 * 扩展标准的 Service Worker 类型以提供更好的 TypeScript 支持
 */

// 扩展全局 ServiceWorkerGlobalScope
declare global {
  interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
    registration: ServiceWorkerRegistration;
    clients: Clients;
    skipWaiting(): Promise<void>;
    
    // 自定义属性
    __RUNTIME_INFO__?: {
      format: 'esm' | 'umd' | 'iife';
      version: string;
      isDev: boolean;
    };
    __DEBUG__?: boolean;
    _setuped?: symbol;
    handleFetchEventImpl?: ((event: FetchEvent) => Promise<Response> | Response | void) | null;
  }

  // 确保 self 指向正确的类型
  const self: ServiceWorkerGlobalScope;
}

// Service Worker 事件类型
export interface ServiceWorkerInstallEvent extends ExtendableEvent {
  readonly type: 'install';
}

export interface ServiceWorkerActivateEvent extends ExtendableEvent {
  readonly type: 'activate';
}

export interface ServiceWorkerMessageEvent extends MessageEvent {
  readonly source: MessagePort | ServiceWorker | null;
  readonly data: any;
}

export interface ServiceWorkerFetchEvent extends FetchEvent {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

// 导出空对象以使此文件成为模块
export {};