import { useCallback } from 'react';
import { usePrefetch } from '../providers/PrefetchProvider';

interface PrefetchOptions {
  expireTime?: number;
  delay?: number; // 延迟执行预请求，避免快速移动鼠标时的频繁请求
}

export const usePrefetchOnHover = () => {
  const { prefetch, isReady } = usePrefetch();
  
  const prefetchOnHover = useCallback(
    (url: string, options: PrefetchOptions = {}) => {
      const { expireTime = 30000, delay = 200 } = options;
      
      let timeoutId: NodeJS.Timeout;
      
      const handleMouseEnter = () => {
        if (!isReady || !prefetch) return;
        
        timeoutId = setTimeout(async () => {
          try {
            await prefetch(url, { expireTime });
            console.log(`预加载完成: ${url}`);
          } catch (error) {
            console.warn(`预加载失败: ${url}`, error);
          }
        }, delay);
      };
      
      const handleMouseLeave = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      return {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      };
    },
    [prefetch, isReady]
  );
  
  return { prefetchOnHover };
};
