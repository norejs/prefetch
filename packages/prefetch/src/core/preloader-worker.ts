/**
 * 初始化 service worker
 * @param
 */
// const url = "/home/service-worker.js";

export default async function initPreloaderWorker({
  url = "/home/service-worker.js",
  scope = "/",
}: {
  url: string;
  scope?: string;
}) {
  if ("serviceWorker" in navigator) {
    if (navigator.serviceWorker.controller) {
      const prefetchWorkerInfo = await getPrefetchWorkerInfo(
        navigator.serviceWorker.controller
      );
      return prefetchWorkerInfo ? navigator.serviceWorker.controller : null;
    }
    if (!url) {
      return null;
    }
    const registration = await navigator.serviceWorker.register(url, {
      scope,
    });
    return registration.active;
  } else {
    return null;
  }
}

/**
 * 判断worker 是否是预加载 worker，如果是返回预加载 worker 的信息
 * @param worker
 * @returns
 */
export async function getPrefetchWorkerInfo(
  worker: ServiceWorker
): Promise<unknown> {
  if (!worker) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    // 生成一个随机的 callbackId,
    const callbackId = Date.now() + Number((Math.random() * 10).toFixed(0));
    // 2S 必须做出应答
    const timeoutCallback = setTimeout(() => {
      resolve(false);
      window.removeEventListener("message", handler);
    }, 2000);

    const handler = (event: MessageEvent) => {
      const { type, data } = event.data;
      if (
        type === "prefetch:is-prefetch-worker" &&
        data.callbackId === callbackId + 1
      ) {
        resolve(data);
        window.removeEventListener("message", handler);
      }
      timeoutCallback && clearTimeout(timeoutCallback);
    };
    window.addEventListener("message", handler);

    worker.postMessage({
      type: "prefetch:is-prefetch-worker",
      callbackId,
    });
  });
}

/**
 * 获取当前正在运行的 preloadWorker 实例
 * @returns
 */
export async function getPrefetchWorker() {
  const worker = navigator.serviceWorker.controller;
  if (!worker) {
    return Promise.resolve(null);
  }
  const prefetchWorkerInfo = await getPrefetchWorkerInfo(worker);
  if (prefetchWorkerInfo) {
    return worker;
  } else {
    return null;
  }
}
