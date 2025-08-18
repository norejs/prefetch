# 发布流程

## 快速开始

### 1. 创建变更集
```bash
pnpm changeset
```

### 2. 查看变更状态
```bash
pnpm changeset:status
```

### 3. 版本升级和发布
```bash
# 升级版本并生成 changelog
pnpm version-packages

# 发布到 npm
pnpm release
```

## 自动化发布

当你的变更合并到 `main` 分支后，GitHub Actions 会自动：

1. 检测是否有待发布的变更集
2. 创建发布 PR 或直接发布包
3. 更新 CHANGELOG.md
4. 发布到 npm（需要配置 NPM_TOKEN）

## 配置 NPM Token

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

- `NPM_TOKEN`: 你的 npm 访问令牌

## 更多信息

详细的使用指南请参见 [CHANGELOG_GUIDE.md](./CHANGELOG_GUIDE.md)。
