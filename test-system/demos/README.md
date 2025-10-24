# Test System Demos

这个目录用于手动测试模板项目。你可以从 `templates/` 目录复制任何模板到这里进行手动测试和开发。

## 🚀 快速开始

### 方式 1：一键运行（推荐）

```bash
# 从根目录运行
pnpm test:demo:run

# 或从 test-system 目录运行
pnpm demo:run
```

这会：
1. 显示可用的 demos 列表
2. 让你选择要运行的 demo
3. 自动检查并启动 API 服务器（如果未运行）
4. 自动安装依赖（如果需要）
5. 启动选择的 demo 项目

### 方式 2：手动步骤

#### 1. 复制模板

```bash
# 从根目录
pnpm test:demo:copy react-cra-no-sw

# 或从 test-system 目录
pnpm demo:copy react-cra-no-sw

# 或直接运行脚本
cd test-system
node scripts/copy-template.js react-cra-no-sw
```

这会：
1. 复制指定的模板到 `demos/<template-name>/`
2. 自动添加 workspace 依赖到 package.json
3. 显示 API 服务器位置（不再复制）

#### 2. 启动 API 服务器

```bash
cd test-system/api-server
npm install
npm start
```

#### 3. 启动 demo 项目

```bash
cd test-system/demos/react-cra-no-sw
pnpm install  # 自动使用 workspace 依赖
pnpm dev
```

### 查看可用模板

```bash
# 从根目录
pnpm test:demo:list

# 或从 test-system 目录
pnpm demo:list
```

## 📦 可用模板

| 模板名称 | 框架 | Service Worker | Workbox | Prefetch |
|---------|------|----------------|---------|----------|
| `react-cra-no-sw` | React CRA | ❌ | ❌ | ❌ |
| `react-cra-with-sw` | React CRA | ✅ | ❌ | ❌ |
| `react-cra-with-workbox` | React CRA | ✅ | ✅ | ❌ |
| `react-cra-with-prefetch` | React CRA | ✅ | ❌ | ✅ |
| `react-vite-no-sw` | React Vite | ❌ | ❌ | ❌ |
| `nextjs-no-sw` | Next.js | ❌ | ❌ | ❌ |
| `nextjs-with-sw` | Next.js | ✅ | ❌ | ❌ |
| `vue3-vite-no-sw` | Vue 3 Vite | ❌ | ❌ | ❌ |

## 🔧 使用流程

### 快速流程（推荐）

```bash
# 1. 一键运行
pnpm test:demo:run

# 2. 选择要运行的 demo
# 3. 等待自动启动
# 4. 在浏览器中测试
```

### 手动流程

#### 1. 复制模板

```bash
cd test-system
pnpm demo:copy react-cra-no-sw
```

#### 2. 启动 API 服务器（如果未运行）

```bash
cd api-server
npm install
npm start
```

API 服务器将在 http://localhost:3001 运行

#### 3. 启动模板项目

```bash
cd demos/react-cra-no-sw
pnpm install  # 自动使用 workspace 依赖
pnpm dev
```

项目将在 http://localhost:3000 运行

#### 4. 测试 CLI 工具

在模板项目目录中运行 CLI 工具：

```bash
cd demos/react-cra-no-sw
node ../../packages/prefetch/bin/prefetch-migrate.js
```

## 📝 使用场景

### 场景 1：测试 CLI 工具

1. 复制一个没有 Prefetch 的模板
2. 在模板目录中运行 CLI 工具
3. 验证文件是否正确生成
4. 验证依赖是否正确添加

```bash
node demos/copy-template.js react-cra-no-sw
cd demos/react-cra-no-sw
node ../../packages/prefetch/bin/prefetch-migrate.js
```

### 场景 2：测试浏览器功能

使用一键运行命令：

```bash
# 1. 先复制模板
pnpm demo:copy react-cra-with-prefetch

# 2. 运行 demo（自动启动 API 服务器）
pnpm demo:run react-cra-with-prefetch

# 3. 在浏览器中测试
# 打开 http://localhost:3000
```

### 场景 3：开发新功能

1. 复制模板作为开发环境
2. 修改 prefetch 包代码
3. 在模板中测试修改
4. 使用 workspace 依赖自动获取最新代码

```bash
node demos/copy-template.js react-vite-no-sw
cd demos/react-vite-no-sw
pnpm install  # 会自动链接 workspace 中的 prefetch 包
pnpm dev
```

## 🧹 清理

### 删除单个模板

```bash
rm -rf demos/react-cra-no-sw
```

### 删除所有 demos

```bash
rm -rf demos/*/
# 保留 copy-template.js 和 README.md
```

### 使用 Git 清理

```bash
# demos 目录中的项目已在 .gitignore 中
# 可以使用 git clean 清理
git clean -fdx demos/
```

## 💡 提示

1. **使用一键运行命令**
   - `pnpm demo:run` 会自动处理所有步骤
   - 自动检查并启动 API 服务器
   - 自动安装依赖
   - 支持交互式选择 demo

2. **API 服务器管理**
   - API 服务器保留在 `test-system/api-server/`
   - 不再复制到 demos 目录
   - 所有 demos 共享同一个 API 服务器
   - 运行 demo 时会自动启动（如果未运行）

3. **使用 workspace 依赖**
   - 模板项目自动使用 workspace 中的 `@norejs/prefetch` 包
   - 复制模板时自动添加 workspace 依赖
   - 修改 prefetch 包后，重启模板项目即可看到效果
   - 使用 pnpm 管理依赖

4. **Monorepo 集成**
   - demos 目录已加入 pnpm workspace
   - test-apps 目录也已加入 workspace
   - 所有项目共享依赖，节省空间

5. **端口配置**
   - API 服务器默认端口：3001
   - 模板项目默认端口：3000
   - 如果端口被占用，需要修改配置

6. **保留用于调试**
   - demos 目录中的项目不会被 git 跟踪
   - 可以随意修改和测试
   - 不用担心影响原始模板

## 🔗 相关文档

- [快速开始指南](../QUICK_START.md)
- [使用文档](../test-runner/USAGE.md)
- [测试配置](../test-config.js)

## ❓ 常见问题

### Q: 为什么需要复制 API 服务器？

A: Prefetch 功能需要 API 服务器来测试数据预取。每个模板都需要与 API 服务器配合使用。

### Q: 可以直接在 templates 目录中测试吗？

A: 不建议。templates 目录是测试系统使用的标准模板，应该保持干净。使用 demos 目录可以避免污染原始模板。

### Q: 如何更新模板？

A: 删除 demos 中的旧模板，重新运行复制脚本即可。

### Q: demos 目录会被 git 跟踪吗？

A: 不会。demos 目录中的项目（除了 copy-template.js 和 README.md）都在 .gitignore 中。


### Q: API 服务器在哪里？

A: API 服务器保留在 `test-system/api-server/` 目录，不再复制到 demos。所有 demos 共享同一个 API 服务器。使用 `pnpm demo:run` 会自动启动。

### Q: 如何快速运行 demo？

A: 使用 `pnpm demo:run` 命令，它会：
- 显示可用的 demos 列表
- 让你选择要运行的 demo
- 自动检查并启动 API 服务器
- 自动安装依赖并启动项目

### Q: 为什么使用 pnpm？

A: demos 和 test-apps 已加入 pnpm workspace，可以自动使用最新的 workspace 依赖，无需发布包就能测试最新代码。
