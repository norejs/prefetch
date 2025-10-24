# Prefetch 项目迁移工具

## Introduction

本需求文档定义了 `prefetch-migrate` CLI 工具的功能需求。该工具是一个**项目迁移工具**，用于将现有前端项目快速迁移到支持 Prefetch 预渲染功能。工具会自动检测项目框架、安装必要的依赖包、创建或修改 Service Worker 文件、生成注册代码，让开发者的项目能够快速支持 API 预取和缓存功能。

## Glossary

- **Migration Tool**: 迁移工具，指 `prefetch-migrate` CLI 工具
- **Service Worker (SW)**: 浏览器后台运行的脚本，用于拦截网络请求
- **Prefetch Integration Code**: Prefetch 功能的集成代码片段
- **Project Root**: 用户项目的根目录
- **Framework**: 前端框架，如 React、Vue、Next.js、Nuxt 等
- **Target Project**: 需要迁移的目标项目
- **Package Manager**: 包管理器，如 npm、yarn、pnpm
- **Registration Code**: Service Worker 注册代码，在应用入口文件中调用

## Requirements

### Requirement 1: 项目框架检测与兼容性判断

**User Story:** 作为开发者，我希望工具能自动检测我的项目框架并判断是否支持 Prefetch 迁移，这样我就能知道项目是否可以使用该功能。

#### Acceptance Criteria

1. WHEN 用户运行 `prefetch-migrate` 命令，THE Migration Tool SHALL 检测项目根目录的 `package.json` 文件
2. THE Migration Tool SHALL 识别以下主流框架：Next.js、Create React App、React + Vite、Vue CLI、Vue + Vite、Nuxt、Remix、Astro
3. WHEN 检测到支持的框架，THE Migration Tool SHALL 显示框架名称和版本信息
4. WHEN 检测到不支持的框架或无法识别，THE Migration Tool SHALL 显示警告信息并询问是否继续
5. THE Migration Tool SHALL 检查 Node.js 和包管理器版本是否满足最低要求

### Requirement 2: 自动安装依赖包

**User Story:** 作为开发者，我希望工具能自动安装 Prefetch 所需的依赖包，这样我就不需要手动执行 npm install 命令。

#### Acceptance Criteria

1. THE Migration Tool SHALL 检测项目使用的包管理器（npm、yarn、pnpm）
2. THE Migration Tool SHALL 检查 `@norejs/prefetch` 包是否已安装
3. WHEN 包未安装，THE Migration Tool SHALL 自动执行安装命令
4. THE Migration Tool SHALL 显示安装进度和结果
5. WHEN 安装失败，THE Migration Tool SHALL 显示错误信息并提供手动安装命令

### Requirement 3: Service Worker 文件创建或修改

**User Story:** 作为开发者，我希望工具能智能地创建新的 Service Worker 或修改现有的 Service Worker，这样我的项目就能支持 Prefetch 功能。

#### Acceptance Criteria

1. THE Migration Tool SHALL 扫描项目目录查找现有的 Service Worker 文件
2. WHEN 未找到 Service Worker，THE Migration Tool SHALL 在推荐位置创建新文件
3. WHEN 找到现有 Service Worker，THE Migration Tool SHALL 检查是否已集成 Prefetch
4. WHEN 已集成 Prefetch，THE Migration Tool SHALL 询问是否更新到最新版本
5. THE Migration Tool SHALL 在修改文件前创建备份

### Requirement 4: 生成 Service Worker 注册代码

**User Story:** 作为开发者，我希望工具能自动生成并插入 Service Worker 注册代码到我的应用入口文件，这样我就不需要手动编写注册逻辑。

#### Acceptance Criteria

1. THE Migration Tool SHALL 根据框架类型定位应用入口文件
2. THE Migration Tool SHALL 检查入口文件是否已有 Service Worker 注册代码
3. WHEN 未找到注册代码，THE Migration Tool SHALL 生成框架特定的注册代码
4. THE Migration Tool SHALL 将注册代码插入到合适的位置
5. THE Migration Tool SHALL 保持代码格式和缩进风格一致

