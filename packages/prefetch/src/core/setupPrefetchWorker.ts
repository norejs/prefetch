import logger from "@/utils/logger";
import { getFullUrl } from "@/utils/url";
/**
 * 初始化 service worker
 * @param
 */
// const url = "/home/service-worker.js";
const RegistedCACHE = new Map();

export default async function setupPrefetchWorker(options?: {
  url?: string;
  scope?: string;
}) {
  const { url = "", scope = "" } = options || {};
  if (!url) {
    return null;
  }
  logger.info("prefetch: initPreloaderWorker", url);
  if ("serviceWorker" in navigator) {
    const cache = RegistedCACHE.get(url);
    if (cache) {
      return cache;
    }

    if (navigator.serviceWorker.controller) {
      const swFullUrl = navigator.serviceWorker.controller.scriptURL;
      const isSameUrl = swFullUrl === getFullUrl(url);
      logger.info("prefetch: navigator.serviceWorker.controller", {
        curUrl: navigator.serviceWorker.controller,
        registUrl: getFullUrl(url),
        isSameUrl,
      });
      if (isSameUrl) {
        return navigator.serviceWorker.controller;
      }
    }

    const registration = await navigator.serviceWorker.register(url, {
      scope,
    });
    RegistedCACHE.set(url, registration);
    logger.info("prefetch: registration.active", registration);
    return registration;
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
    // 1S 必须做出应答
    const timeoutCallback = setTimeout(() => {
      resolve(false);
      window.removeEventListener("message", handler);
    }, 1000);

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
