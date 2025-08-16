const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 模拟API数据
const apiData = {
  '/api/products/1': {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 7999,
    description: '强大的 A17 Pro 芯片，钛金属机身',
    specs: ['6.1英寸显示屏', '128GB存储', 'A17 Pro芯片'],
    category: 'smartphone',
    stock: 50,
    images: [
      'https://via.placeholder.com/400x400/007ACC/white?text=iPhone+15+Pro'
    ]
  },
  '/api/products/2': {
    comments: [
      { 
        id: 1,
        user: '张三', 
        rating: 5, 
        comment: '很好用，推荐！',
        date: '2024-01-15'
      },
      { 
        id: 2,
        user: '李四', 
        rating: 4, 
        comment: '性价比不错',
        date: '2024-01-14'
      },
      { 
        id: 3,
        user: '王五', 
        rating: 5, 
        comment: '苹果品质值得信赖',
        date: '2024-01-13'
      }
    ],
    rating: 4.8,
    totalComments: 1250,
    productId: 1
  },
  '/api/cart': {
    items: [
      { 
        id: 1, 
        productId: 1,
        name: 'iPhone 15 Pro', 
        quantity: 1, 
        price: 7999,
        image: 'https://via.placeholder.com/100x100/007ACC/white?text=iPhone'
      }
    ],
    itemCount: 1,
    subtotal: 7999,
    shipping: 0,
    tax: 799.9,
    total: 8798.9,
    currency: 'CNY'
  },
  '/api/user/profile': {
    id: 1,
    name: '演示用户',
    email: 'demo@example.com',
    avatar: 'https://via.placeholder.com/64x64/4CAF50/white?text=U',
    memberLevel: 'VIP',
    points: 2580,
    joinDate: '2023-05-20',
    totalOrders: 15,
    totalSpent: 45600
  },
  '/api/categories': {
    categories: [
      { id: 1, name: '手机', count: 120 },
      { id: 2, name: '电脑', count: 85 },
      { id: 3, name: '配件', count: 200 },
      { id: 4, name: '音响', count: 45 }
    ]
  }
};

// 添加延迟模拟网络请求
function addDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API路由
Object.keys(apiData).forEach(endpoint => {
  app.get(endpoint, async (req, res) => {
    // 检查是否是预请求
    const isPrefetch = req.headers['x-prefetch-request-type'] === 'prefetch';
    const expireTime = req.headers['x-prefetch-expire-time'];
    
    // 模拟不同的网络延迟
    const delay = isPrefetch ? 50 : (Math.random() * 400 + 200); // 预请求更快
    await addDelay(delay);
    
    console.log(`${isPrefetch ? '🔄 [PREFETCH]' : '📡 [REQUEST]'} ${endpoint} - ${Math.round(delay)}ms`);
    
    if (isPrefetch && expireTime) {
      res.set('X-Prefetch-Response', 'true');
      res.set('X-Prefetch-Expire-Time', expireTime);
    }
    
    res.json(apiData[endpoint]);
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 API 服务器启动成功！`);
  console.log(`📍 地址: http://localhost:${port}`);
  console.log(`🎯 API 端点:`);
  Object.keys(apiData).forEach(endpoint => {
    console.log(`   http://localhost:${port}${endpoint}`);
  });
  console.log(`💡 支持 Prefetch 预请求头:`);
  console.log(`   X-Prefetch-Request-Type: prefetch`);
  console.log(`   X-Prefetch-Expire-Time: 30000`);
});

module.exports = app;
