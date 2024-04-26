import { CreateRequest } from "@cotrip/corp-cross-request";
import {
  headName,
  headValue,
  expireTimeHeadName,
  defaultExpireTime,
} from "../constants";

import setupPrefetchWorker from "./setupPrefetchWorker";
import logger from "@/utils/logger";
import { scope, serviceWorkerUrl } from "@/constants";

type GreetParameters = Parameters<typeof CreateRequest>;

const requestMethods = ["get", "post"];

type IPreFetchOptions = {
  // 预取请求的有效时间
  expireTime?: number;
};

export default function preRequest(
  req: GreetParameters[0] = {},
  res: GreetParameters[1],
  prefetchOptions: IPreFetchOptions = {}
) {
  const originRequest = CreateRequest(
    {
      ...(req || {}),
      hideLoading: true,
    },
    res
  );
  if (typeof Proxy === "undefined") {
    return originRequest;
  }
  const { expireTime = defaultExpireTime } = prefetchOptions;
  // add interceptors
  originRequest.interceptors.request.use(async (config) => {
    logger.info("prefetch request interceptors", config);
    return {
      ...config,
      headers: {
        ...config.headers,
        [headName]: headValue,
        [expireTimeHeadName]: `${expireTime}`,
      },
    };
  });

  return new Proxy(originRequest, {
    get(target, propKey, receiver) {
      const originMethod = Reflect.get(target, propKey, receiver);
      if (
        requestMethods.includes(propKey as string) &&
        typeof originMethod === "function"
      ) {
        return async function (...args: any[]) {
          await setupPrefetchWorker({
            url: serviceWorkerUrl,
            scope,
          });
          // do something before request, tag this is prefetch
          return Reflect.apply(originMethod, target, args);
        };
      }
      return Reflect.get(target, propKey, receiver);
    },
    set(target, propKey, value, receiver) {
      return Reflect.set(target, propKey, value, receiver);
    },
  });
}
