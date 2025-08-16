import { useEffect } from 'react';
import { usePrefetch } from '../providers/PrefetchProvider';

interface PaginationPrefetchOptions {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
  prefetchRange?: number;
  expireTime?: number;
}

export const usePaginationPrefetch = ({
  currentPage,
  totalPages,
  baseUrl,
  queryParams = {},
  prefetchRange = 1,
  expireTime = 60000
}: PaginationPrefetchOptions) => {
  const { prefetch, isReady } = usePrefetch();

  useEffect(() => {
    if (!isReady || !prefetch) return;

    const prefetchPages = [];
    
    // 计算需要预加载的页面
    for (let i = currentPage - prefetchRange; i <= currentPage + prefetchRange; i++) {
      if (i > 0 && i <= totalPages && i !== currentPage) {
        prefetchPages.push(i);
      }
    }

    // 执行预加载
    prefetchPages.forEach(async (page) => {
      try {
        const url = buildUrl(baseUrl, { ...queryParams, page: page.toString() });
        await prefetch(url, { expireTime });
        console.log(`分页预加载完成: 第${page}页`);
      } catch (error) {
        console.warn(`分页预加载失败: 第${page}页`, error);
      }
    });
  }, [currentPage, totalPages, baseUrl, queryParams, prefetchRange, expireTime, prefetch, isReady]);
};

function buildUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.pathname + url.search;
}
