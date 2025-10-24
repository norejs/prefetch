# Implementation Tasks - Prefetch Migration Tool

## Current Status

✅ **Completed:**
- Project structure and module scaffolding
- Framework detection (Next.js, CRA, React+Vite, Vue+Vite, Nuxt, Remix, Astro)
- Package manager detection and installation
- Service Worker scanning, creation, and updating
- Code generation for SW and registration code
- CDN URL resolution with dev mode support
- CLI argument parsing and help system
- Main orchestration flow (Steps 1-3)

🚧 **In Progress:**
- File injection module (skeleton exists, needs implementation)
- Backup and rollback functionality (skeleton exists, needs implementation)
- Validation module (skeleton exists, needs implementation)

⏳ **Next Priority:**
- Complete File Injector for automatic registration code injection
- Implement Backup Manager for safe file modifications
- Implement Validator for migration verification
- Complete main orchestration (Steps 4-5)
- Create comprehensive test templates
- Add automated testing scripts

## Phase 1: 核心迁移功能 (P0)

### 1. 创建项目基础结构

- [x] 1.1 重构为模块化架构
  - 创建 `packages/prefetch/src/migrate/` 目录
  - 创建 `packages/prefetch/bin/prefetch-migrate.js` 入口文件
  - 设置模块导出结构
  - _Requirements: 所有需求的基础_

- [x] 1.2 创建核心模块文件
  - 创建 `src/migrate/modules/framework-detector.js`
  - 创建 `src/migrate/modules/package-installer.js`
  - 创建 `src/migrate/modules/sw-manager.js`
  - 创建 `src/migrate/modules/code-generator.js`
  - 创建 `src/migrate/modules/file-injector.js`
  - 创建 `src/migrate/modules/backup-manager.js`
  - 创建 `src/migrate/modules/validator.js`
  - 创建 `src/migrate/utils/` 工具目录
  - _Requirements: 所有需求的基础_

### 2. 实现 Framework Detector（框架检测）

- [x] 2.1 实现基础框架检测
  - 读取 `package.json` 文件
  - 检测 Next.js、CRA、React + Vite、Vue CLI、Vue + Vite、Nuxt
  - 提取框架版本信息
  - 返回框架信息对象（name, version, publicDir, buildDir）
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 实现兼容性判断
  - 检查 Node.js 版本（>= 16.0.0）
  - 检查框架版本是否在支持范围内
  - 返回兼容性结果和警告信息
  - _Requirements: 1.4, 1.5_

- [x] 2.3 扩展框架支持
  - 添加 Remix 检测
  - 添加 Astro 检测
  - 添加 SvelteKit 检测（可选）
  - 提供未知框架的降级处理
  - _Requirements: 1.2_

### 3. 实现 Package Installer（依赖安装）

- [x] 3.1 实现包管理器检测
  - 检查 `package-lock.json` (npm)
  - 检查 `yarn.lock` (yarn)
  - 检查 `pnpm-lock.yaml` (pnpm)
  - 返回检测到的包管理器类型
  - _Requirements: 2.1_

- [x] 3.2 实现依赖检查
  - 读取 `package.json` 的 dependencies
  - 检查 `@norejs/prefetch` 是否已安装
  - 检查版本是否需要更新
  - _Requirements: 2.2_

- [x] 3.3 实现自动安装功能
  - 使用 `child_process.spawn` 执行安装命令
  - 显示安装进度（实时输出）
  - 处理安装成功和失败情况
  - 提供手动安装命令提示
  - _Requirements: 2.3, 2.4, 2.5_

### 4. 实现 SW Manager（Service Worker 管理）

- [x] 4.1 实现 Service Worker 扫描
  - 使用文件系统扫描常见目录
  - 支持文件名模式：`service-worker.js`, `sw.js`, `worker.js`
  - 检查文件内容特征（`self.addEventListener`）
  - 返回找到的 SW 文件列表
  - _Requirements: 3.1, 3.2_

- [x] 4.2 实现 Prefetch 集成检测
  - 检查文件是否包含 `Prefetch Worker Integration` 标记
  - 提取当前版本信息
  - 提取当前配置信息
  - 返回集成状态对象
  - _Requirements: 3.3, 3.4_

- [x] 4.3 实现 Service Worker 创建
  - 根据框架确定推荐路径
  - 使用模板生成基础 SW 文件
  - 集成 Prefetch 代码
  - 写入文件到推荐位置
  - _Requirements: 3.2, 3.5_

- [x] 4.4 实现 Service Worker 更新
  - 读取现有 SW 文件内容
  - 移除旧的 Prefetch 集成代码
  - 插入新的 Prefetch 集成代码
  - 保留其他自定义代码
  - _Requirements: 3.4, 3.5_

