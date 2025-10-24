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
