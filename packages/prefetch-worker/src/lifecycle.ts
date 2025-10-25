/**
 * Service Worker 生命周期管理
 * 
 * 负责 install 和 activate 事件的处理
 * 可选使用，开发者可以自行管理生命周期
 */

// Service Worker 类型声明
declare const self: ServiceWorkerGlobalScope & {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
};

export interface LifecycleOptions {
  /** 是否自动跳过等待 */
  autoSkipWaiting?: boolean;
  /** 是否自动声明控制权 */
  autoClaimClients?: boolean;
  /** 自定义安装逻辑 */
  onInstall?: (event: ExtendableEvent) => void | Promise<void>;
  /** 自定义激活逻辑 */
  onActivate?: (event: ExtendableEvent) => void | Promise<void>;
}

/**
 * 设置 Service Worker 生命周期事件
 * @param options 生命周期选项
 * @returns 清理函数
 */
export function setupLifecycle(options: LifecycleOptions = {}): () => void {
  const {
    autoSkipWaiting = true,
    autoClaimClients = true,
    onInstall,
    onActivate
  } = options;

  // Install 事件处理器
  const installHandler = (event: ExtendableEvent) => {
    console.log('prefetch-worker: install event');
    
    const installTasks: Promise<void>[] = [];
    
    // 自动跳过等待
    if (autoSkipWaiting) {
      installTasks.push(self.skipWaiting());
    }
    
    // 执行自定义安装逻辑
    if (onInstall) {
      const result = onInstall(event);
      if (result instanceof Promise) {
        installTasks.push(result);
      }
    }
    
    if (installTasks.length > 0) {
      event.waitUntil(Promise.all(installTasks));
    }
  };
  
  // Activate 事件处理器
  const activateHandler = (event: ExtendableEvent) => {
    console.log('prefetch-worker: activate event');
    
    const activateTasks: Promise<void>[] = [];
    
    // 自动声明控制权
    if (autoClaimClients) {
      activateTasks.push(
        self.clients.claim().then(() => {
          console.log('prefetch-worker: activated and controlling clients');
        })
      );
    }
    
    // 执行自定义激活逻辑
    if (onActivate) {
      const result = onActivate(event);
      if (result instanceof Promise) {
        activateTasks.push(result);
      }
    }
    
    if (activateTasks.length > 0) {
      event.waitUntil(Promise.all(activateTasks));
    }
  };

  // 注册事件监听器
  self.addEventListener('install', installHandler);
  self.addEventListener('activate', activateHandler);

  console.log('prefetch-worker: lifecycle handlers registered');

  // 返回清理函数
  return () => {
    console.log('prefetch-worker: cleaning up lifecycle handlers');
    self.removeEventListener('install', installHandler);
    self.removeEventListener('activate', activateHandler);
  };
}