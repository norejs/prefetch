import './globals.css';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

export const metadata = {
  title: 'Next.js Test App',
  description: 'Next.js test template with Prefetch Service Worker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
