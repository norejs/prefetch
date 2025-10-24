# ✅ API Server as Independent Package

## 🎯 完成的改进

API 服务器现在是一个独立的 npm package，有自己的依赖管理。

### 改进前

```
test-system/
├── package.json          # 包含 express, cors
├── api-server/
│   └── index.js
└── node_modules/
    ├── express/
    └── cors/
```

**问题：**
- API 服务器依赖父级的 node_modules
- 无法独立安装和运行
- 依赖管理混乱

### 改进后

```
test-system/
├── package.json          # 不再包含 express, cors
├── api-server/
│   ├── package.json      # 独立的包配置
│   ├── index.js
│   ├── README.md
│   └── node_modules/     # 自己的依赖
│       ├── express/
│       └── cors/
└── node_modules/
    └── (其他依赖)
```

**优势：**
- ✅ 独立的依赖管理
- ✅ 可以独立安装和运行
- ✅ 清晰的职责分离
- ✅ 更好的可维护性

## 📦 Package 配置

### api-server/package.json

```json
{
  "name": "@norejs/test-api-server",
  "version": "1.0.0",
  "description": "Test API server for prefetch testing system",
  "main": "index.js",
  "private": true,
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'demos/**'
  - 'test-system'
  - 'test-system/api-server'  # 新增：独立包
  - 'test-apps/*'
  - 'test-system/demos/*'
```

## 🚀 使用方式

### 1. 独立安装

```bash
cd test-system/api-server
pnpm install
```

### 2. 独立运行

```bash
cd test-system/api-server
pnpm start
```

### 3. 在测试中使用

测试系统会自动管理 API 服务器：

```javascript
// test-runner/index.js
const APIServer = require('../api-server');

await APIServer.start(3001);
// 运行测试...
await APIServer.stop();
```

### 4. 在 demo 中使用

使用 `run-demo.js` 会自动处理：

```bash
pnpm demo:run
# 自动检查 API 服务器
# 如果未运行，自动安装依赖并启动
```

## 🔧 技术实现

### 1. 独立的 package.json

创建了 `api-server/package.json`，定义自己的依赖：

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

### 2. 从父级移除依赖

从 `test-system/package.json` 中移除了 express 和 cors：

```json
{
  "dependencies": {
    "@norejs/prefetch": "workspace:*",
    "@norejs/prefetch-worker": "workspace:*",
    "playwright": "^1.40.0",
    "fs-extra": "^11.2.0",
    "chalk": "^4.1.2",
    "execa": "^5.1.1",
    "yargs": "^17.7.2"
    // 移除了 express 和 cors
  }
}
```

### 3. 更新 workspace 配置

在 `pnpm-workspace.yaml` 中添加 api-server：

```yaml
packages:
  - 'test-system/api-server'
```

### 4. 更新启动脚本

`run-demo.js` 使用 pnpm 安装和启动：

```javascript
// 安装依赖
const installProcess = spawn('pnpm', ['install'], {
  cwd: apiServerDir,
  stdio: 'inherit',
  shell: true
});

// 启动服务器
const serverProcess = spawn('pnpm', ['start'], {
  cwd: apiServerDir,
  stdio: 'pipe',
  shell: true
});
```

## 📊 依赖管理

### pnpm Workspace 优势

使用 pnpm workspace，API 服务器：
- 有自己的 `node_modules`（通过符号链接）
- 共享公共依赖，节省空间
- 独立管理，清晰分离

### 依赖结构

```
node_modules/
└── .pnpm/
    ├── express@4.21.2/
    └── cors@2.8.5/

test-system/api-server/node_modules/
├── express -> ../../../node_modules/.pnpm/express@4.21.2/node_modules/express
└── cors -> ../../../node_modules/.pnpm/cors@2.8.5/node_modules/cors
```

## 🧪 验证

### 1. 检查独立依赖

```bash
cd test-system/api-server
ls -la node_modules/
# 应该看到 express 和 cors 的符号链接
```

### 2. 独立运行

```bash
cd test-system/api-server
pnpm start
# 应该成功启动在 http://localhost:3001
```

### 3. 测试健康检查

```bash
curl http://localhost:3001/api/health
# 应该返回 {"status":"ok",...}
```

## 📝 更新的文件

1. **test-system/api-server/package.json** - 新建独立包配置
2. **test-system/api-server/README.md** - 新建文档
3. **test-system/package.json** - 移除 express 和 cors
4. **pnpm-workspace.yaml** - 添加 api-server
5. **test-system/scripts/run-demo.js** - 使用 pnpm 安装和启动
6. **test-system/demos/README.md** - 更新说明

## 🎁 优势总结

### 1. 清晰的职责分离

- test-system：测试运行器和工具
- api-server：独立的 API 服务
- 各自管理自己的依赖

### 2. 更好的可维护性

- 依赖关系清晰
- 易于理解和修改
- 减少耦合

### 3. 独立部署能力

- 可以单独安装
- 可以单独运行
- 可以单独测试

### 4. 节省空间

- 使用 pnpm workspace
- 共享公共依赖
- 避免重复安装

## 🔄 迁移指南

如果你之前已经安装过依赖，需要重新安装：

```bash
# 1. 清理旧的 node_modules
cd test-system
rm -rf node_modules

# 2. 从根目录重新安装
cd ..
pnpm install

# 3. 验证 API 服务器
cd test-system/api-server
ls -la node_modules/
pnpm start
```

## ✅ 完成！

API 服务器现在是一个独立的 npm package：

- ✅ 有自己的 `package.json`
- ✅ 有自己的 `node_modules`
- ✅ 可以独立安装和运行
- ✅ 集成到 pnpm workspace
- ✅ 自动化脚本已更新
- ✅ 文档已完善

享受更清晰的架构！🎉
