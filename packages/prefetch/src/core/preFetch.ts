import {
  headName,
  headValue,
  expireTimeHeadName,
  defaultExpireTime,
} from "../constants";

import logger from "../utils/logger";

type IPreFetchOptions = RequestInit & {
  // 预取请求的有效时间
  expireTime?: number;
};

// 利用fetch 封装一个预取请求
export async function preFetch(
  url: string,
  options: IPreFetchOptions = {}
): Promise<void> {
  const { expireTime = defaultExpireTime, ...fetchOptions } = options;

  // 合并原有headers和prefetch特定的headers
  const existingHeaders = new Headers(fetchOptions.headers);
  existingHeaders.set(headName, headValue);
  existingHeaders.set(expireTimeHeadName, expireTime.toString());

  const request = new Request(url, {
    method: "GET",
    ...fetchOptions,
    headers: existingHeaders,
  });

  try {
    const response = await fetch(request);
    if (response.status !== 200) {
      throw new Error(`fetch ${url} failed, status: ${response.status}`);
    }
  } catch (e) {
    logger.error(`prefetch ${url} failed`, e);
  }
}