### 5. 实现 Code Generator（代码生成器）

- [x] 5.1 创建 Service Worker 模板
  - 创建基础 SW 模板文件
  - 支持开发模式和生产模式
  - 支持自定义 CDN URL
  - 添加必要的注释和说明
  - _Requirements: 3.2, 8.1, 8.2, 8.3_

- [x] 5.2 创建注册代码模板
  - Next.js App Router 模板（TypeScript）
  - Next.js Pages Router 模板（TypeScript）
  - React 模板（TypeScript/JavaScript）
  - Vue 模板（TypeScript/JavaScript）
  - 通用模板（JavaScript）
  - _Requirements: 4.1, 4.3_

- [x] 5.3 实现注册代码生成逻辑
  - 根据框架选择合适的模板
  - 根据项目语言（TS/JS）调整代码
  - 插入配置参数
  - 返回生成的代码字符串
  - _Requirements: 4.3_

### 6. 实现 File Injector（代码注入器）

- [ ] 6.1 实现入口文件定位
  - Next.js: 查找 `app/layout.tsx` 或 `pages/_app.tsx`
  - CRA: 查找 `src/index.tsx` 或 `src/index.js`
  - Vue: 查找 `src/main.ts` 或 `src/main.js`
  - Nuxt: 查找 `app.vue` 或 `nuxt.config.ts`
  - 返回入口文件路径
  - _Requirements: 4.1_

- [ ] 6.2 实现注册代码检测
  - 使用 `@babel/parser` 解析文件为 AST
  - 查找 `navigator.serviceWorker.register` 调用
  - 提取注册的 SW 路径
  - 返回是否已有注册代码
  - _Requirements: 4.2_

- [ ] 6.3 实现代码注入逻辑
  - 使用 AST 操作插入代码
  - 根据框架选择合适的插入位置
  - Next.js: 在 useEffect 中插入
  - React: 在 ReactDOM.render 后插入
  - Vue: 在 createApp 后插入
  - 保持代码格式和缩进
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 6.4 实现代码格式化
  - 使用 `@babel/generator` 生成代码
  - 使用 `prettier` 格式化（如果项目有配置）
  - 保持与项目一致的代码风格
  - _Requirements: 4.5_

### 7. 实现 Backup Manager（备份管理）

- [ ] 7.1 实现备份创建
  - 创建 `.prefetch/backups/` 目录
  - 生成带时间戳的备份文件名
  - 复制文件到备份目录
  - 计算文件 hash（使用 crypto）
  - 保存备份元数据（JSON）
  - _Requirements: 9.1, 9.2_

- [ ] 7.2 实现备份列表管理
  - 读取备份目录
  - 解析备份元数据
  - 按时间排序
  - 返回备份列表
  - _Requirements: 9.3_

- [ ] 7.3 实现回滚功能
  - 验证备份文件完整性（hash 校验）
  - 恢复备份文件到原位置
  - 创建回滚前的备份
  - 更新备份元数据
  - _Requirements: 9.3, 9.4_

- [ ] 7.4 实现自动清理
  - 保留最近 N 个备份（默认 5 个）
  - 删除过期备份文件
  - 更新备份元数据
  - _Requirements: 9.2_

### 8. 实现 Validator（验证器）

- [ ] 8.1 实现文件验证
  - 验证 Service Worker 文件是否存在
  - 验证文件内容是否有效（JavaScript 语法）
  - 验证 Prefetch 集成代码是否完整
  - 返回验证结果
  - _Requirements: 5.1_

- [ ] 8.2 实现依赖验证
  - 验证 `@norejs/prefetch` 是否已安装
  - 验证版本是否正确
  - 验证 package.json 是否更新
  - _Requirements: 5.2_

- [ ] 8.3 实现注册代码验证
  - 验证入口文件是否包含注册代码
  - 验证注册路径是否正确
  - 验证代码语法是否正确
  - _Requirements: 5.3_

- [ ] 8.4 生成验证报告
  - 收集所有验证结果
  - 生成详细的验证报告
  - 提供修复建议
  - 返回验证通过/失败状态
  - _Requirements: 5.1, 5.2, 5.3_

### 9. 实现交互式流程

- [ ] 9.1 实现欢迎界面
  - 显示工具名称和版本
  - 显示工具说明
  - 显示支持的框架列表
  - _Requirements: 7.1_

- [ ] 9.2 实现进度指示
  - 显示当前步骤（Step X/5）
  - 显示步骤名称和描述
  - 使用颜色和图标增强可读性
  - 显示操作结果（成功/失败）
  - _Requirements: 7.2, 7.3_

