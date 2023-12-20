const manifestCache: { [key: string]: any } = {};
export type Manifest = {
    normalScripts: string[];
    preloadScripts: string[];
    styles: string[];
};
/**
 * 获取应用使用的资源
 * @param appUrl 
 * @returns 
 */
export default async function loadMaifest(
    appUrl: string
): Promise<Manifest | null> {
    if (manifestCache[appUrl]) {
        return manifestCache[appUrl];
    }
    const res = await fetch(appUrl);
    if (res && res.status === 200) {
        const html = await res.text();
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const scripts = dom.querySelectorAll('script');
        const links = dom.querySelectorAll('link');
        const styles = Array.from(links).reduce((pre: string[], link) => {
            if (link.rel === 'stylesheet') {
                pre.push(link.href);
            }
            return pre;
        }, []);
        const normalScripts: string[] = [];
        const preloadScripts: string[] = [];
        Array.from(scripts).forEach((script) => {
            if ((script as any)?.type === 'preload') {
                preloadScripts.push(script.src);
            } else {
                normalScripts.push(script.src);
            }
        });
        const manifest = {
            normalScripts,
            preloadScripts,
            styles,
        };
        manifestCache[appUrl] = manifest;
        return manifest;
    }
    return null;
}
