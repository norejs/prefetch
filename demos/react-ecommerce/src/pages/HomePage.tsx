import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { usePrefetch } from '../providers/PrefetchProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { prefetch, isReady } = usePrefetch();

  useEffect(() => {
    loadFeaturedProducts();
    
    // 预加载用户可能访问的页面
    if (isReady && prefetch) {
      preloadLikelyPages();
    }
  }, [isReady, prefetch]);

  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/featured-products');
      const products = await response.json();
      setFeaturedProducts(products);
    } catch (error) {
      console.error('加载推荐商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const preloadLikelyPages = async () => {
    if (!prefetch) return;

    // 根据统计数据，用户最可能访问的页面
    const likelyPages = [
      { url: '/api/products?page=1&limit=20', expireTime: 2 * 60 * 1000 },
      { url: '/api/categories', expireTime: 5 * 60 * 1000 },
      { url: '/api/cart', expireTime: 1 * 60 * 1000 }
    ];

    for (const page of likelyPages) {
      try {
        await prefetch(page.url, { expireTime: page.expireTime });
        console.log(`首页预加载完成: ${page.url}`);
      } catch (error) {
        console.warn(`首页预加载失败: ${page.url}`, error);
      }
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>欢迎来到电商商城</h1>
          <p>发现最优质的商品，享受极致的购物体验</p>
          <Link 
            to="/products" 
            className="cta-button"
            onMouseEnter={() => {
              // 鼠标悬停时预加载商品页面
              if (prefetch) {
                prefetch('/api/products?page=1&limit=20', { expireTime: 60000 });
              }
            }}
          >
            开始购物
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <h2>推荐商品</h2>
        
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="featured-products">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="categories-section">
        <h2>商品分类</h2>
        <div className="categories-grid">
          {[
            { name: '电子产品', slug: 'electronics', icon: '📱' },
            { name: '服装', slug: 'clothing', icon: '👕' },
            { name: '图书', slug: 'books', icon: '📚' },
            { name: '家居', slug: 'home', icon: '🏠' }
          ].map(category => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="category-card"
              onMouseEnter={() => {
                // 预加载分类商品
                if (prefetch) {
                  prefetch(`/api/products?category=${category.slug}&page=1&limit=20`, {
                    expireTime: 3 * 60 * 1000
                  });
                }
              }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
