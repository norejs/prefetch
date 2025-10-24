# API Server

测试系统的后端 API 服务器，为测试项目提供 RESTful API 端点。

## 功能特性

- ✅ RESTful API 端点（Products, Users）
- ✅ CORS 支持
- ✅ 请求日志记录
- ✅ 可配置的响应延迟（模拟网络延迟）
- ✅ 健康检查端点
- ✅ 错误处理

## 快速开始

### 启动服务器

```bash
# 方式 1: 直接运行
node api-server/index.js

# 方式 2: 使用 npm script
npm run api:start
```

服务器将在 `http://localhost:3001` 启动。

### 测试 API

```bash
# 运行测试脚本
node api-server/test-api.js
```

## API 端点

### 健康检查

```
GET /api/health
```

返回服务器状态和运行时间。

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T13:04:54.666Z",
  "uptime": 90.805482875
}
```

### Products API

#### 获取所有产品

```
GET /api/products
```

**查询参数:**
- `category` - 按类别过滤
- `inStock` - 按库存状态过滤 (true/false)
- `search` - 搜索产品名称或描述

**响应示例:**
```json
{
  "total": 5,
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```

#### 获取单个产品

```
GET /api/products/:id
```

#### 创建产品

```
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Category",
  "inStock": true
}
```

#### 更新产品

```
PUT /api/products/:id
Content-Type: application/json

{
  "price": 149.99
}
```

#### 删除产品

```
DELETE /api/products/:id
```

### Users API

#### 获取所有用户

```
GET /api/users
```

**查询参数:**
- `role` - 按角色过滤
- `active` - 按活跃状态过滤 (true/false)
- `search` - 搜索用户名、邮箱或姓名

**响应示例:**
```json
{
  "total": 5,
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "active": true
    }
  ]
}
```

#### 获取单个用户

```
GET /api/users/:id
```

### 请求日志

```
GET /api/logs
```

返回所有请求的日志记录（用于调试）。

## 配置

在 `test-config.js` 中配置服务器：

```javascript
{
  apiServer: {
    port: 3001,           // 服务器端口
    host: 'localhost',    // 服务器主机
    responseDelay: 0      // 响应延迟（毫秒）
  }
}
```

## 架构

```
api-server/
├── index.js              # 主服务器文件
├── routes/               # API 路由
│   ├── products.js       # Products 路由
│   └── users.js          # Users 路由
├── middleware/           # 中间件
│   ├── logger.js         # 请求日志中间件
│   └── delay.js          # 响应延迟中间件
├── test-api.js           # API 测试脚本
└── README.md             # 本文档
```

## 使用示例

### 在测试中使用

```javascript
const apiServer = require('./api-server/index.js');

// 启动服务器
await apiServer.start();

// 运行测试...

// 获取请求日志
const logs = apiServer.getRequestLogs();
console.log('Total requests:', logs.length);

// 设置响应延迟
apiServer.setResponseDelay(100); // 100ms 延迟

// 清除日志
apiServer.clearRequestLogs();

// 停止服务器
await apiServer.stop();
```

### 编程方式使用

```javascript
const APIServer = require('./api-server/index.js');

// 服务器已经是单例实例
APIServer.start(3002) // 使用自定义端口
  .then(() => console.log('Server started'))
  .catch(err => console.error('Failed to start:', err));
```

## 中间件

### 日志中间件

记录所有进入的 HTTP 请求，包括：
- 时间戳
- 请求方法和 URL
- 请求头和请求体
- 响应状态码和响应时间
- 客户端 IP

### 延迟中间件

模拟网络延迟，可在运行时动态调整：

```javascript
apiServer.setResponseDelay(500); // 设置 500ms 延迟
```

## 错误处理

服务器包含完整的错误处理：
- 404 错误（路由不存在）
- 500 错误（服务器内部错误）
- 400 错误（请求参数错误）

所有错误都会返回 JSON 格式的错误信息。

## 开发提示

1. **端口占用**: 如果端口 3001 被占用，服务器会抛出错误
2. **日志限制**: 请求日志最多保存 1000 条，超过会自动删除最旧的
3. **CORS**: 服务器允许所有来源的跨域请求
4. **优雅关闭**: 使用 Ctrl+C 可以优雅地关闭服务器
