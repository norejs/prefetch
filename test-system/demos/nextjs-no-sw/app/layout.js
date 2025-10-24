import './globals.css';
import Sw from "./sw"
export const metadata = {
  title: 'Next.js Test App',
  description: 'Next.js test template without Service Worker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Sw/>
      <body>{children}</body>
    </html>
  );
}


// Service Worker Registration - Added by @norejs/prefetch-migrate
// Register Service Worker
