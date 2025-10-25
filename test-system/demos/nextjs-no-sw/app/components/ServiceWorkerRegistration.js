'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register Prefetch Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Prefetch Service Worker registered:', registration);
          
          // Send initialization message to Service Worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'PREFETCH_INIT',
              config: {
                // Add your Prefetch configuration here
                apiMatcher: '/api/*',
                defaultExpireTime: 30000,
                maxCacheSize: 100,
                debug: true // Enable debug mode for development
              }
            });
          }
        })
        .catch(error => console.error('Prefetch Service Worker registration failed:', error));
    }
  }, []);

  return null; // This component doesn't render anything
}