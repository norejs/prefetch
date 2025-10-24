'use client';
import { useEffect } from "react";
import { setup, preFetch } from '@norejs/prefetch'
export default function Sw() {
  useEffect(() => {
     setup({
  serviceWorkerUrl: '/service-worker.js',
  scope: '/',
  apiMatcher: '\/api\/*',
  defaultExpireTime: 30000,
  maxCacheSize: 100,
  debug: true
})
  });
}