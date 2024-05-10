import loadMaifest from "./loadMaifest";

/**
 * 运行Preload
 * @param url
 */
export default async function runAppPreloadScript({
  appUrl = "",
  lifespan = 10000,
} = {}) {
  if (!appUrl) {
    return null;
  }
  const iframeWindow = createSandBox(appUrl, lifespan);
  if (!iframeWindow) {
    return null;
  }
  const iframeDocument = iframeWindow.document;
  const manifest = (await loadMaifest(appUrl)) ?? ({} as any);
  const { prefetchLinks = [], preScripts = [] } = manifest;
  const fragment = iframeDocument.createDocumentFragment();
  prefetchLinks.forEach((link: string) => {
    const linkElement = iframeDocument.createElement("link");
    linkElement.rel = "prefetch";
    linkElement.href = link;
    fragment.appendChild(linkElement);
  });

  preScripts.forEach((src: string) => {
    const scriptElement = iframeDocument.createElement("script");
    scriptElement.src = src;
    fragment.appendChild(scriptElement);
  });
  iframeDocument.head.appendChild(fragment);
  return null;
}

function createSandBox(appUrl: string, lifespan = -1) {
  if (!appUrl) {
    return null;
  }
  const oldIframe = document.getElementById(appUrl) as HTMLIFrameElement;
  if (oldIframe) {
    return oldIframe?.contentWindow;
  }
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = appUrl;
  iframe.sandbox.add("allow-scripts");
  iframe.sandbox.add("allow-same-origin");
  iframe.id = appUrl;

  document.body.appendChild(iframe);
  iframe.contentWindow && stopIframeLoading(iframe.contentWindow);
  lifespan > 0 &&
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, lifespan);
  return iframe.contentWindow;
}

function stopIframeLoading(iframeWindow: Window) {
  const oldDoc = iframeWindow.document;
  return new Promise<void>((resolve) => {
    function loop() {
      setTimeout(() => {
        let newDoc;
        try {
          newDoc = iframeWindow.document;
        } catch (err) {
          newDoc = null;
        }
        // wait for document ready
        if (!newDoc || newDoc === oldDoc) {
          loop();
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          iframeWindow?.stop
            ? iframeWindow?.stop()
            : iframeWindow.document.execCommand("Stop");
          resolve();
        }
      }, 1);
    }
    loop();
  });
}
