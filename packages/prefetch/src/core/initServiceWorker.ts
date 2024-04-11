/**
 * 初始化 service worker
 * @param
 */
export default async function initServiceWorker({
  url = '',
  scope,
}: {
  url: string;
  scope?: string;
}) {
  if ('serviceWorker' in navigator) {
    if (navigator.serviceWorker.controller) {
      // 判断是否 preload worker
      return navigator.serviceWorker.controller;
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
