import setupPrefetchWorker from "./setupPrefetchWorker";

export type ISetupOptions = {
  serviceWorkerUrl: string;
  scope?: string;
};
declare global {
  interface Window {
    __PREFETCH_SETUPED_URL?: string;
  }
}
export default async function setup(options: ISetupOptions) {
  const { serviceWorkerUrl = "", scope = "" } = options;
  if (!serviceWorkerUrl) {
    return null;
  }

  return await setupPrefetchWorker({
    url: serviceWorkerUrl,
    scope,
  });
}
