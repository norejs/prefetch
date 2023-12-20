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
    console.log(navigator.serviceWorker.controller);
    if ('serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
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
