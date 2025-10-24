# Prefetch 项目迁移工具 - 方案总结

## 工具定位

**`prefetch-migrate`** 是一个**项目迁移工具**，而不仅仅是 Service Worker 集成工具。

### 核心目标

让现有的前端项目能够快速支持 Prefetch 预渲染功能，通过自动化流程完成：
1. 依赖包安装
2. Service Worker 创建/修改
3. 注册代码生成
4. 配置和验证

## 工具能力

### ✅ 支持的功能

#### 1. 框架检测与兼容性判断
- 自动检测项目使用的框架
- 支持主流框架：Next.js、CRA、React + Vite、Vue CLI、Vue + Vite、Nuxt、Remix、Astro
- 判断项目是否适合迁移
- 显示框架版本和配置信息

#### 2. 自动安装依赖
- 检测包管理器（npm/yarn/pnpm）
- 自动安装 `@norejs/prefetch` 包
- 显示安装进度
- 处理安装失败情况

#### 3. Service Worker 智能处理
- 扫描项目查找现有 SW 文件
- 未找到时在推荐位置创建新文件
- 找到时检查是否已集成 Prefetch
- 已集成时提供更新选项
- 修改前自动备份

#### 4. 注册代码自动生成
- 根据框架定位入口文件
- 检测是否已有注册代码
- 生成框架特定的注册代码
- 自动插入到合适位置
- 保持代码风格一致

#### 5. 迁移验证
- 验证文件创建/修改
- 验证依赖安装
- 验证注册代码
- 提供测试指导
- 提供启动命令

#### 6. 交互式流程
- 友好的引导界面
- 清晰的进度指示
- 可自定义配置
- 完整的迁移摘要
- 下一步操作指南

#### 7. 开发调试支持
- `--dev` 开发模式
- `--cdn-prefix` 自定义 CDN
- 本地开发服务器支持
- 详细的调试信息

#### 8. 错误恢复
- 自动备份机制
- 一键回滚功能
- 错误自动回滚
- 详细错误日志

### ❌ 不支持的功能

1. **Workbox 集成** - 暂时不支持 Workbox，专注于 Prefetch 自身的实现
2. **复杂 SW 场景** - 不处理已有复杂 Service Worker 逻辑的项目
3. **Monorepo 批量操作** - 暂不支持一次性处理多个子项目

## 使用流程

### 基本使用

```bash
# 在项目根目录运行
npx prefetch-migrate

# 或全局安装后使用
npm install -g @norejs/prefetch
prefetch-migrate
```

### 交互式流程

```
🚀 Prefetch Migration Tool

Step 1/5: Detecting framework...
✓ Framework: Next.js 14.0.0
✓ Package manager: pnpm
✓ Project is compatible

Step 2/5: Installing dependencies...
✓ Installing @norejs/prefetch...
✓ Dependencies installed successfully

Step 3/5: Setting up Service Worker...
? No existing Service Worker found. Create new one? (Y/n) Y
✓ Created: public/service-worker.js
✓ Backup created: .prefetch/backups/...

Step 4/5: Generating registration code...
✓ Entry file: app/layout.tsx
✓ Registration code inserted

Step 5/5: Configuring Prefetch...
? API matcher pattern: /api/*
? Cache expire time (ms): 30000
? Max cache size: 100
✓ Configuration saved

✅ Migration completed successfully!

📝 Next steps:
  1. Start your dev server: npm run dev
  2. Open browser DevTools
  3. Check Service Worker registration
  4. Test API requests to see caching in action

📚 Documentation: https://github.com/norejs/prefetch
```

### 开发模式

```bash
# 使用本地开发服务器
prefetch-migrate --dev

# 自定义 CDN 前缀
prefetch-migrate --cdn-prefix http://localhost:3100
```

### 回滚

```bash
# 回滚到迁移前状态
prefetch-migrate --rollback
```

## 测试策略

### 测试模板项目

为确保工具在各种场景下都能正常工作，我们准备了测试模板：

```
test-templates/
├── nextjs-app/              # Next.js App Router
├── nextjs-pages/            # Next.js Pages Router
├── cra-app/                 # Create React App
├── react-vite/              # React + Vite
├── vue-cli/                 # Vue CLI
├── vue-vite/                # Vue 3 + Vite
├── nuxt-app/                # Nuxt 3
├── with-existing-sw/        # 已有 Service Worker
└── with-custom-config/      # 自定义配置
```

