const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// 启用CORS
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js dev
    'http://localhost:4173',  // Vite preview
    'http://localhost:5173',  // Vite dev
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());

// 模拟API数据
const apiData = {
  '/api/products': {
    products: [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        price: 7999,
        description: '强大的 A17 Pro 芯片，钛金属机身，专业级摄像头系统',
        category: '智能手机',
        image: 'https://placeholder.co/400x300/007ACC/white?text=iPhone+15+Pro'
      },
      {
        id: 2,
        name: 'MacBook Pro M3',
        price: 14999,
        description: '搭载M3芯片的新一代MacBook Pro，性能强劲',
        category: '笔记本电脑',
        image: 'https://placeholder.co/400x300/4ECDC4/white?text=MacBook+Pro'
      },
      {
        id: 3,
        name: 'AirPods Pro 2',
        price: 1899,
        description: '主动降噪，空间音频，长续航',
        category: '耳机',
        image: 'https://placeholder.co/400x300/FF6B6B/white?text=AirPods+Pro'
      },
      {
        id: 4,
        name: 'iPad Air',
        price: 4799,
        description: '轻薄设计，强大性能，支持Apple Pencil',
        category: '平板电脑',
        image: 'https://placeholder.co/400x300/45B7D1/white?text=iPad+Air'
      },
      {
        id: 5,
        name: 'Apple Watch Series 9',
        price: 2999,
        description: '健康监测，运动追踪，智能提醒',
        category: '智能手表',
        image: 'https://placeholder.co/400x300/F9CA24/white?text=Apple+Watch'
      },
      {
        id: 6,
        name: 'Mac Studio',
        price: 15999,
        description: '专业工作站，M2 Ultra芯片，极致性能',
        category: '台式电脑',
        image: 'https://placeholder.co/400x300/6C5CE7/white?text=Mac+Studio'
      }
    ],
    total: 6,
    page: 1,
    limit: 20
  },
  '/api/products/1': {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 7999,
    description: '强大的 A17 Pro 芯片，钛金属机身',
    specs: ['6.1英寸显示屏', '128GB存储', 'A17 Pro芯片'],
    category: 'smartphone',
    stock: 50,
    images: [
      'https://placeholder.co/400x400/007ACC/white?text=iPhone+15+Pro'
    ],
    features: [
      '6.1英寸超视网膜XDR显示屏',
      'A17 Pro仿生芯片',
      '专业级摄像头系统',
      '钛金属设计',
      '支持5G网络'
    ],
    colors: ['钛原色', '钛蓝色', '钛白色', '钛黑色']
  },
  '/api/products/2': {
    comments: [
      { 
        id: 1,
        user: '张三', 
        rating: 5, 
        comment: '很好用，推荐！性能强劲，拍照效果很棒。',
        date: '2024-01-15',
        helpful: 23,
        avatar: 'https://placeholder.co/32x32/4CAF50/white?text=张'
      },
      { 
        id: 2,
        user: '李四', 
        rating: 4, 
        comment: '性价比不错，但价格还是有点高。',
        date: '2024-01-14',
        helpful: 15,
        avatar: 'https://placeholder.co/32x32/2196F3/white?text=李'
      },
      { 
        id: 3,
        user: '王五', 
        rating: 5, 
        comment: '苹果品质值得信赖，用了一个月非常满意。',
        date: '2024-01-13',
        helpful: 31,
        avatar: 'https://placeholder.co/32x32/FF9800/white?text=王'
      },
      {
        id: 4,
        user: '赵六',
        rating: 4,
        comment: '钛金属手感很好，就是容易留指纹。',
        date: '2024-01-12',
        helpful: 8,
        avatar: 'https://placeholder.co/32x32/9C27B0/white?text=赵'
      }
    ],
    rating: 4.8,
    totalComments: 1250,
    productId: 1,
    ratingDistribution: {
      5: 890,
      4: 280,
      3: 60,
      2: 15,
      1: 5
    }
  },
  '/api/cart': {
    items: [
      { 
        id: 1, 
        productId: 1,
        name: 'iPhone 15 Pro', 
        quantity: 1, 
        price: 7999,
        originalPrice: 8999,
        discount: 1000,
        image: 'https://placeholder.co/100x100/007ACC/white?text=iPhone',
        color: '钛原色',
        storage: '128GB'
      },
      {
        id: 2,
        productId: 3,
        name: 'AirPods Pro 2',
        quantity: 1,
        price: 1899,
        originalPrice: 1899,
        discount: 0,
        image: 'https://placeholder.co/100x100/FF6B6B/white?text=AirPods',
        color: '白色',
        features: ['主动降噪', '空间音频']
      }
    ],
    itemCount: 2,
    subtotal: 9898,
    shipping: 0,
    tax: 989.8,
    discount: 1000,
    total: 9887.8,
    currency: 'CNY',
    estimatedDelivery: '2024-01-20',
    couponCode: 'SAVE1000'
  },
  '/api/user/profile': {
    id: 1,
    name: '演示用户',
    email: 'demo@example.com',
    phone: '138****8888',
    avatar: 'https://placeholder.co/64x64/4CAF50/white?text=U',
    memberLevel: 'VIP',
    points: 2580,
    joinDate: '2023-05-20',
    totalOrders: 15,
    totalSpent: 45600,
    addresses: [
      {
        id: 1,
        name: '张三',
        phone: '138****8888',
        address: '北京市朝阳区xxx街道xxx小区xxx号',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      sms: false,
      language: 'zh-CN',
      currency: 'CNY'
    }
  },
  '/api/categories': {
    categories: [
      { 
        id: 1, 
        name: '手机', 
        count: 120,
        icon: '📱',
        description: '智能手机及配件',
        featured: true,
        subcategories: ['iPhone', 'Android', '手机壳', '充电器']
      },
      { 
        id: 2, 
        name: '电脑', 
        count: 85,
        icon: '💻',
        description: '笔记本电脑和台式机',
        featured: true,
        subcategories: ['MacBook', 'Windows笔记本', '台式机', '显示器']
      },
      { 
        id: 3, 
        name: '配件', 
        count: 200,
        icon: '🎧',
        description: '数码配件和周边产品',
        featured: false,
        subcategories: ['耳机', '音箱', '键盘', '鼠标']
      },
      { 
        id: 4, 
        name: '音响', 
        count: 45,
        icon: '🔊',
        description: '专业音响设备',
        featured: false,
        subcategories: ['蓝牙音箱', '智能音箱', 'HiFi设备']
      }
    ],
    featured: [
      {
        id: 1,
        title: '新品发布',
        description: 'iPhone 15 系列全新上市',
        image: 'https://placeholder.co/300x200/007ACC/white?text=iPhone+15',
        link: '/products/1'
      },
      {
        id: 2,
        title: '年终大促',
        description: '精选商品限时优惠',
        image: 'https://placeholder.co/300x200/FF6B6B/white?text=Sale',
        link: '/categories'
      }
    ]
  },
  '/api/orders': {
    orders: [
      {
        id: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        statusText: '已送达',
        total: 7999,
        items: [
          {
            name: 'iPhone 15 Pro',
            quantity: 1,
            price: 7999,
            image: 'https://placeholder.co/60x60/007ACC/white?text=iPhone'
          }
        ]
      },
      {
        id: 'ORD-2024-002',
        date: '2024-01-10',
        status: 'shipping',
        statusText: '运输中',
        total: 1899,
        items: [
          {
            name: 'AirPods Pro 2',
            quantity: 1,
            price: 1899,
            image: 'https://placeholder.co/60x60/FF6B6B/white?text=AirPods'
          }
        ]
      }
    ]
  },
  '/api/recommendations': {
    products: [
      {
        id: 2,
        name: 'MacBook Pro 14',
        price: 14999,
        image: 'https://placeholder.co/200x200/9C27B0/white?text=MacBook',
        rating: 4.9,
        reason: '基于您的浏览历史'
      },
      {
        id: 3,
        name: 'AirPods Pro 2',
        price: 1899,
        image: 'https://placeholder.co/200x200/FF6B6B/white?text=AirPods',
        rating: 4.7,
        reason: '经常一起购买'
      }
    ]
  }
};

