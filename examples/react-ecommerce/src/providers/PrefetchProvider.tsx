import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setup, preRequest } from '@norejs/prefetch';

interface PrefetchContextType {
  prefetch: ReturnType<typeof preRequest> | null;
  isReady: boolean;
  error: string | null;
}

const PrefetchContext = createContext<PrefetchContextType>({
  prefetch: null,
  isReady: false,
  error: null
});

interface PrefetchProviderProps {
  children: ReactNode;
}

export const PrefetchProvider: React.FC<PrefetchProviderProps> = ({ children }) => {
  const [prefetch, setPrefetch] = useState<ReturnType<typeof preRequest> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePrefetch();
  }, []);

  const initializePrefetch = async () => {
    try {
      console.log('开始初始化 Prefetch...');
      
      // 初始化 Service Worker
      await setup({
        serviceWorkerUrl: '/prefetch-worker/service-worker.js',
        scope: '/'
      });

      // 创建预请求函数
      const prefetchFn = preRequest();
      setPrefetch(prefetchFn);
      setIsReady(true);
      
      console.log('Prefetch 初始化成功！');
      
      // 预加载一些常用 API
      await preloadCommonAPIs(prefetchFn);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Prefetch 初始化失败: ${errorMessage}`);
      console.error('Prefetch 初始化失败:', err);
    }
  };

  const preloadCommonAPIs = async (prefetchFn: ReturnType<typeof preRequest>) => {
    const commonAPIs = [
      { url: '/api/categories', expireTime: 5 * 60 * 1000 }, // 5分钟
      { url: '/api/featured-products', expireTime: 2 * 60 * 1000 }, // 2分钟
      { url: '/api/user/profile', expireTime: 10 * 60 * 1000 } // 10分钟
    ];

    for (const api of commonAPIs) {
      try {
        await prefetchFn(api.url, { expireTime: api.expireTime });
        console.log(`预加载完成: ${api.url}`);
      } catch (error) {
        console.warn(`预加载失败: ${api.url}`, error);
      }
    }
  };

  const value: PrefetchContextType = {
    prefetch,
    isReady,
    error
  };

  return (
    <PrefetchContext.Provider value={value}>
      {children}
      {error && (
        <div style={{ 
          position: 'fixed', 
          top: 10, 
          right: 10, 
          background: '#ff6b6b', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999 
        }}>
          {error}
        </div>
      )}
    </PrefetchContext.Provider>
  );
};

export const usePrefetch = () => {
  const context = useContext(PrefetchContext);
  if (!context) {
    throw new Error('usePrefetch must be used within a PrefetchProvider');
  }
  return context;
};
