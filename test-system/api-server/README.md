# Test API Server

测试系统使用的 API 服务器，为测试项目提供 RESTful API 端点。

## 📦 独立包

这是一个独立的 npm package (`@norejs/test-api-server`)，有自己的依赖管理。

**特点：**
- 独立的 `package.json`
- 独立的 `node_modules`
- 不依赖父级 test-system 的依赖
- 可以独立安装和运行

## 🚀 安装和运行

### 安装依赖

```bash
cd test-system/api-server
pnpm install
```

### 启动服务器

```bash
pnpm start
# 或
pnpm dev
```

服务器将在 http://localhost:3001 运行

## 📡 API 端点

### Products API

- `GET /api/products` - 获取所有产品
- `GET /api/products/:id` - 获取单个产品
- `POST /api/products` - 创建产品
- `PUT /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品

### Users API

- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### Health Check

- `GET /api/health` - 健康检查
- `GET /api/logs` - 获取请求日志

## 🔧 配置

服务器配置在 `test-system/test-config.js` 中：

```javascript
apiServer: {
  port: 3001,
  host: 'localhost',
  responseDelay: 0  // 模拟网络延迟（毫秒）
}
```

## 📦 依赖

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

**最小依赖：**
- `express` - Web 框架
- `cors` - CORS 中间件

## 🏗️ 架构

```
api-server/
├── index.js              # 主入口
├── routes/               # 路由定义
│   ├── products.js
│   └── users.js
├── middleware/           # 中间件
│   ├── logger.js
│   └── delay.js
├── package.json          # 独立的包配置
└── README.md
```

## 🔌 中间件

### Logger Middleware

记录所有请求：
- 请求方法和 URL
- 请求头
- 请求体
- 响应状态码
- 响应时间

### Delay Middleware

模拟网络延迟：
```javascript
// 在 test-config.js 中配置
apiServer: {
  responseDelay: 1000  // 1秒延迟
}
```

## 🧪 测试使用

### 自动化测试

测试系统会自动启动和停止 API 服务器：

```javascript
// test-runner/index.js
await apiServer.start(3001);
// 运行测试...
await apiServer.stop();
```

### 手动测试

使用 `run-demo.js` 会自动检查并启动 API 服务器：

```bash
pnpm demo:run
# 自动检查 API 服务器
# 如果未运行，自动启动
```

### 独立运行

也可以独立运行用于开发：

```bash
cd test-system/api-server
pnpm install
pnpm start
```

## 📊 请求日志

API 服务器会记录所有请求，可以通过以下方式查看：

### 1. 控制台输出

启动时设置 verbose 模式：
```javascript
// test-config.js
reporting: {
  verbose: true
}
```

### 2. API 端点

```bash
curl http://localhost:3001/api/logs
```

### 3. 程序访问

```javascript
const logs = apiServer.getRequestLogs();
console.log(logs);
```

## 🔄 与测试系统集成

### 在测试中使用

```javascript
const APIServer = require('./api-server');

// 启动服务器
await APIServer.start(3001);

// 运行测试...

// 获取请求日志
const logs = APIServer.getRequestLogs();

// 停止服务器
await APIServer.stop();
```

### 在 demo 中使用

```bash
# 自动启动（推荐）
pnpm demo:run

# 手动启动
cd test-system/api-server
pnpm start
```

## 🛠️ 开发

### 添加新的 API 端点

1. 在 `routes/` 目录创建新的路由文件
2. 在 `index.js` 中注册路由

```javascript
// routes/new-api.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'New API' });
});

module.exports = router;

// index.js
const newApiRouter = require('./routes/new-api');
app.use('/api/new-api', newApiRouter);
```

### 添加新的中间件

1. 在 `middleware/` 目录创建中间件文件
2. 在 `index.js` 中使用

```javascript
// middleware/auth.js
module.exports = (req, res, next) => {
  // 认证逻辑
  next();
};

// index.js
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);
```

## 📝 注意事项

1. **独立依赖管理**
   - API 服务器有自己的 `package.json`
   - 不依赖父级 test-system 的依赖
   - 需要单独安装依赖

2. **端口占用**
   - 默认使用端口 3001
   - 如果端口被占用，修改 `test-config.js`

3. **CORS 配置**
   - 默认允许所有来源
   - 生产环境需要配置具体的来源

4. **数据持久化**
   - 当前使用内存存储
   - 重启服务器会丢失数据
   - 适合测试使用

## 🔗 相关文档

- [Test System README](../README.md)
- [Test Config](../test-config.js)
- [Demo Usage](../demos/README.md)
