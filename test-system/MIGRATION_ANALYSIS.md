# Test Directories Migration Analysis

## 概述

本文档分析了项目中现有的测试相关目录，并说明它们与新的 `test-system` 的关系。

## 现有测试目录

### 1. test-projects/ (根目录)

**状态：** ⚠️ 已在 `.gitignore` 中被忽略，建议废弃

**内容：**
- `cra-test/` - Create React App 测试项目
- `final-test/` - 最终测试项目
- `nextjs-test/` - Next.js 测试项目
- `vue-vite-test/` - Vue 3 + Vite 测试项目

**用途：** 这些是早期用于手动测试的项目

**建议：** 
- ✅ 可以删除，功能已被 `test-system/templates/` 替代
- 这些项目的配置和结构已经迁移到 `test-system/templates/` 中
- 如果需要保留作为参考，可以移动到 `test-system/legacy/` 目录

### 2. test-templates/ (根目录)

**状态：** ⚠️ 仅包含一个模板，建议废弃

**内容：**
- `nextjs-clean/` - 干净的 Next.js 模板

**用途：** 早期的测试模板

**建议：**
- ✅ 可以删除或合并到 `test-system/templates/`
- `test-system/templates/` 已经包含了更完整的模板集合

### 3. test-system/templates/ (新系统)

**状态：** ✅ 活跃使用中

**内容：**
- `react-cra-no-sw/` - React CRA，无 Service Worker
- `react-cra-with-sw/` - React CRA，有 Service Worker
- `react-cra-with-workbox/` - React CRA，使用 Workbox
- `react-cra-with-prefetch/` - React CRA，已集成 Prefetch
- `react-vite-no-sw/` - React Vite，无 Service Worker
- `nextjs-no-sw/` - Next.js，无 Service Worker
- `nextjs-with-sw/` - Next.js，有 Service Worker
- `vue3-vite-no-sw/` - Vue 3 Vite，无 Service Worker

**用途：** 自动化测试系统使用的标准化模板

**优势：**
- 标准化的目录结构
- 包含 `template-config.json` 配置文件
- 覆盖多种框架和场景
- 支持自动化测试流程

## 代码引用分析

### @test-templates 包

**搜索结果：** ❌ 未找到任何引用

**结论：** 从未作为 npm 包使用

### @test-projects 包

**搜索结果：** ❌ 未找到任何引用

**结论：** 从未作为 npm 包使用

### 文档引用

在以下文档中提到了这些目录：
- `.kiro/specs/sw-auto-detection/migration-tool-summary.md`
- `.kiro/specs/sw-auto-detection/design.md`
- `.kiro/specs/sw-auto-detection/tasks.md`

这些都是设计文档，不是实际代码引用。

## 迁移建议

### 立即行动

1. **保留 test-system/**
   - ✅ 已集成到 pnpm workspace
   - ✅ 包含完整的自动化测试系统
   - ✅ 使用 workspace 依赖引用最新的 prefetch 包

2. **删除 test-projects/**
   ```bash
   rm -rf test-projects/
   ```
   - 已在 `.gitignore` 中
   - 功能已被 `test-system/templates/` 替代
   - 没有代码引用

3. **删除 test-templates/**
   ```bash
   rm -rf test-templates/
   ```
   - 只有一个模板
   - 功能已被 `test-system/templates/` 替代
   - 没有代码引用

### 可选：保留作为参考

如果想保留这些目录作为历史参考：

```bash
# 创建归档目录
mkdir -p test-system/legacy

# 移动旧目录
mv test-projects test-system/legacy/
mv test-templates test-system/legacy/

# 添加说明文件
echo "These directories are kept for historical reference only." > test-system/legacy/README.md
```

## 新的测试工作流

### 使用 pnpm workspace

```bash
# 从根目录运行测试
pnpm test

# 快速测试（跳过安装和浏览器）
pnpm test:quick

# 测试单个模板
pnpm test:single

# 或者直接在 test-system 目录中
cd test-system
pnpm test
```

### 使用最新的 prefetch 包

test-system 现在通过 workspace 依赖使用最新的 prefetch 包：

```json
{
  "dependencies": {
    "@norejs/prefetch": "workspace:*",
    "@norejs/prefetch-worker": "workspace:*"
  }
}
```

这意味着：
- ✅ 始终使用 workspace 中最新的代码
- ✅ 不需要发布到 npm 就能测试
- ✅ 修改 prefetch 包后立即可以测试

## 目录结构对比

### 旧结构（废弃）
```
project-root/
├── test-projects/          # ❌ 手动测试项目
│   ├── cra-test/
│   ├── nextjs-test/
│   └── vue-vite-test/
└── test-templates/         # ❌ 简单模板
    └── nextjs-clean/
```

### 新结构（推荐）
```
project-root/
└── test-system/            # ✅ 完整的自动化测试系统
    ├── templates/          # 标准化测试模板
    │   ├── react-cra-no-sw/
    │   ├── nextjs-no-sw/
    │   └── ...
    ├── test-runner/        # 测试运行器
    ├── api-server/         # 测试 API 服务器
    └── test-results/       # 测试结果输出
```

## 总结

| 目录 | 状态 | 建议 | 原因 |
|------|------|------|------|
| `test-projects/` | 废弃 | 删除 | 已在 .gitignore，无代码引用 |
| `test-templates/` | 废弃 | 删除 | 只有一个模板，无代码引用 |
| `test-system/` | 活跃 | 保留并使用 | 完整的自动化测试系统 |

**推荐操作：**
```bash
# 1. 删除旧目录
rm -rf test-projects/ test-templates/

# 2. 重新安装依赖（使用 workspace）
pnpm install

# 3. 运行测试
pnpm test:quick
```
