import setupPrefetchWorker from "./setupPrefetchWorker";

export type ISetupOptions = {
  serviceWorkerUrl: string;
  scope?: string;
  apiMatcher?: string | RegExp;
  defaultExpireTime?: number;
  maxCacheSize?: number;
  debug?: boolean;
};
declare global {
  interface Window {
    __PREFETCH_SETUPED_URL?: string;
  }
}
export default async function setup(options: ISetupOptions) {
  const { serviceWorkerUrl = "", scope = "", ...config } = options;
  if (!serviceWorkerUrl) {
    return null;
  }

  const registration = await setupPrefetchWorker({
    url: serviceWorkerUrl,
    scope,
  });

  // 向 Service Worker 发送初始化消息
  if (registration && "serviceWorker" in navigator) {
    await sendInitMessage(config);
  }

  return registration;
}

/**
 * 向 Service Worker 发送初始化消息
 */
async function sendInitMessage(config: Partial<ISetupOptions>) {
  return new Promise<void>((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      // 如果没有 controller，等待 Service Worker 激活
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (navigator.serviceWorker.controller) {
          sendMessage();
        }
      });

      // 设置超时
      setTimeout(() => {
        reject(new Error("Service Worker controller not available"));
      }, 5000);
    } else {
      sendMessage();
    }

    function sendMessage() {
      if (!navigator.serviceWorker.controller) {
        reject(new Error("No Service Worker controller"));
        return;
      }

      // 监听来自 Service Worker 的响应
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "PREFETCH_INIT_SUCCESS") {
          navigator.serviceWorker.removeEventListener("message", handleMessage);
          const message = event.data.message || "Initialized successfully";
          console.log(`prefetch: Service Worker ${message}`, event.data.config);
          resolve();
        } else if (event.data && event.data.type === "PREFETCH_INIT_ERROR") {
          navigator.serviceWorker.removeEventListener("message", handleMessage);
          console.error(
            "prefetch: Service Worker initialization failed",
            event.data.error
          );
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);

      // 发送初始化消息
      navigator.serviceWorker.controller.postMessage({
        type: "PREFETCH_INIT",
        config: {
          apiMatcher: "/api", // 默认值
          ...config,
        },
      });

      // 设置超时
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
        reject(new Error("Service Worker initialization timeout"));
      }, 3000);
    }
  });
}
