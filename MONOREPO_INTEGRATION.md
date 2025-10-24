# Test System Monorepo Integration

## ✅ 完成的工作

### 1. 集成到 pnpm workspace

**修改的文件：**
- ✅ `pnpm-workspace.yaml` - 添加 `test-system` 到 workspace
- ✅ `package.json` (根目录) - 添加测试脚本
- ✅ `test-system/package.json` - 更新为使用 workspace 依赖

### 2. 使用 workspace 依赖

test-system 现在使用 workspace 中的最新 prefetch 包：

```json
{
  "dependencies": {
    "@norejs/prefetch": "workspace:*",
    "@norejs/prefetch-worker": "workspace:*"
  }
}
```

**优势：**
- ✅ 始终使用最新的本地代码
- ✅ 不需要发布就能测试
- ✅ 修改后立即生效

### 3. 分析旧测试目录

**test-projects/** (根目录)
- ❌ 已在 `.gitignore` 中
- ❌ 无代码引用
- ✅ 建议删除

**test-templates/** (根目录)
- ❌ 只有一个模板
- ❌ 无代码引用
- ✅ 建议删除

**结论：** 这两个目录都可以安全删除，功能已被 `test-system/templates/` 完全替代。

## 📦 新的项目结构

```
project-root/
├── packages/
│   ├── prefetch/              # @norejs/prefetch
│   └── prefetch-worker/       # @norejs/prefetch-worker
├── demos/
│   ├── vite-prefetch-demo/
│   └── nextjs-prefetch-demo/
├── test-system/               # @norejs/test-system (新增)
│   ├── templates/             # 测试模板
│   ├── test-runner/           # 测试运行器
│   ├── api-server/            # 测试 API
│   └── test-results/          # 测试结果
├── pnpm-workspace.yaml        # 更新：包含 test-system
└── package.json               # 更新：添加测试脚本
```

## 🚀 使用方法

### 安装依赖

```bash
# 从根目录安装所有依赖
pnpm install

# 安装 Playwright 浏览器
cd test-system
pnpm run install:playwright
```

### 运行测试

```bash
# 从根目录运行
pnpm test:quick              # 快速测试
pnpm test:single             # 测试单个模板
pnpm test                    # 完整测试

# 从 test-system 目录运行
cd test-system
pnpm test:quick
pnpm test:single
pnpm test
```

### 开发工作流

1. **修改 prefetch 包代码**
   ```bash
   cd packages/prefetch
   # 修改代码...
   ```

2. **立即测试修改**
   ```bash
   # 不需要构建或发布，直接测试
   pnpm test:quick
   ```

3. **查看测试结果**
   ```bash
   cat test-system/test-results/reports/latest-summary.json
   ```

## 📝 可用的脚本

### 根目录脚本

```bash
pnpm test              # 运行完整测试套件
pnpm test:quick        # 快速测试（跳过安装和浏览器）
pnpm test:single       # 测试单个模板
```

### test-system 脚本

```bash
pnpm test              # 运行完整测试
pnpm test:quick        # 快速测试
pnpm test:single       # 测试单个模板
pnpm test:cli          # 仅 CLI 测试
pnpm test:browser      # 仅浏览器测试
pnpm api:start         # 启动 API 服务器
pnpm clean             # 清理测试结果和依赖
```

## 🧹 清理旧目录（可选）

如果确认不再需要旧的测试目录：

```bash
# 删除旧的测试目录
rm -rf test-projects/
rm -rf test-templates/

# 重新安装依赖
pnpm install
```

或者保留作为参考：

```bash
# 移动到归档目录
mkdir -p test-system/legacy
mv test-projects test-system/legacy/
mv test-templates test-system/legacy/
```

## 📊 测试覆盖

test-system 现在包含 8 个标准化测试模板：

1. ✅ `react-cra-no-sw` - React CRA，无 Service Worker
2. ✅ `react-cra-with-sw` - React CRA，有 Service Worker
3. ✅ `react-cra-with-workbox` - React CRA，使用 Workbox
4. ✅ `react-cra-with-prefetch` - React CRA，已集成 Prefetch
5. ✅ `react-vite-no-sw` - React Vite，无 Service Worker
6. ✅ `nextjs-no-sw` - Next.js，无 Service Worker
7. ✅ `nextjs-with-sw` - Next.js，有 Service Worker
8. ✅ `vue3-vite-no-sw` - Vue 3 Vite，无 Service Worker

每个模板都包含：
- 标准化的项目结构
- `template-config.json` 配置文件
- 完整的 package.json
- 测试所需的所有文件

## 🔍 验证集成

运行以下命令验证集成是否成功：

```bash
# 1. 检查 workspace 配置
pnpm list --depth 0

# 2. 运行快速测试
pnpm test:quick

# 3. 检查测试结果
cat test-system/test-results/reports/latest-summary.json
```

## 📚 相关文档

- [快速开始指南](test-system/QUICK_START.md)
- [使用文档](test-system/test-runner/USAGE.md)
- [迁移分析](test-system/MIGRATION_ANALYSIS.md)
- [实现总结](test-system/test-runner/IMPLEMENTATION_SUMMARY.md)

## ⚠️ 注意事项

1. **Playwright 浏览器**：首次使用需要安装 Playwright 浏览器
   ```bash
   cd test-system
   pnpm run install:playwright
   ```

2. **开发服务器**：浏览器测试需要开发服务器支持（当前未实现）
   - 使用 `--skip-browser` 跳过浏览器测试

3. **依赖安装**：开发时使用 `--skip-install` 可以大幅加快测试速度

4. **端口占用**：API 服务器默认使用端口 3001，如果被占用需要修改配置

## 🎯 下一步

1. ✅ test-system 已集成到 monorepo
2. ✅ 使用 workspace 依赖
3. ✅ 分析了旧测试目录
4. ⏭️ 可选：删除 test-projects 和 test-templates
5. ⏭️ 继续完善测试系统（开发服务器、更多测试场景）
