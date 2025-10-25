/**
 * 热重载客户端
 * 用于在开发模式下自动重新注册 Service Worker
 */

interface HotReloadOptions {
  serverUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

class ServiceWorkerHotReload {
  private ws: WebSocket | null = null;
  private options: Required<HotReloadOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;

  constructor(options: HotReloadOptions = {}) {
    this.options = {
      serverUrl: options.serverUrl || 'ws://localhost:18003',
      reconnectInterval: options.reconnectInterval || 2000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      debug: options.debug || false,
    };
  }

  private log(message: string, ...args: any[]) {
    if (this.options.debug) {
      console.log(`[SW Hot Reload] ${message}`, ...args);
    }
  }

  private error(message: string, ...args: any[]) {
    console.error(`[SW Hot Reload] ${message}`, ...args);
  }

  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.log('Connecting to hot reload server...');
      this.ws = new WebSocket(this.options.serverUrl);

      this.ws.onopen = () => {
        this.log('Connected to hot reload server');
        this.reconnectAttempts = 0;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          this.error('Failed to parse message:', error);
        }
      };

      this.ws.onclose = () => {
        this.log('Disconnected from hot reload server');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        this.error('WebSocket error:', error);
      };

    } catch (error) {
      this.error('Failed to connect:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.log(`Reconnecting in ${this.options.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  private async handleMessage(message: any): Promise<void> {
    this.log('Received message:', message);

    switch (message.type) {
      case 'build-success':
        await this.handleBuildSuccess(message.data);
        break;
      case 'build-error':
        this.handleBuildError(message.data);
        break;
      default:
        this.log('Unknown message type:', message.type);
    }
  }

  private async handleBuildSuccess(data: any): Promise<void> {
    this.log('Build successful, reloading Service Worker...');

    try {
      // 获取当前注册的 Service Worker
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        // 强制更新 Service Worker
        await registration.update();
        this.log('Service Worker updated');

        // 如果有新的 Service Worker 在等待，激活它
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          this.log('Activated waiting Service Worker');
        }

        // 监听 Service Worker 状态变化
        const newWorker = registration.installing || registration.waiting;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              this.log('New Service Worker activated');
              // 可以选择刷新页面或发送通知
              this.notifyUpdate();
            }
          });
        }
      } else {
        this.log('No Service Worker registration found');
      }
    } catch (error) {
      this.error('Failed to update Service Worker:', error);
    }
  }

  private handleBuildError(data: any): void {
    this.error('Build failed:', data);
    
    // 可以在页面上显示错误通知
    this.notifyError(data);
  }

  private notifyUpdate(): void {
    // 创建更新通知
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = '🔄 Service Worker updated';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  private notifyError(data: any): void {
    // 创建错误通知
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      max-width: 400px;
    `;
    notification.innerHTML = `
      <div>❌ Build failed</div>
      <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">
        ${data.error || 'Unknown error'}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }
}

// 自动启动热重载（仅在开发模式下）
if (typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  
  const hotReload = new ServiceWorkerHotReload({
    debug: true
  });

  // 页面加载完成后连接
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hotReload.connect();
    });
  } else {
    hotReload.connect();
  }

  // 页面卸载时断开连接
  window.addEventListener('beforeunload', () => {
    hotReload.disconnect();
  });

  // 导出到全局，便于调试
  (window as any).swHotReload = hotReload;
}

export { ServiceWorkerHotReload };
export default ServiceWorkerHotReload;