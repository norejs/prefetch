import './globals.css';

export const metadata = {
  title: 'Next.js Test App',
  description: 'Next.js test template without Service Worker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


// Service Worker Registration - Added by @norejs/prefetch-migrate
// Register Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}
