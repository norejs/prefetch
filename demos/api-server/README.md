# Prefetch Demo API Server

为预请求演示项目提供模拟 API 数据的独立服务器。

## 功能特性

- 🚀 **独立运行**: 可被多个 demo 项目共享使用
- 🔄 **预请求支持**: 识别和处理预请求头
- 📊 **统计监控**: 实时请求统计和性能监控
- 🌐 **CORS 支持**: 支持跨域请求
- ⚡ **智能延迟**: 模拟真实网络延迟
- 🔍 **详细日志**: 彩色日志和请求追踪
- 🏥 **健康检查**: 系统状态监控端点

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动服务器

```bash
npm start
# 或
pnpm start
```

服务器将在 http://localhost:3001 启动

## API 端点

### 核心数据端点

| 端点 | 描述 | 数据类型 |
|------|------|----------|
| `GET /api/products/1` | 产品详情信息 | 产品对象 |
| `GET /api/products/2` | 产品评论数据 | 评论数组 |
| `GET /api/cart` | 购物车信息 | 购物车对象 |
| `GET /api/user/profile` | 用户资料 | 用户对象 |
| `GET /api/categories` | 商品分类 | 分类数组 |
| `GET /api/orders` | 订单历史 | 订单数组 |
| `GET /api/recommendations` | 推荐商品 | 推荐数组 |

### 系统端点

| 端点 | 描述 | 用途 |
|------|------|------|
| `GET /` | API 信息 | 服务器信息和文档 |
| `GET /health` | 健康检查 | 监控服务器状态 |
| `GET /api/stats` | 统计信息 | 请求统计和性能数据 |

## 预请求支持

### 请求头

发送预请求时，请添加以下请求头：

```http
X-Prefetch-Request-Type: prefetch
X-Prefetch-Expire-Time: 30000
```

### 响应行为

- **预请求延迟**: 50-150ms（模拟缓存命中）
- **正常请求延迟**: 200-800ms（模拟网络请求）
- **响应头**: 预请求会添加特殊的响应头

### 示例

```javascript
// 预请求
const response = await fetch('http://localhost:3001/api/products/1', {
  headers: {
    'X-Prefetch-Request-Type': 'prefetch',
    'X-Prefetch-Expire-Time': '30000'
  }
});

// 正常请求
const response = await fetch('http://localhost:3001/api/products/1');
```

## 数据结构

### 产品信息 (`/api/products/1`)

```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "price": 7999,
  "description": "强大的 A17 Pro 芯片，钛金属机身",
  "specs": ["6.1英寸显示屏", "128GB存储", "A17 Pro芯片"],
  "category": "smartphone",
  "stock": 50,
  "images": ["..."],
  "features": ["..."],
  "colors": ["..."]
}
```

### 购物车信息 (`/api/cart`)

```json
{
  "items": [...],
  "itemCount": 2,
  "subtotal": 9898,
  "shipping": 0,
  "tax": 989.8,
  "total": 9887.8,
  "currency": "CNY"
}
```

### 用户资料 (`/api/user/profile`)

```json
{
  "id": 1,
  "name": "演示用户",
  "email": "demo@example.com",
  "memberLevel": "VIP",
  "points": 2580,
  "totalOrders": 15,
  "totalSpent": 45600
}
```

## 统计监控

访问 `/api/stats` 查看实时统计：

```json
{
  "total": 156,
  "prefetch": 89,
  "normal": 67,
  "byEndpoint": {
    "/api/products/1": {
      "total": 45,
      "prefetch": 28,
      "normal": 17
    }
  },
  "uptime": 3600,
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

## 开发说明

### 支持的客户端

服务器配置了 CORS 支持以下客户端：

- Next.js 开发服务器 (http://localhost:3000)
- Vite 开发服务器 (http://localhost:5173)
- Vite 预览服务器 (http://localhost:4173)

### 环境变量

| 变量 | 默认值 | 描述 |
|------|-------|------|
| `PORT` | 3001 | 服务器端口 |

### 日志格式

```
🔄 [PREFETCH] /api/products/1 - 85ms 🌐 Chrome
📡 [REQUEST] /api/cart - 350ms 🦊 Firefox
```

- `🔄` : 预请求
- `📡` : 正常请求  
- `🌐` : Chrome 浏览器
- `🦊` : Firefox 浏览器
- `🧭` : Safari 浏览器

## 在 Demo 项目中使用

### Next.js Demo

```json
{
  "scripts": {
    "start-api": "cd ../api-server && npm start",
    "start-all": "concurrently \"npm run start-api\" \"npm run dev\""
  }
}
```

### Vite Demo

```json
{
  "scripts": {
    "start-api": "cd ../api-server && npm start", 
    "start": "concurrently \"npm run start-api\" \"npm run dev\""
  }
}
```

## 故障排除

### 端口被占用

如果端口 3001 被占用，可以设置环境变量：

```bash
PORT=3002 npm start
```

### CORS 错误

确保客户端地址在 CORS 配置中，或添加新的允许源：

```javascript
origin: [
  'http://localhost:3000',
  'http://your-new-client:port'
]
```

### 性能调优

可以调整延迟设置来模拟不同的网络条件：

```javascript
// 快速网络
const delay = isPrefetch ? 10 : 50;

// 慢速网络  
const delay = isPrefetch ? 200 : 1000;
```

## 扩展功能

### 添加新端点

1. 在 `apiData` 对象中添加新数据
2. 服务器会自动为新端点创建路由
3. 统计和日志会自动包含新端点

### 自定义中间件

可以添加认证、限流等中间件：

```javascript
// 示例：简单的 API 密钥验证
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }
  next();
});
```

## 许可证

ISC License
