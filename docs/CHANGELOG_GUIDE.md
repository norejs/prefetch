# Changelog Management Guide

本项目使用 [Changesets](https://github.com/changesets/changesets) 来管理版本和生成 changelog。

## 开发工作流

### 1. 创建变更集 (Changeset)

当你完成一个功能或修复时，创建一个变更集来描述变更：

```bash
pnpm changeset
```

这会启动一个交互式流程：
1. 选择哪些包受到了影响
2. 选择版本升级类型（major/minor/patch）
3. 编写变更描述

### 2. 查看变更状态

```bash
pnpm changeset:status
```

查看当前的变更集和即将发布的版本。

### 3. 版本升级

```bash
pnpm version-packages
```

这会：
- 更新包的版本号
- 生成/更新 CHANGELOG.md
- 更新 pnpm-lock.yaml

### 4. 发布包

```bash
pnpm release
```

这会构建所有包并发布到 npm。

## 版本升级类型

- **patch** (0.1.0 → 0.1.1): Bug 修复
- **minor** (0.1.0 → 0.2.0): 新功能，向后兼容
- **major** (0.1.0 → 1.0.0): 破坏性变更

## 自动化

### GitHub Actions

项目配置了两个 GitHub Actions 工作流：

1. **Release** (`.github/workflows/release.yml`)
   - 在 main 分支推送时触发
   - 自动创建发布 PR 或发布包到 npm
   - 需要配置 `NPM_TOKEN` secret

2. **Changeset Validation** (`.github/workflows/changeset-validation.yml`)
   - 在 PR 时验证是否包含变更集
   - 确保版本管理的一致性

### 配置 NPM Token

1. 在 npm 上创建访问令牌：
   ```bash
   npm login
   npm token create
   ```

2. 在 GitHub 仓库设置中添加 `NPM_TOKEN` secret

## 示例变更集

创建变更集后，会在 `.changeset` 目录下生成类似这样的文件：

```markdown
---
"@norejs/prefetch": minor
"@norejs/prefetch-worker": patch
---

Add new prefetch strategy for better performance

- Implemented intelligent prefetching based on user scroll behavior
- Fixed memory leak in service worker
- Updated documentation with new examples
```

## 最佳实践

1. **及时创建变更集**: 完成功能后立即创建变更集，避免遗忘
2. **描述要清晰**: 变更描述要让用户能理解影响和价值
3. **正确选择版本类型**: 严格按照语义化版本规范
4. **一次一个功能**: 避免在一个变更集中混合多个不相关的修改
5. **测试后发布**: 确保所有测试通过后再发布

## 配置文件

- `.changeset/config.json`: Changesets 配置
- `package.json`: 包含 changeset 相关脚本
- `turbo.json`: Turbo 构建配置
- `.github/workflows/`: GitHub Actions 工作流

## 疑难解答

### 变更集没有生效

检查 `.changeset/config.json` 中的 `ignore` 配置，确保你的包没有被忽略。

### 发布失败

1. 检查 NPM_TOKEN 是否正确配置
2. 确保包名没有冲突
3. 检查网络连接和 npm 服务状态

### 版本冲突

如果多个开发者同时修改版本，可能需要手动解决冲突：

```bash
git pull
pnpm changeset:version
git add .
git commit -m "resolve version conflicts"
```

## 相关链接

- [Changesets 官方文档](https://github.com/changesets/changesets)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
