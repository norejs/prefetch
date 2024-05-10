const manifestCache: { [key: string]: any } = {};
export type Manifest = {
  preScripts: string[];
  prefetchLinks: string[];
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
    const dom = new DOMParser().parseFromString(html, "text/html");
    const scripts = dom.querySelectorAll("script");
    const links = dom.querySelectorAll("link");
    // const styles: string[] = [];
    const prefetchLinks: string[] = [];
    const prefetchManifests: string[] = [];
    Array.from(links).forEach((link) => {
      if (!link.href) {
        return;
      }
      switch (link.rel) {
        case "prefetch":
        case "stylesheet":
          prefetchLinks.push(link.href);
          break;
        case "prefetch-manifest":
          prefetchManifests.push(link.href);
          break;
        default:
          break;
      }
    });
    const preScripts: string[] = [];
    Array.from(scripts).forEach((script) => {
      if ((script as any)?.type === "prefetch") {
        preScripts.push(script.src);
      } else {
        prefetchLinks.push(script.src);
      }
    });
    // 如果manifest中有资源，需要加载manifest中的资源
    if (prefetchManifests.length) {
      const promises = prefetchManifests.map(getPrefetchManifests);
      const res = await Promise.all(promises);
      res.forEach((manifest) => {
        if (manifest) {
          preScripts.push(...manifest.scripts);
          prefetchLinks.push(...manifest.links);
        }
      });
    }
    const manifest = {
      preScripts,
      prefetchLinks,
    };
    manifestCache[appUrl] = manifest;
    return manifest;
  }
  return null;
}

function getPrefetchManifests(url: string): Promise<any> {
  return fetch(url).then((res) => res.json());
}
