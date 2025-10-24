import Link from 'next/link';

export default function About() {
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
        <h2>About</h2>
        <p>This is a test template for the prefetch CLI migration tool.</p>
        <p>Framework: Next.js</p>
        <p>Service Worker: None</p>
      </main>
    </div>
  );
}
