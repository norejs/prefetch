# API 模拟数据

这个目录包含了用于测试 @norejs/prefetch 功能的模拟 API 数据。

## 目录结构

```
api/
├── index.json              # API 端点列表
├── users.json              # 用户列表
├── users/
│   └── 1.json              # 用户详情
├── products.json           # 产品列表
├── orders/
│   └── 123.json            # 订单详情
├── system/
│   └── status.json         # 系统状态
└── custom/
    └── test.json           # 自定义测试端点
```

## 可用端点

| 端点 | 描述 | 缓存 |
|------|------|------|
| `/api/index.json` | API 端点列表 | ✅ |
| `/api/users.json` | 用户列表 | ✅ |
| `/api/users/1.json` | 用户详情 | ✅ |
| `/api/products.json` | 产品列表 | ✅ |
| `/api/orders/123.json` | 订单详情 | ✅ |
| `/api/system/status.json` | 系统状态 | ❌ |
| `/api/custom/test.json` | 自定义测试 | ✅ |

## 使用方法

### 1. 普通 fetch 请求

```javascript
const response = await fetch('/api/users.json')
const data = await response.json()
console.log(data)
```

### 2. 使用 preFetch 预取

```javascript
import { preFetch } from '@norejs/prefetch'

// 预取数据
await preFetch('/api/users.json', {
  expireTime: 30000 // 30秒过期时间
})

// 实际请求时会从缓存返回
const response = await fetch('/api/users.json')
const data = await response.json()
```

## 数据特点

- 所有数据都是静态 JSON 文件
- 包含丰富的模拟数据
- 支持嵌套对象和数组
- 包含时间戳和元数据
- 适合测试缓存和预取功能

## 测试建议

1. 先使用 preFetch 预取数据
2. 然后使用 fetch 获取数据，观察是否从缓存返回
3. 检查浏览器开发者工具的 Network 面板
4. 观察 Service Worker 的日志输出