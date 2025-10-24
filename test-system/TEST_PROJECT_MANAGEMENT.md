# Test Project Management

## 概述

测试系统现在有两种方式管理测试项目：
1. **自动化测试** - 使用 `test-apps/` 目录
2. **手动测试** - 使用 `demos/` 目录

## 📁 目录结构

```
project-root/
├── test-system/
│   ├── templates/          # ✅ 标准测试模板（git 跟踪）
│   ├── demos/              # 🔧 手动测试目录（git 忽略）
│   │   ├── copy-template.js
│   │   ├── README.md
│   │   └── [projects]/     # 复制的项目
│   └── test-runner/        # 测试运行器
└── test-apps/              # 🤖 自动化测试目录（git 忽略）
    └── [projects]/         # 测试生成的项目
```

## 🤖 自动化测试 (test-apps/)

### 特点

- ✅ 自动生成和管理
- ✅ 测试完成后保留（用于调试）
- ✅ 测试开始时自动清理
- ❌ 不被 git 跟踪

### 使用方式

```bash
# 运行测试（自动使用 test-apps）
pnpm test:quick

# 测试完成后，项目保存在 test-apps/
ls ../test-apps/
# react-cra-no-sw/
# nextjs-no-sw/
# ...
```

### 配置

```javascript
// test-config.js
templates: {
  baseDir: './templates',
  tempDir: '../test-apps'  // 保存到根目录
}
```

### 清理

```bash
# 清理所有测试项目
pnpm clean:test-apps

# 或手动删除
rm -rf test-apps/
```

## 🔧 手动测试 (demos/)

### 特点

- ✅ 手动复制和管理
- ✅ 用于开发和调试
- ✅ 自动复制 API 服务器
- ❌ 不被 git 跟踪

### 使用方式

#### 1. 复制模板

```bash
cd test-system

# 复制单个模板
pnpm demo:copy react-cra-no-sw

# 复制所有模板
pnpm demo:all

# 查看可用模板
pnpm demo:list
```

#### 2. 启动 API 服务器

```bash
cd demos/api-server
npm install
npm start
```

#### 3. 启动模板项目

```bash
cd demos/react-cra-no-sw
pnpm install
pnpm dev
```

#### 4. 测试 CLI 工具

```bash
cd demos/react-cra-no-sw
node ../../packages/prefetch/bin/prefetch-migrate.js
```

### 清理

```bash
# 清理所有 demos
pnpm clean:demos

# 或手动删除
rm -rf demos/*/
```

## 📊 目录对比

| 特性 | templates/ | test-apps/ | demos/ |
|------|-----------|-----------|--------|
| **用途** | 标准模板 | 自动化测试 | 手动测试 |
| **生成方式** | 手动创建 | 自动生成 | 手动复制 |
| **保留策略** | 永久保留 | 测试后保留 | 手动管理 |
| **清理时机** | 不清理 | 测试开始时 | 手动清理 |
| **Git 跟踪** | ✅ 跟踪 | ❌ 忽略 | ❌ 忽略 |
| **包含 API** | ❌ 不包含 | ❌ 不包含 | ✅ 自动复制 |
| **适用场景** | 测试系统使用 | 自动化测试 | 开发调试 |

## 🎯 使用场景

### 场景 1：运行自动化测试

```bash
# 测试会自动使用 test-apps/
pnpm test:quick

# 查看测试后的项目
cd ../test-apps/react-cra-no-sw
ls -la
```

**优势**：
- 自动管理，无需手动操作
- 测试后可以查看项目状态
- 用于调试测试失败的原因

### 场景 2：手动测试 CLI 工具

```bash
# 1. 复制模板
cd test-system
pnpm demo:copy react-cra-no-sw

# 2. 启动 API 服务器
cd demos/api-server
npm install && npm start &

# 3. 测试 CLI 工具
cd ../react-cra-no-sw
node ../../packages/prefetch/bin/prefetch-migrate.js

# 4. 启动项目验证
pnpm install && pnpm dev
```

