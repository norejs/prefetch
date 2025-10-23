# React CRA + Prefetch Demo

使用 Create React App 创建的 Prefetch Worker 集成示例。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 Service Worker

```bash
# 方式一：使用 CLI 工具创建
npm run create-sw

# 方式二：如果已有 Service Worker，集成 Prefetch
npm run integrate-prefetch
```

### 3. 启动开发服务器

```bash
npm start
```

访问 http://localhost:3000

## 功能特性

- ✅ Service Worker 自动注册
- ✅ Prefetch Worker 初始化
- ✅ API 预请求演示
- ✅ 缓存命中率统计
- ✅ 实时状态监控

## 项目结构

```
react-cra-demo/
├── public/
│   ├── index.html
│   └── service-worker.js          # 由 CLI 工具生成
├── src/
│   ├── App.js                     # 主组件
│   ├── App.css                    # 样式
│   ├── index.js                   # 入口文件
│   └── index.css
└── package.json
```

## 使用说明

### 初次使用

1. 打开应用后，Service Worker 会自动注册
2. 首次访问需要刷新页面以激活 Service Worker
3. 点击"重新初始化"按钮初始化 Prefetch Worker
4. 使用"预请求数据"和"获取数据"按钮测试功能

### 测试流程

1. **预请求**: 点击"预请求数据"按钮，数据会被缓存
2. **获取数据**: 点击"获取数据"按钮，从缓存快速返回
3. **查看统计**: 观察缓存命中率和响应时间

## 注意事项

- Service Worker 需要 HTTPS 或 localhost 环境
- 首次注册后需要刷新页面
- 开发环境下可能需要清除缓存测试

## 相关命令

```bash
npm start          # 启动开发服务器
npm run build      # 构建生产版本
npm run create-sw  # 创建 Service Worker
```

