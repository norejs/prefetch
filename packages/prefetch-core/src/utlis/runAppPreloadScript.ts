import initServiceWorker from './initServiceWorker';

/**
 * 运行Preload
 * @param url
 */
const workers = new Map<string, boolean>();
export default async function runAppPreloadScript({
    appUrl = '',
    scriptUrl = '',
    lifespan = 10000,
    autoInstallServiceWorker = true,
} = {}) {
    if (!appUrl || !scriptUrl) {
        return null;
    }
    if (workers.get(scriptUrl)) {
        return workers.get(scriptUrl);
    }

    if (typeof Worker !== 'undefined') {
        if (autoInstallServiceWorker) {
            await initServiceWorker({
                url: '/webapp/home/service-worker.js',
                scope: '/',
            });
        }
        const worker = new Worker(scriptUrl);
        createMessageChannel(worker, appUrl);
        workers.set(scriptUrl, true);
        // 5s后销毁
        setTimeout(() => {
            worker.terminate();
            workers.set(scriptUrl, true);
        }, lifespan);
        return true;
    }
    return null;
}

// 建立preloader与sw的通信
function createMessageChannel(worker: Worker, appUrl: string) {
    window.addEventListener('message', (event) => {
        const { data: eventData } = event;
        console.log('message from window', eventData);
        // const { type, data } = eventData;
        // console.log('message from window', eventData);
        // // service worker的通讯，传递给preloader
        // worker.postMessage({
        //     type: 'PRELOADER:' + type,
        //     data,
        // });
    });
    worker.addEventListener('message', (event) => {
        console.log('message from worker', event);
        const { data: eventData } = event;
        const { type, data } = eventData;
        if (type === 'getcookie') {
            return worker.postMessage({
                type: 'getcookie',
                data: document.cookie,
            });
        }
        // 预加载相关的通讯，传递给service worker
        console.log(
            'navigator?.serviceWorker?.controller',
            navigator?.serviceWorker?.controller
        );
        navigator?.serviceWorker?.controller?.postMessage({
            type: 'PRELOADER:' + type,
            data,
            appUrl,
        });
        navigator?.serviceWorker?.addEventListener('message', (event) => {
            console.log('navigator?.serviceWorker?.controller?.addEven', event);
            const { data: eventData } = event;
            const { type, data, appUrl: eventAppUrl } = eventData;
            // service worker的通讯，传递给preloader
            worker.postMessage({
                type: type?.replace('PRELOADER:', ''),
                data,
            });
        });
    });
}