### Requirement 5: 迁移验证与测试

**User Story:** 作为开发者，我希望工具能验证迁移是否成功，并提供测试指导，这样我就能确认项目可以正常运行。

#### Acceptance Criteria

1. THE Migration Tool SHALL 验证所有必要文件是否已创建或修改
2. THE Migration Tool SHALL 验证依赖包是否正确安装
3. THE Migration Tool SHALL 验证 Service Worker 注册代码是否正确插入
4. THE Migration Tool SHALL 提供启动项目的命令
5. THE Migration Tool SHALL 提供测试 Prefetch 功能的步骤说明

### Requirement 6: 测试模板项目支持

**User Story:** 作为工具开发者，我希望有预先准备的测试模板项目，这样我就能快速验证工具在不同框架下的兼容性。

#### Acceptance Criteria

1. THE Migration Tool 项目 SHALL 包含多个测试模板项目
2. THE 测试模板 SHALL 覆盖主流框架（Next.js、CRA、Vue + Vite、Nuxt）
3. THE 测试模板 SHALL 包含两种场景：已有 Service Worker 和没有 Service Worker
4. THE 测试模板 SHALL 包含自动化测试脚本
5. THE 测试脚本 SHALL 验证迁移后项目能否正常启动和运行

### Requirement 7: 交互式迁移流程

**User Story:** 作为开发者，我希望有一个友好的交互式流程引导我完成迁移，这样我就能轻松地为项目添加 Prefetch 功能。

#### Acceptance Criteria

1. WHEN 用户运行 `prefetch-migrate`，THE Migration Tool SHALL 显示欢迎信息和工具说明
2. THE Migration Tool SHALL 逐步引导用户完成：框架检测、依赖安装、SW 创建/修改、注册代码生成
3. THE Migration Tool SHALL 在每个步骤显示清晰的进度指示
4. THE Migration Tool SHALL 允许用户自定义配置参数（apiMatcher、expireTime 等）
5. THE Migration Tool SHALL 在完成后显示迁移摘要和下一步操作指南

### Requirement 8: 开发调试模式支持

**User Story:** 作为工具开发者，我希望能在开发阶段方便地调试工具，使用本地构建的 Prefetch Worker 包。

#### Acceptance Criteria

1. THE Migration Tool SHALL 支持 `--dev` 参数启用开发模式
2. THE Migration Tool SHALL 支持 `--cdn-prefix` 参数指定自定义 CDN URL 前缀
3. WHEN 使用开发模式，THE Migration Tool SHALL 使用本地开发服务器的 URL
4. THE Migration Tool SHALL 在生成的代码中添加开发模式标记和注释
5. THE Migration Tool SHALL 提示用户启动本地开发服务器

### Requirement 9: 回滚和错误恢复

**User Story:** 作为开发者，我希望在迁移出现问题时能快速回滚到原始状态，这样我的项目不会被破坏。

#### Acceptance Criteria

1. THE Migration Tool SHALL 在修改任何文件前创建完整备份
2. THE Migration Tool SHALL 将备份保存到 `.prefetch/backups/` 目录
3. THE Migration Tool SHALL 提供 `--rollback` 命令恢复到迁移前状态
4. WHEN 迁移过程中发生错误，THE Migration Tool SHALL 自动回滚所有更改
5. THE Migration Tool SHALL 记录详细的错误日志便于排查问题

### Requirement 10: 自动化测试流程

**User Story:** 作为工具开发者，我希望有完整的自动化测试流程，确保工具在各种场景下都能正常工作。

#### Acceptance Criteria

1. THE 测试流程 SHALL 自动创建测试项目（基于模板）
2. THE 测试流程 SHALL 运行迁移工具
3. THE 测试流程 SHALL 启动迁移后的项目
4. THE 测试流程 SHALL 验证项目能否正常运行
5. THE 测试流程 SHALL 验证 Prefetch 功能是否正常工作
