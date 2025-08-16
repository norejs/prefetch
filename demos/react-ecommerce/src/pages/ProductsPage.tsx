import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { usePaginationPrefetch } from '../hooks/usePaginationPrefetch';
import { usePrefetch } from '../providers/PrefetchProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  
  const { prefetch, isReady } = usePrefetch();

  // 自动预加载相邻页面
  usePaginationPrefetch({
    currentPage,
    totalPages,
    baseUrl: '/api/products',
    queryParams: { 
      category,
      limit: '20'
    },
    prefetchRange: 2, // 预加载前后2页
    expireTime: 3 * 60 * 1000 // 3分钟
  });

  useEffect(() => {
    loadProducts(currentPage, category);
  }, [currentPage, category]);

  const loadProducts = async (page: number, cat: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?page=${page}&category=${cat}&limit=20`);
      const data: ProductsResponse = await response.json();
      
      setProducts(data.products);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('加载商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setCurrentPage(1);
    
    // 立即预加载新分类的数据
    if (isReady && prefetch && newCategory !== category) {
      prefetch(`/api/products?page=1&category=${newCategory}&limit=20`, {
        expireTime: 3 * 60 * 1000
      }).catch(console.warn);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>商品列表</h1>
        
        <div className="category-filter">
          {['all', 'electronics', 'clothing', 'books', 'home'].map(cat => (
            <button
              key={cat}
              className={`category-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {getCategoryName(cat)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              上一页
            </button>
            
            <span className="page-info">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    all: '全部',
    electronics: '电子产品',
    clothing: '服装',
    books: '图书',
    home: '家居'
  };
  return names[category] || category;
}
