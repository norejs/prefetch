# Test System Scripts

这个目录包含测试系统的实用脚本。

## 📜 可用脚本

### copy-template.js

复制测试模板到 demos 目录用于手动测试。

**功能：**
- 复制指定模板到 `demos/` 目录
- 自动添加 workspace 依赖
- 支持复制所有模板
- 显示 API 服务器位置

**使用方法：**

```bash
# 从 test-system 目录运行

# 查看可用模板
node scripts/copy-template.js list
# 或
pnpm demo:list

# 复制单个模板
node scripts/copy-template.js react-cra-no-sw
# 或
pnpm demo:copy react-cra-no-sw

# 复制所有模板
node scripts/copy-template.js all
# 或
pnpm demo:all
```

**参数：**
- `<template-name>` - 要复制的模板名称
- `list` - 显示所有可用模板
- `all` - 复制所有模板

**示例：**

```bash
# 复制 React CRA 模板
node scripts/copy-template.js react-cra-no-sw

# 复制 Next.js 模板
node scripts/copy-template.js nextjs-no-sw

# 复制所有模板
node scripts/copy-template.js all
```

### run-demo.js

运行 demo 项目，自动处理所有依赖和服务。

**功能：**
- 交互式选择 demo
- 自动检查 API 服务器状态
- 自动启动 API 服务器（如果未运行）
- 自动安装依赖（如果需要）
- 启动 demo 项目

**使用方法：**

```bash
# 从 test-system 目录运行

# 交互式选择 demo
node scripts/run-demo.js
# 或
pnpm demo:run

# 直接运行指定 demo
node scripts/run-demo.js react-cra-no-sw
# 或
pnpm demo:run react-cra-no-sw
```

**参数：**
- `[demo-name]` - 可选，要运行的 demo 名称（如果不提供则交互式选择）

**示例：**

```bash
# 交互式选择
node scripts/run-demo.js

# 直接运行
node scripts/run-demo.js react-cra-no-sw
```

**工作流程：**

1. 检查 demo 是否存在
2. 检查 API 服务器是否运行
3. 如果 API 服务器未运行，自动启动
4. 检查 demo 依赖是否安装
5. 如果依赖未安装，运行 `pnpm install`
6. 启动 demo 项目

## 🚀 快速开始

### 完整工作流程

```bash
# 1. 进入 test-system 目录
cd test-system

# 2. 查看可用模板
pnpm demo:list

# 3. 复制模板
pnpm demo:copy react-cra-no-sw

# 4. 运行 demo（自动处理一切）
pnpm demo:run react-cra-no-sw
```

### 一键运行（推荐）

```bash
# 从根目录
pnpm test:demo:copy react-cra-no-sw
pnpm test:demo:run react-cra-no-sw

# 或从 test-system 目录
pnpm demo:copy react-cra-no-sw
pnpm demo:run react-cra-no-sw
```

## 📦 依赖

这些脚本需要以下依赖：

- `fs-extra` - 文件系统操作
- `chalk` - 终端颜色输出
- `readline` - 交互式输入（run-demo.js）
- `http` - HTTP 请求（run-demo.js）

所有依赖都已在 `test-system/package.json` 中定义。

## 🔧 开发

### 添加新脚本

1. 在 `scripts/` 目录创建新脚本
2. 添加 shebang: `#!/usr/bin/env node`
3. 使脚本可执行: `chmod +x scripts/your-script.js`
4. 在 `package.json` 中添加快捷命令
5. 更新此 README

### 脚本规范

- 使用 Node.js 编写
- 使用 `chalk` 进行彩色输出
- 提供清晰的错误消息
- 支持 `--help` 参数
- 包含使用示例

## 📚 相关文档

- [Demos 使用指南](../demos/README.md)
- [快速开始](../QUICK_START.md)
- [测试配置](../test-config.js)

## 💡 提示

1. **使用 pnpm 命令**
   - 推荐使用 `pnpm demo:*` 命令而不是直接运行脚本
   - 更简洁，更容易记忆

2. **从正确的目录运行**
   - 脚本设计为从 `test-system` 目录运行
   - 路径都是相对于 `test-system` 目录

3. **检查依赖**
   - 如果脚本失败，检查是否安装了依赖
   - 运行 `pnpm install` 安装所有依赖

4. **查看帮助**
   - 大多数脚本支持 `--help` 或不带参数运行显示帮助
   - 例如：`node scripts/copy-template.js`

## 🐛 故障排除

### 脚本无法运行

```bash
# 确保脚本有执行权限
chmod +x scripts/*.js

# 确保依赖已安装
pnpm install
```

### 路径错误

```bash
# 确保从 test-system 目录运行
cd test-system
node scripts/copy-template.js
```

### API 服务器无法启动

```bash
# 手动启动 API 服务器
cd api-server
npm install
npm start
```