### 自动化测试流程

```bash
# 运行所有测试
npm run test:migrate

# 测试流程：
# 1. 复制模板项目到临时目录
# 2. 运行 prefetch-migrate
# 3. 验证文件创建/修改
# 4. 安装依赖
# 5. 启动项目
# 6. 验证项目能否正常运行
# 7. 验证 Prefetch 功能
# 8. 清理临时文件
```

### 测试检查项

每个测试场景都会验证：

1. ✅ 框架检测正确
2. ✅ 依赖安装成功
3. ✅ Service Worker 文件创建/修改正确
4. ✅ 注册代码插入正确
5. ✅ 项目能够启动
6. ✅ Service Worker 能够注册
7. ✅ Prefetch 功能正常工作
8. ✅ 备份文件创建
9. ✅ 回滚功能正常

## 技术实现

### 核心模块

```
src/
├── modules/
│   ├── framework-detector.js    # 框架检测
│   ├── package-installer.js     # 依赖安装
│   ├── sw-manager.js            # SW 文件管理
│   ├── code-generator.js        # 代码生成
│   ├── file-injector.js         # 代码注入
│   ├── backup-manager.js        # 备份管理
│   └── validator.js             # 验证器
├── templates/
│   ├── service-worker.js        # SW 模板
│   └── registration/            # 注册代码模板
│       ├── nextjs-app.ts
│       ├── nextjs-pages.ts
│       ├── react.tsx
│       └── vue.ts
└── utils/
    ├── file-utils.js
    ├── ast-utils.js             # AST 操作
    └── logger.js
```

### 关键技术点

1. **AST 操作** - 使用 `@babel/parser` 和 `@babel/generator` 精确插入代码
2. **包管理器检测** - 检查 lock 文件判断使用的包管理器
3. **框架检测** - 分析 `package.json` 依赖和项目结构
4. **备份机制** - 使用时间戳和 hash 管理备份
5. **错误恢复** - 事务式操作，失败自动回滚

## 与现有工具的关系

### prefetch-integrate (旧)

- 专注于 Service Worker 文件的集成
- 需要手动安装依赖
- 需要手动添加注册代码
- 适合已经了解 Prefetch 的用户

### prefetch-migrate (新)

- 完整的项目迁移方案
- 自动化所有步骤
- 适合新用户快速上手
- 包含测试和验证

### 关系

`prefetch-migrate` 内部使用 `prefetch-integrate` 的核心逻辑，但提供了更高层次的抽象和自动化。

## 开发计划

### Phase 1: 核心功能 (2 周)
- 框架检测
- 依赖安装
- SW 文件管理
- 注册代码生成
- 基础测试

### Phase 2: 测试完善 (1 周)
- 创建测试模板
- 编写自动化测试
- 验证各框架兼容性

### Phase 3: 体验优化 (1 周)
- 交互式流程优化
- 错误处理改进
- 文档完善

### Phase 4: 发布 (1 周)
- Beta 测试
- 收集反馈
- 正式发布

## 成功标准

工具被认为成功，当：

1. ✅ 支持 5+ 主流框架
2. ✅ 90%+ 的测试场景通过
3. ✅ 迁移成功率 > 95%
4. ✅ 平均迁移时间 < 2 分钟
5. ✅ 用户反馈积极
6. ✅ 文档完整清晰

## 风险和挑战

### 技术风险

1. **框架多样性** - 不同框架的入口文件和结构差异大
   - 缓解：为每个框架提供专门的处理逻辑

2. **代码注入准确性** - AST 操作可能破坏代码
   - 缓解：充分测试，提供备份和回滚

3. **依赖冲突** - 可能与现有依赖冲突
   - 缓解：使用 peer dependencies，检测版本兼容性

### 用户体验风险

1. **学习曲线** - 用户可能不理解 Service Worker
   - 缓解：提供详细文档和示例

2. **调试困难** - Service Worker 调试本身就复杂
   - 缓解：提供调试指南和常见问题解答

## 总结

`prefetch-migrate` 是一个全自动的项目迁移工具，目标是让任何前端项目都能在 2 分钟内支持 Prefetch 功能。通过自动化框架检测、依赖安装、代码生成和验证，大大降低了使用门槛，让开发者能够专注于业务逻辑而不是配置细节。
