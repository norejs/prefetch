import loadMaifest from './loadMaifest';
import runAppPreloadScript from './runAppPreloadScript';

const registedApps: { [key: string]: boolean } = {};

/**
 * 注册需要预加载的APP
 * @param appUrl
 * @returns
 */
export default async function registerPreloadApp(appUrl: string) {
    if (registedApps[appUrl]) {
        return;
    }
    const manifest = await loadMaifest(appUrl);
    const {
        normalScripts = [],
        preloadScripts = [],
        styles = [],
    } = manifest ?? {};
    appendPrefetchLink([appUrl]);
    appendPrefetchLink(styles);
    appendPrefetchLink(normalScripts);
    if (preloadScripts.length > 1) {
        console.warn('preload script must be one');
    } else if (preloadScripts.length === 1) {
        runAppPreloadScript({ scriptUrl: preloadScripts[0], appUrl });
    } else {
        console.warn(`app:${appUrl} no preload script`);
    }
    registedApps[appUrl] = true;
}

/**
 * 添加预加载的link
 * @param links
 */
function appendPrefetchLink(links: string[]) {
    try {
        const fragment = document.createDocumentFragment();
        links.forEach((link) => {
            if (!link) return;
            const linkEl = document.createElement('link');
            linkEl.setAttribute('rel', 'prefetch');
            linkEl.setAttribute('href', link);
            fragment.appendChild(linkEl);
        });
        document?.head?.appendChild(fragment);
    } catch (error) {
        console.log(error);
    }
}