// 添加延迟模拟网络请求
function addDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 记录请求统计
const requestStats = {
  total: 0,
  prefetch: 0,
  normal: 0,
  byEndpoint: {}
};

// API路由
Object.keys(apiData).forEach(endpoint => {
  app.get(endpoint, async (req, res) => {
    // 更新统计信息
    requestStats.total++;
    requestStats.normal++;
    
    if (!requestStats.byEndpoint[endpoint]) {
      requestStats.byEndpoint[endpoint] = { total: 0, prefetch: 0, normal: 0 };
    }
    requestStats.byEndpoint[endpoint].total++;
    requestStats.byEndpoint[endpoint].normal++;
    
    // 统一的网络延迟模拟 (3-4秒)
    const delay = Math.random() * 1000 + 3000;
    
    await addDelay(delay);
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const clientInfo = userAgent.includes('Chrome') ? '🌐 Chrome' : 
                      userAgent.includes('Firefox') ? '🦊 Firefox' : 
                      userAgent.includes('Safari') ? '🧭 Safari' : '❓ Unknown';
    
    console.log(`📡 [REQUEST] ${endpoint} - ${Math.round(delay)}ms ${clientInfo}`);
    
    // 添加通用响应头
    res.set('X-Response-Time', Math.round(delay));
    res.set('X-Request-ID', Math.random().toString(36).substr(2, 9));
    
    res.json(apiData[endpoint]);
  });
});

// 统计信息端点
app.get('/api/stats', (req, res) => {
  res.json({
    ...requestStats,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// 根路径信息
app.get('/', (req, res) => {
  res.json({
    name: 'Prefetch Demo API Server',
    version: '1.0.0',
    description: '为预请求演示项目提供模拟 API 数据',
    endpoints: Object.keys(apiData),
    specialEndpoints: ['/health', '/api/stats'],
    documentation: 'https://github.com/your-repo/prefetch',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `端点 ${req.path} 不存在`,
    availableEndpoints: Object.keys(apiData),
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((error, req, res, next) => {
  console.error('API 错误:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: '服务器内部错误',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(port, () => {
  console.log('🚀 Prefetch Demo API 服务器启动成功！');
  console.log('');
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`🏥 健康检查: http://localhost:${port}/health`);
  console.log(`📊 统计信息: http://localhost:${port}/api/stats`);
  console.log('');
  console.log('🎯 API 端点:');
  Object.keys(apiData).forEach(endpoint => {
    console.log(`   http://localhost:${port}${endpoint}`);
  });
  console.log('');
  console.log('🔧 支持的客户端:');
  console.log('   - Next.js (http://localhost:3000)');
  console.log('   - Vite Dev (http://localhost:5173)');
  console.log('   - Vite Preview (http://localhost:4173)');
  console.log('');
  console.log('📝 使用 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭服务器...');
  console.log('📊 最终统计:');
  console.log(`   总请求数: ${requestStats.total}`);
  console.log('👋 再见！');
  process.exit(0);
});

module.exports = app;