- [ ] 9.3 实现配置输入
  - 询问 API matcher 模式
  - 询问缓存过期时间
  - 询问最大缓存数量
  - 提供默认值和推荐值
  - 验证用户输入
  - _Requirements: 7.4_

- [ ] 9.4 实现迁移摘要
  - 显示所有修改的文件
  - 显示安装的依赖
  - 显示配置信息
  - 显示下一步操作指南
  - 提供文档链接
  - _Requirements: 7.5_

### 10. 实现主流程编排

- [x] 10.1 实现迁移主流程
  - Step 1: 检测框架和兼容性
  - Step 2: 安装依赖包
  - Step 3: 创建/修改 Service Worker
  - Step 4: 生成并注入注册代码（待实现）
  - Step 5: 配置和验证（待实现）
  - 处理每个步骤的错误
  - _Requirements: 1, 2, 3, 4, 5, 7_

- [ ] 10.2 实现错误处理和回滚
  - 捕获所有步骤的错误
  - 显示详细的错误信息
  - 自动回滚已完成的操作
  - 记录错误日志
  - 提供故障排查建议
  - _Requirements: 9.4, 9.5_

- [x] 10.3 实现命令行参数解析
  - 支持 `--dev` 开发模式
  - 支持 `--cdn-prefix` 自定义 CDN
  - 支持 `--rollback` 回滚
  - 支持 `--verbose` 详细日志
  - 支持 `--dry-run` 模拟执行
  - 支持 `--help` 帮助信息
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

## Phase 2: 测试基础设施 (P1)

### 11. 创建测试模板项目

- [ ] 11.1 完善 Next.js 测试模板
  - 完善现有 test-projects/nextjs-test 项目
  - 添加测试场景：无 SW 和有 SW
  - 添加 README 说明和测试脚本
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.2 完善 CRA 测试模板
  - 完善现有 test-projects/cra-test 项目
  - 添加测试场景：无 SW 和有 SW
  - 添加 README 说明和测试脚本
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.3 完善 Vue + Vite 测试模板
  - 完善现有 test-projects/vue-vite-test 项目
  - 添加测试场景：无 SW 和有 SW
  - 添加 README 说明和测试脚本
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.4 创建 Nuxt 测试模板
  - 使用 `npx nuxi init` 创建项目
  - 添加一些自定义代码
  - 创建两个变体：无 SW 和有 SW
  - _Requirements: 6.1, 6.2, 6.3_

### 12. 实现自动化测试脚本

- [ ] 12.1 创建测试运行器
  - 创建 `test-migrate.js` 脚本
  - 支持运行单个测试或所有测试
  - 支持并行测试（可选）
  - 生成测试报告
  - _Requirements: 10.1, 10.2_

- [ ] 12.2 实现测试流程
  - 复制模板到临时目录
  - 运行 `prefetch-migrate` 命令
  - 验证文件创建/修改
  - 安装依赖（npm install）
  - 启动项目（npm run dev）
  - 等待项目启动成功
  - 清理临时文件
  - _Requirements: 10.2, 10.3, 10.4_

- [ ] 12.3 实现验证检查
  - 检查 Service Worker 文件是否存在
  - 检查文件内容是否正确
  - 检查注册代码是否插入
  - 检查依赖是否安装
  - 检查项目是否能启动
  - 检查 Service Worker 是否注册成功
  - _Requirements: 10.5_

- [ ] 12.4 实现测试报告
  - 记录每个测试的结果
  - 统计成功/失败数量
  - 显示失败的详细信息
  - 生成 HTML 报告（可选）
  - _Requirements: 6.4, 6.5_

## Phase 3: 开发体验优化 (P1)

### 13. 实现开发调试功能

- [x] 13.1 实现 CDN URL 解析器
  - 在 CodeGenerator 中实现 _resolveCDNUrl 方法
  - 实现优先级解析逻辑
  - 支持完整 URL、CDN 前缀、本地开发模式
  - 验证 URL 格式
  - _Requirements: 8.1, 8.2_

- [x] 13.2 实现开发模式提示
  - 检测是否使用本地 URL
  - 在生成的代码中添加开发模式注释
  - 高亮显示使用的 CDN URL
  - _Requirements: 8.3, 8.4, 8.5_

### 14. 增强日志系统

- [ ] 14.1 增强 Logger 类
  - 添加文件输出支持
  - 添加颜色和格式化
  - 支持多个日志级别（ERROR, WARN, INFO, DEBUG）
  - _Requirements: 9.5_

