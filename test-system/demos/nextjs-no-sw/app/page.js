import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <nav className="nav">
        <h1>Next.js Test App</h1>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </nav>
      <main className="content">
        <h2>Home Page</h2>
        <p>Welcome to the Next.js test template without Service Worker.</p>
        <p>This template is used for testing the prefetch CLI migration tool.</p>
      </main>
    </div>
  );
}
