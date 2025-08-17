# Contributing to Prefetch

🎉 Thank you for your interest in contributing to Prefetch! We welcome contributions from everyone and are grateful for every contribution, no matter how small.

[English](#english) | [中文](#中文)

---

## English

### 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/prefetch.git
   cd prefetch
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 🏗️ Development Setup

#### Prerequisites

- Node.js 18+ (We recommend using the version specified in `.volta`)
- pnpm (for workspace management)
- Modern browser with Service Worker support

#### Project Structure

```
prefetch/
├── packages/
│   ├── prefetch/          # Main client library
│   └── prefetch-worker/   # Service Worker implementation
├── demos/                 # Demo projects
│   ├── api-server/        # Mock API server
│   └── nextjs-prefetch-demo/ # Next.js demo
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

#### Building the Project

```bash
# Build all packages
npm run build

# Build and watch for changes
npm run dev

# Build specific package
cd packages/prefetch
npm run build
```

#### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/prefetch
npm test

# Run tests in watch mode
npm run test:watch
```

#### Running Demo Projects

```bash
# Install demo dependencies
npm run demo:install

# Copy service worker files
npm run demo:copy-sw

# Run Next.js demo with API server
npm run demo:start:nextjs

# Run all demos
npm run demo:start:all
```

### 🐛 Bug Reports

When filing a bug report, please include:

1. **Detailed description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs **actual behavior**
4. **Environment information**:
   - Browser version
   - Node.js version
   - Package version
   - Operating system
5. **Code samples** or **minimal reproduction** if possible

Use our bug report template:

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- Browser: [e.g., Chrome 91]
- Node.js: [e.g., 18.17.0]
- Package: [e.g., @norejs/prefetch@0.1.0]
- OS: [e.g., macOS 13.0]

## Additional Context
[Any other relevant information]
```

### ✨ Feature Requests

We love new ideas! When suggesting a feature:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** your feature would solve
3. **Provide use cases** and examples
4. **Consider implementation** complexity and maintainability

### 🔧 Code Contributions

#### Before You Start

1. **Check existing issues** for similar work
2. **Open an issue** to discuss major changes
3. **Follow our coding standards** (see below)

#### Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code is automatically formatted
- **Tests**: Include tests for new features
- **Documentation**: Update docs for API changes

#### Code Style

```typescript
// ✅ Good
export interface PrefetchOptions {
  serviceWorkerUrl: string;
  scope?: string;
  debug?: boolean;
}

export async function setup(options: PrefetchOptions): Promise<ServiceWorkerRegistration | null> {
  const { serviceWorkerUrl, scope = '/', debug = false } = options;
  
  if (!serviceWorkerUrl) {
    throw new Error('serviceWorkerUrl is required');
  }
  
  // Implementation...
}

// ❌ Avoid
export function setup(options: any) {
  if(!options.serviceWorkerUrl)return null;
  // Implementation...
}
```

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
feat: add support for custom request matchers
feat(worker): implement request deduplication

# Bug fixes
fix: resolve cache expiration timing issue
fix(cli): handle dependency hoisting correctly

# Documentation
docs: update installation guide
docs(api): add examples for createPreRequest

# Refactoring
refactor: simplify cache management logic
refactor(setup): extract worker initialization

# Tests
test: add unit tests for cache mechanism
test(integration): add e2e demo tests
```

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```
4. **Create a pull request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots/videos for UI changes
   - Breaking change notes if applicable

#### Pull Request Template

```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Closes #[issue_number]

## Screenshots/Videos
[If applicable]

## Breaking Changes
[List any breaking changes]

## Additional Notes
[Any additional information]
```

### 📖 Documentation

Help us improve our documentation:

- **Fix typos** and grammar errors
- **Add examples** and use cases
- **Improve clarity** of explanations
- **Translate** to other languages

Documentation is located in:
- `README.md` / `README.zh-CN.md` - Main documentation
- `docs/` - Additional guides
- `packages/*/README.md` - Package-specific docs

### 🧪 Testing

#### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- cache.test.ts
```

#### Integration Tests

```bash
# Run demo projects
npm run demo:start:all

# Test CLI installation
npx prefetch install --dir test-output
```

#### Manual Testing Checklist

- [ ] Service Worker registration
- [ ] Prefetch functionality
- [ ] Cache management
- [ ] CLI commands
- [ ] Demo projects
- [ ] Browser compatibility

### 🚢 Release Process

Releases are handled by maintainers:

1. **Version bump** following [Semantic Versioning](https://semver.org/)
2. **Update CHANGELOG.md**
3. **Create release tag**
4. **Publish to npm**
5. **Update documentation**

### 🤝 Community

- **Be respectful** and inclusive
- **Help others** learn and contribute
- **Share knowledge** and best practices
- **Follow our** [Code of Conduct](CODE_OF_CONDUCT.md)

### 💬 Getting Help

- **GitHub Issues**: Technical questions and bugs
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (coming soon)

---

## 中文

### 🚀 快速开始

1. **Fork 仓库** 到你的 GitHub 账户
2. **克隆你的 fork** 到本地：
   ```bash
   git clone https://github.com/your-username/prefetch.git
   cd prefetch
   ```
3. **安装依赖**：
   ```bash
   npm install
   ```
4. **创建分支** 进行开发：
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 🏗️ 开发环境设置

#### 环境要求

- Node.js 18+ （推荐使用 `.volta` 中指定的版本）
- pnpm （用于工作区管理）
- 支持 Service Worker 的现代浏览器

#### 项目结构

```
prefetch/
├── packages/
│   ├── prefetch/          # 主要的客户端库
│   └── prefetch-worker/   # Service Worker 实现
├── demos/                 # 演示项目
│   ├── api-server/        # 模拟 API 服务器
│   └── nextjs-prefetch-demo/ # Next.js 演示
├── docs/                  # 文档
└── scripts/               # 构建和工具脚本
```

#### 构建项目

```bash
# 构建所有包
npm run build

# 构建并监听变化
npm run dev

# 构建特定包
cd packages/prefetch
npm run build
```

#### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定包的测试
cd packages/prefetch
npm test

# 监听模式运行测试
npm run test:watch
```

#### 运行演示项目

```bash
# 安装演示依赖
npm run demo:install

# 复制 service worker 文件
npm run demo:copy-sw

# 运行 Next.js 演示和 API 服务器
npm run demo:start:nextjs

# 运行所有演示
npm run demo:start:all
```

### 🐛 错误报告

提交错误报告时，请包含：

1. **详细描述** 问题
2. **重现步骤**
3. **期望行为** vs **实际行为**
4. **环境信息**：
   - 浏览器版本
   - Node.js 版本
   - 包版本
   - 操作系统
5. **代码示例** 或 **最小重现** （如果可能）

### ✨ 功能请求

我们欢迎新想法！建议功能时：

1. **检查现有 issues** 避免重复
2. **描述问题** 你的功能要解决的问题
3. **提供用例** 和示例
4. **考虑实现** 复杂性和可维护性

### 🔧 代码贡献

#### 开始之前

1. **检查现有 issues** 是否有类似工作
2. **开启 issue** 讨论重大变更
3. **遵循编码标准** （见下文）

#### 编码标准

- **TypeScript**：所有新代码使用 TypeScript
- **ESLint**：遵循现有的 ESLint 配置
- **Prettier**：代码自动格式化
- **测试**：为新功能包含测试
- **文档**：为 API 变更更新文档

#### 提交信息

遵循 [约定式提交](https://www.conventionalcommits.org/zh-hans/):

```bash
# 功能
feat: 添加自定义请求匹配器支持
feat(worker): 实现请求去重

# 错误修复
fix: 解决缓存过期时间问题
fix(cli): 正确处理依赖提升

# 文档
docs: 更新安装指南
docs(api): 为 createPreRequest 添加示例

# 重构
refactor: 简化缓存管理逻辑
refactor(setup): 提取 worker 初始化

# 测试
test: 为缓存机制添加单元测试
test(integration): 添加端到端演示测试
```

### 📖 文档

帮助我们改进文档：

- **修复错别字** 和语法错误
- **添加示例** 和用例
- **改进解释** 的清晰度
- **翻译** 为其他语言

文档位置：
- `README.md` / `README.zh-CN.md` - 主要文档
- `docs/` - 额外指南
- `packages/*/README.md` - 包特定文档

### 🤝 社区

- **保持尊重** 和包容
- **帮助他人** 学习和贡献
- **分享知识** 和最佳实践
- **遵循我们的** [行为准则](CODE_OF_CONDUCT.md)

### 💬 获取帮助

- **GitHub Issues**：技术问题和错误
- **GitHub Discussions**：一般问题和想法
- **Discord**：实时聊天（即将推出）

---

## 🙏 Thank You!

Your contributions make Prefetch better for everyone. We appreciate your time and effort in making this project successful!

## 🙏 谢谢！

您的贡献让 Prefetch 对每个人都更好。我们感谢您为这个项目成功所付出的时间和努力！
