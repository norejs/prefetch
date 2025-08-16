import React from 'react';
import { Link } from 'react-router-dom';
import { usePrefetchOnHover } from '../hooks/usePrefetchOnHover';
import { usePrefetch } from '../providers/PrefetchProvider';

export const Navbar: React.FC = () => {
  const { prefetchOnHover } = usePrefetchOnHover();
  const { isReady } = usePrefetch();
  
  // 预加载各个页面的数据
  const productsHover = prefetchOnHover('/api/products?page=1&limit=20');
  const cartHover = prefetchOnHover('/api/cart');
  const profileHover = prefetchOnHover('/api/user/profile');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          电商商城
        </Link>
        
        <div className="nav-menu">
          <Link 
            to="/products" 
            className="nav-link"
            {...productsHover}
          >
            商品列表
          </Link>
          
          <Link 
            to="/cart" 
            className="nav-link"
            {...cartHover}
          >
            购物车
          </Link>
          
          <Link 
            to="/profile" 
            className="nav-link"
            {...profileHover}
          >
            个人中心
          </Link>
        </div>
        
        <div className="nav-status">
          <span className={`prefetch-status ${isReady ? 'ready' : 'loading'}`}>
            {isReady ? '预加载已就绪' : '预加载初始化中...'}
          </span>
        </div>
      </div>
    </nav>
  );
};
