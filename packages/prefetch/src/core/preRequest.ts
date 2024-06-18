import {
    headName,
    headValue,
    expireTimeHeadName,
    defaultExpireTime,
} from '../constants';

import setupPrefetchWorker from './setupPrefetchWorker';
import logger from '@/utils/logger';
import { scope, serviceWorkerUrl } from '@/constants';

const requestMethods = ['get', 'post'];

type IPreFetchOptions = {
    // 预取请求的有效时间
    expireTime?: number;
};

export default function prefetch() {
  // 利用fetch 封装一个预取请求
  return async function preFetch(
    url: string,
    options: IPreFetchOptions = {}
  ): Promise<void> {
    const { expireTime = defaultExpireTime } = options;
    const request = new Request(url, {
      method: 'GET',
      headers: new Headers({
        [headName]: headValue,
        [expireTimeHeadName]: expireTime.toString(),
      }),
    });

    try {
      const response = await fetch(request);
      if (response.status !== 200) {
        throw new Error(`fetch ${url} failed, status: ${response.status}`);
      }
    } catch (e) {
      logger.error(`prefetch ${url} failed`, e);
    }
  };
}