- [ ] 14.2 实现日志文件管理
  - 创建 `.prefetch/logs/` 目录
  - 按日期生成日志文件
  - 自动清理旧日志（保留 7 天）
  - _Requirements: 9.5_

- [ ] 14.3 集成日志到所有模块
  - 在关键操作点添加日志
  - 记录错误堆栈信息
  - 记录性能指标
  - 支持 `--verbose` 参数
  - _Requirements: 9.5_

### 15. 实现 Dry-run 模式

- [ ] 15.1 实现模拟执行
  - 添加 `--dry-run` 参数支持
  - 模拟所有文件操作（不实际写入）
  - 显示将要执行的操作
  - 显示将要修改的文件内容（diff）
  - _Requirements: 9.5_

- [ ] 15.2 实现预览功能
  - 显示将要创建的文件
  - 显示将要修改的代码
  - 显示将要安装的依赖
  - 询问用户是否继续
  - _Requirements: 7.3_

## Phase 4: 文档和发布 (P2)

### 16. 更新文档

- [ ] 16.1 更新主 README.md
  - 添加 `prefetch-migrate` 工具说明
  - 添加使用示例
  - 添加支持的框架列表
  - 添加常见问题解答
  - _Requirements: 所有需求_

- [ ] 16.2 创建迁移指南
  - 创建 `docs/MIGRATION_GUIDE.md`
  - 为每个框架提供详细步骤
  - 提供故障排查指南
  - 提供最佳实践建议
  - _Requirements: 所有需求_

- [x] 16.3 创建 CLI 帮助文档
  - 更新 `--help` 输出
  - 列出所有命令行参数
  - 提供使用示例
  - _Requirements: 所有需求_

- [ ] 16.4 创建测试文档
  - 说明如何运行测试
  - 说明如何添加新的测试模板
  - 说明测试覆盖范围
  - _Requirements: 6, 10_

### 17. 发布准备

- [ ] 17.1 更新 package.json
  - 添加 `prefetch-migrate` bin 命令
  - 更新版本号
  - 更新依赖列表
  - 添加 keywords
  - _Requirements: 所有需求_

- [ ] 17.2 创建 CHANGELOG
  - 记录新功能
  - 记录破坏性变更
  - 记录 bug 修复
  - _Requirements: 所有需求_

- [ ] 17.3 准备发布资源
  - 创建 demo 视频（可选）
  - 创建截图
  - 准备发布公告
  - _Requirements: 所有需求_

### 18. 高级功能

- [ ] 18.1 实现配置文件支持
  - 支持 `.prefetchrc.json`
  - 支持 `prefetch.config.js`
  - 支持配置文件生成
  - _Requirements: 7.4_

## 实施顺序建议

### ✅ Sprint 1 (Completed): 核心模块
- ✅ Task 1: 项目基础结构
- ✅ Task 2: Framework Detector
- ✅ Task 3: Package Installer
- ✅ Task 4: SW Manager
- ✅ Task 5: Code Generator
- ✅ Task 10.1 & 10.3: 主流程编排和参数解析
- ✅ Task 13: 开发调试功能

### 🎯 Sprint 2 (Current): 完成核心功能
- Task 6: File Injector (高优先级)
- Task 7: Backup Manager (高优先级)
- Task 8: Validator (高优先级)
- Task 9: 交互式流程优化
- Task 10.2: 错误处理和回滚

### Sprint 3: 测试基础设施
- Task 11: 完善测试模板项目
- Task 12: 自动化测试脚本

### Sprint 4: 优化和发布
- Task 14: 增强日志系统
- Task 15: Dry-run 模式
- Task 16: 文档更新
- Task 17: 发布准备
- Task 18: 高级功能（配置文件支持）

## 验收标准

每个任务完成后应该：

1. ✅ 代码通过 ESLint 检查（无严重错误）
2. ✅ 核心功能在真实项目中手动测试通过
3. ✅ 在至少 2-3 个框架的测试项目上验证通过
4. ✅ 更新相关文档和注释
5. ✅ 提交代码

**当前已验证的框架:**
- ✅ Next.js (test-projects/nextjs-test)
- ⏳ CRA (test-projects/cra-test - 需要完善)
- ⏳ Vue + Vite (test-projects/vue-vite-test - 需要完善)

## 注意事项

1. **向后兼容**: 不要破坏现有的 `prefetch-integrate` 功能
2. **错误处理**: 所有文件操作都要有错误处理和回滚
3. **用户体验**: 提供清晰的提示和进度指示
4. **测试优先**: 核心模块先写测试再实现
5. **文档同步**: 每个功能实现后立即更新文档