**优势**：
- 完全控制测试流程
- 可以逐步验证每个步骤
- 适合开发和调试

### 场景 3：开发新功能

```bash
# 1. 复制模板作为开发环境
pnpm demo:copy react-vite-no-sw

# 2. 修改 prefetch 包代码
cd ../../packages/prefetch
# 修改代码...

# 3. 在 demo 中测试
cd ../../test-system/demos/react-vite-no-sw
pnpm install  # 自动链接 workspace 包
pnpm dev      # 测试修改
```

**优势**：
- 使用 workspace 依赖
- 修改立即生效
- 快速迭代开发

### 场景 4：测试浏览器功能

```bash
# 1. 复制已有 Prefetch 的模板
pnpm demo:copy react-cra-with-prefetch

# 2. 启动服务
cd demos/api-server && npm start &
cd demos/react-cra-with-prefetch && pnpm dev

# 3. 在浏览器中测试
# 打开 http://localhost:3000
# 测试 Prefetch 功能
```

**优势**：
- 真实浏览器环境
- 可以使用开发者工具
- 查看网络请求和缓存

## 🧹 清理策略

### 自动清理

```bash
# 测试开始时自动清理 test-apps
pnpm test:quick
# 会先删除 test-apps/ 中已存在的项目
```

### 手动清理

```bash
# 清理 demos
pnpm clean:demos

# 清理 test-apps
pnpm clean:test-apps

# 清理所有
pnpm clean:demos && pnpm clean:test-apps
```

### Git 清理

```bash
# 使用 git clean 清理所有忽略的文件
git clean -fdx test-system/demos/
git clean -fdx test-apps/
```

## 💡 最佳实践

### 1. 自动化测试

- ✅ 使用 `pnpm test:quick` 快速测试
- ✅ 测试失败后查看 `test-apps/` 中的项目
- ✅ 定期清理 `test-apps/` 释放空间

### 2. 手动测试

- ✅ 使用 `demos/` 进行开发和调试
- ✅ 始终启动 API 服务器
- ✅ 使用 workspace 依赖测试最新代码
- ✅ 测试完成后清理 `demos/`

### 3. 开发工作流

```bash
# 1. 修改 prefetch 包
cd packages/prefetch
# 修改代码...

# 2. 快速自动化测试
pnpm test:quick

# 3. 如果失败，手动测试
cd test-system
pnpm demo:copy react-cra-no-sw
cd demos/react-cra-no-sw
node ../../packages/prefetch/bin/prefetch-migrate.js

# 4. 验证修复
pnpm test:quick
```

## 📚 相关文档

- [Demos 使用指南](demos/README.md)
- [快速开始](QUICK_START.md)
- [设计文档](../.kiro/specs/comprehensive-testing-system/design.md)
- [任务列表](../.kiro/specs/comprehensive-testing-system/tasks.md)

## ❓ 常见问题

### Q: test-apps 和 demos 有什么区别？

A: 
- `test-apps/` 用于自动化测试，由测试系统自动管理
- `demos/` 用于手动测试，由开发者手动管理

### Q: 为什么测试后不删除 test-apps？

A: 保留测试项目可以：
- 查看测试后的项目状态
- 调试测试失败的原因
- 验证文件生成是否正确

### Q: 如何清理磁盘空间？

A:
```bash
# 清理 demos
pnpm clean:demos

# 清理 test-apps
pnpm clean:test-apps

# 清理 node_modules
pnpm clean
```

### Q: demos 中的项目会被 git 跟踪吗？

A: 不会。`demos/` 中的项目（除了 `copy-template.js` 和 `README.md`）都在 `.gitignore` 中。

### Q: 可以在 templates 目录中直接测试吗？

A: 不建议。`templates/` 是标准模板，应该保持干净。使用 `demos/` 或 `test-apps/` 进行测试。

### Q: 如何更新 demos 中的模板？

A: 删除旧的，重新复制：
```bash
rm -rf demos/react-cra-no-sw
pnpm demo:copy react-cra-no-sw
```
