import setupPrefetchWorker from "./setupPrefetchWorker";
import Config from "./config";

export type ISetupOptions = {
  serviceWorkerUrl: string;
  scope?: string;
  defaultExpireTime?: number;
  isDebug?: boolean;
};
declare global {
  interface Window {
    __PREFETCH_SETUPED_URL?: string;
  }
}
export default async function setup(options: ISetupOptions) {
  const { serviceWorkerUrl = "", scope = "" } = options;
  if (Config._isSetuped) {
    return null;
  }
  if (!serviceWorkerUrl) {
    return null;
  }
  Object.assign(Config, options, { _isSetuped: true });
  return await setupPrefetchWorker({
    url: serviceWorkerUrl,
    scope,
  });
}
