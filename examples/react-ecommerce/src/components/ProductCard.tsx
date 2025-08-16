import React from 'react';
import { Link } from 'react-router-dom';
import { usePrefetchOnHover } from '../hooks/usePrefetchOnHover';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { prefetchOnHover } = usePrefetchOnHover();
  
  // 当鼠标悬停时预加载产品详情
  const hoverProps = prefetchOnHover(`/api/products/${product.id}`, {
    expireTime: 5 * 60 * 1000, // 5分钟
    delay: 300 // 300ms 延迟
  });

  return (
    <div className="product-card" {...hoverProps}>
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-price">¥{product.price}</div>
        </div>
      </Link>
      
      <div className="product-actions">
        <button 
          className="add-to-cart-btn"
          onClick={(e) => {
            e.preventDefault();
            // 添加到购物车逻辑
            console.log(`添加商品到购物车: ${product.name}`);
          }}
        >
          加入购物车
        </button>
      </div>
    </div>
  );
};
