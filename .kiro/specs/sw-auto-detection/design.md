# Service Worker 自动识别与植入功能 - 设计文档

## Overview

本设计文档描述了如何改进 `prefetch-integrate` CLI 工具，使其能够自动检测、智能集成和管理 Service Worker 中的 Prefetch 功能。设计遵循以下原则：

- **自动化优先**: 减少用户手动操作
- **向后兼容**: 保持现有 API 不变，新功能作为增强
- **安全第一**: 所有修改操作都有备份和回滚机制
- **渐进增强**: 按优先级分阶段实现

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Entry Point                          │
│                  (prefetch-integrate)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Command Parser                              │
│  (解析命令行参数、环境变量、配置文件)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Orchestrator                                │
│  (协调各个模块，执行主流程)                                    │
└─────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
      │      │      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼      ▼      ▼
   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
   │扫描│ │检测│ │验证│ │集成│ │备份│ │配置│ │日志│
   │模块│ │模块│ │模块│ │模块│ │模块│ │模块│ │模块│
   └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

### 模块职责

1. **Scanner Module** - 文件扫描模块
   - 扫描项目目录查找 Service Worker 文件
   - 支持多种文件名模式和路径
   - 返回候选文件列表

2. **Detector Module** - 检测模块
   - 检测框架类型
   - 检测已植入的 Prefetch 代码
   - 检测兼容性问题（Workbox、复杂逻辑等）
   - 提取版本信息

3. **Validator Module** - 验证模块
   - 验证 Service Worker 文件有效性
   - 验证配置参数
   - 验证 CDN 可用性
   - 检查注册代码

4. **Integrator Module** - 集成模块
   - 生成集成代码
   - 插入或更新 Prefetch 代码
   - 保持原有代码完整性

5. **Backup Module** - 备份模块
   - 创建文件备份
   - 管理备份历史
   - 执行回滚操作

6. **Config Module** - 配置模块
   - 读取配置文件
   - 合并多个配置源
   - 验证配置有效性

7. **Logger Module** - 日志模块
   - 记录操作日志
   - 支持不同日志级别
   - 输出到文件和控制台

## Components and Interfaces

### 1. Scanner Module

```typescript
interface ScannerOptions {
  rootDir: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  maxDepth?: number;
}

interface ScanResult {
  files: ServiceWorkerFile[];
  framework: FrameworkInfo;
}

interface ServiceWorkerFile {
  path: string;
  relativePath: string;
  size: number;
  lastModified: Date;
  confidence: number; // 0-1, 判断是否为 SW 文件的置信度
}

class Scanner {
  constructor(options: ScannerOptions);
  
  // 扫描项目目录
  async scan(): Promise<ScanResult>;
  
  // 检查单个文件是否为 Service Worker
  isServiceWorker(filePath: string): boolean;
  
  // 获取推荐的扫描路径
  getRecommendedPaths(framework: string): string[];
}
```

**实现要点：**
- 使用 `fast-glob` 进行高效文件扫描
- 优先扫描常见路径（public/, src/）
- 通过文件内容特征判断是否为 SW（如包含 `self.addEventListener`）
- 支持自定义扫描模式

### 2. Detector Module

```typescript
interface DetectionResult {
  hasPrefetch: boolean;
  version?: string;
  generatedAt?: Date;
  config?: PrefetchConfig;
  compatibility: CompatibilityIssue[];
  framework: FrameworkInfo;
}

interface CompatibilityIssue {
  type: 'warning' | 'error';
  code: string;
  message: string;
  suggestion?: string;
}

interface FrameworkInfo {
  name: string; // 'nextjs', 'cra', 'vue-vite', etc.
  version?: string;
  publicDir: string;
  buildDir: string;
}

class Detector {
  // 检测 Prefetch 集成状态
  async detectPrefetch(filePath: string): Promise<DetectionResult>;
  
  // 检测框架类型
  detectFramework(rootDir: string): FrameworkInfo;
  
  // 检测兼容性问题
  detectCompatibility(content: string): CompatibilityIssue[];
  
  // 提取版本信息
  extractVersion(content: string): string | null;
  
  // 检测 Workbox
  detectWorkbox(content: string): boolean;
  
  // 检测复杂的 fetch 逻辑
  detectComplexFetchLogic(content: string): boolean;
}
```

**实现要点：**
- 使用正则表达式匹配特征标记
- 解析 package.json 判断框架
- 检测 `importScripts('workbox-')` 等 Workbox 特征
- 分析 fetch 事件监听器的复杂度

### 3. Validator Module

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

class Validator {
  // 验证 Service Worker 文件
  async validateServiceWorker(filePath: string): Promise<ValidationResult>;
  
  // 验证配置参数
  validateConfig(config: PrefetchConfig): ValidationResult;
  
  // 验证 CDN 可用性
  async validateCDN(cdnUrl: string): Promise<boolean>;
  
  // 检查注册代码
  async checkRegistrationCode(rootDir: string, framework: string): Promise<boolean>;
  
  // 验证正则表达式
  validateRegex(pattern: string): boolean;
}
```

**实现要点：**
- 使用 `acorn` 或 `esprima` 解析 JavaScript 语法
- 使用 `fetch` 或 `axios` 检查 CDN 可用性（带超时）
- 扫描入口文件查找 `navigator.serviceWorker.register`
- 使用 try-catch 验证正则表达式

### 4. Integrator Module

```typescript
interface IntegrationOptions {
  mode: 'create' | 'integrate' | 'update';
  inputPath?: string;
  outputPath: string;
  config: PrefetchConfig;
  debug?: boolean;
  debugPort?: number;
  cdnPrefix?: string;      // 自定义 CDN URL 前缀
  localDev?: boolean;      // 是否为本地开发模式
  force?: boolean;
}

interface IntegrationResult {
  success: boolean;
  outputPath: string;
  backupPath?: string;
  changes: Change[];
  warnings: string[];
  cdnUrl?: string;         // 实际使用的 CDN URL
}

interface Change {
  type: 'add' | 'update' | 'remove';
  description: string;
  lineStart?: number;
  lineEnd?: number;
}

class Integrator {
  // 执行集成
  async integrate(options: IntegrationOptions): Promise<IntegrationResult>;
  
  // 生成集成代码
  generateIntegrationCode(config: PrefetchConfig, options: any): string;
  
  // 生成基础 Service Worker
  generateBaseServiceWorker(): string;
  
  // 更新现有集成
  updateExistingIntegration(content: string, newCode: string): string;
  
  // 移除旧的集成代码
  removeOldIntegration(content: string): string;
  
  // 解析 CDN URL（支持自定义前缀）
  resolveCDNUrl(options: IntegrationOptions): string;
}
```

**实现要点：**
- 保持现有的 `generateIntegrationCode` 逻辑
- 使用正则表达式精确定位和替换代码块
- 记录所有修改操作
- 支持 dry-run 模式（不实际写入文件）

### 5. Backup Module

```typescript
interface BackupOptions {
  maxBackups?: number; // 默认 5
  backupDir?: string;  // 默认 .prefetch/backups
}

interface BackupInfo {
  originalPath: string;
  backupPath: string;
  timestamp: Date;
  size: number;
  hash: string; // 文件内容的 hash
}

class BackupManager {
  constructor(options?: BackupOptions);
  
  // 创建备份
  async createBackup(filePath: string): Promise<BackupInfo>;
  
  // 列出所有备份
  async listBackups(filePath: string): Promise<BackupInfo[]>;
  
  // 回滚到指定备份
  async rollback(backupPath: string): Promise<void>;
  
  // 清理旧备份
  async cleanOldBackups(filePath: string): Promise<void>;
  
  // 验证备份完整性
  async verifyBackup(backupInfo: BackupInfo): Promise<boolean>;
}
```

**实现要点：**
- 备份文件命名：`<filename>.backup.<timestamp>`
- 使用 `crypto` 模块计算文件 hash
- 自动清理超过 maxBackups 数量的旧备份
- 回滚时验证备份文件完整性

### 6. Config Module

```typescript
interface ConfigSource {
  type: 'file' | 'cli' | 'env' | 'default';
  priority: number;
  data: Partial<PrefetchConfig>;
}

interface PrefetchConfig {
  serviceWorker?: {
    path?: string;
    scope?: string;
  };
  prefetch: {
    apiMatcher: string | RegExp;
    defaultExpireTime: number;
    maxCacheSize: number;
    debug: boolean;
  };
  integration?: {
    autoScan?: boolean;
    createBackup?: boolean;
    maxBackups?: number;
  };
}

class ConfigManager {
  // 加载配置
  async loadConfig(rootDir: string): Promise<PrefetchConfig>;
  
  // 合并多个配置源
  mergeConfigs(sources: ConfigSource[]): PrefetchConfig;
  
  // 读取配置文件
  async readConfigFile(rootDir: string): Promise<Partial<PrefetchConfig> | null>;
  
  // 生成配置文件模板
  generateConfigTemplate(): string;
  
  // 验证配置
  validateConfig(config: PrefetchConfig): ValidationResult;
}
```

**配置文件格式 (.prefetchrc.json):**
```json
{
  "$schema": "https://unpkg.com/@norejs/prefetch/schema.json",
  "serviceWorker": {
    "path": "public/service-worker.js",
    "scope": "/"
  },
  "prefetch": {
    "apiMatcher": "/api/*",
    "defaultExpireTime": 30000,
    "maxCacheSize": 100,
    "debug": false
  },
  "integration": {
    "autoScan": true,
    "createBackup": true,
    "maxBackups": 5
  },
  "development": {
    "cdnPrefix": "http://localhost:3100",
    "localDev": true,
    "debugPort": 3100
  }
}
```

**配置优先级（从高到低）:**
1. CLI 参数 (`--config`, `--debug`, `--cdn-prefix` 等)
2. 环境变量 (`PREFETCH_DEBUG`, `PREFETCH_CDN_PREFIX` 等)
3. 配置文件 (`.prefetchrc.json`, `prefetch.config.js`)
4. 默认值

### 7. Logger Module

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

interface LoggerOptions {
  level: LogLevel;
  logDir?: string;
  console?: boolean;
  file?: boolean;
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  constructor(options: LoggerOptions);
  
  error(message: string, error?: Error): void;
  warn(message: string, data?: any): void;
  info(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  trace(message: string, data?: any): void;
  
  // 获取日志文件路径
  getLogFilePath(): string;
  
  // 清理旧日志
  cleanOldLogs(daysToKeep: number): Promise<void>;
}
```

**实现要点：**
- 日志文件路径：`.prefetch/logs/prefetch-integrate-<date>.log`
- 使用 `winston` 或自定义实现
- 支持日志轮转
- 错误日志包含完整堆栈信息

## Data Models

### 核心数据结构

```typescript
// 项目上下文
interface ProjectContext {
  rootDir: string;
  framework: FrameworkInfo;
  packageJson: any;
  serviceWorkers: ServiceWorkerFile[];
  config: PrefetchConfig;
}

// 操作上下文
interface OperationContext {
  mode: 'create' | 'integrate' | 'update' | 'verify' | 'rollback';
  dryRun: boolean;
  verbose: boolean;
  force: boolean;
  interactive: boolean;
}

// 执行结果
interface ExecutionResult {
  success: boolean;
  operation: string;
  duration: number; // ms
  changes: Change[];
  warnings: string[];
  errors: Error[];
  artifacts: {
    outputPath?: string;
    backupPath?: string;
    logPath?: string;
  };
}
```

## Error Handling

### 错误分类

```typescript
enum ErrorCode {
  // 文件相关
  FILE_NOT_FOUND = 'E001',
  FILE_READ_ERROR = 'E002',
  FILE_WRITE_ERROR = 'E003',
  
  // 配置相关
  INVALID_CONFIG = 'E101',
  CONFIG_FILE_ERROR = 'E102',
  
  // 检测相关
  DETECTION_FAILED = 'E201',
  FRAMEWORK_UNKNOWN = 'E202',
  
  // 集成相关
  INTEGRATION_FAILED = 'E301',
  BACKUP_FAILED = 'E302',
  ROLLBACK_FAILED = 'E303',
  
  // 验证相关
  VALIDATION_FAILED = 'E401',
  CDN_UNAVAILABLE = 'E402',
  
  // 网络相关
  NETWORK_ERROR = 'E501',
  TIMEOUT = 'E502'
}

class PrefetchError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PrefetchError';
  }
}
```

### 错误处理策略

1. **文件操作错误**: 提供详细的文件路径和权限信息
2. **配置错误**: 指出具体的配置项和期望值
3. **网络错误**: 提供重试机制和降级方案
4. **集成失败**: 自动回滚到备份
5. **用户中断**: 清理临时文件，保持项目干净

## Testing Strategy

### 单元测试

每个模块独立测试：

```typescript
// Scanner 测试
describe('Scanner', () => {
  it('should find service worker in public directory');
  it('should handle multiple service workers');
  it('should respect exclude patterns');
  it('should calculate confidence score correctly');
});

// Detector 测试
describe('Detector', () => {
  it('should detect existing Prefetch integration');
  it('should extract version information');
  it('should detect Workbox usage');
  it('should identify framework correctly');
});

// Integrator 测试
describe('Integrator', () => {
  it('should generate valid integration code');
  it('should preserve existing code');
  it('should update existing integration');
  it('should handle edge cases');
});
```

### 集成测试

测试完整流程：

```typescript
describe('Integration Flow', () => {
  it('should auto-detect and integrate successfully');
  it('should handle existing integration gracefully');
  it('should create backup before modification');
  it('should rollback on failure');
});
```

### E2E 测试

在真实项目中测试：

```bash
# 测试不同框架
test-projects/
  ├── nextjs-app/
  ├── cra-app/
  ├── vue-vite-app/
  ├── nuxt-app/
  └── existing-sw-app/
```

## Implementation Plan

### Phase 1: 核心功能 (P0)

#### 1.1 Scanner Module
- 实现文件扫描逻辑
- 支持多种文件名模式
- 计算置信度分数

#### 1.2 Detector Module (Enhanced)
- 增强版本检测
- 添加兼容性检测
- 改进框架检测

#### 1.3 Interactive Flow Optimization
- 自动扫描并推荐
- 智能默认选项
- 清晰的进度提示

#### 1.4 Backup Module
- 实现备份创建
- 实现回滚功能
- 备份历史管理

### Phase 2: 稳定性增强 (P1)

#### 2.1 Config Module
- 配置文件读取
- 多源配置合并
- 配置验证

#### 2.2 Validator Module (Enhanced)
- CDN 可用性检查
- 注册代码检测
- 配置参数验证

### Phase 3: 开发体验优化 (P2)

#### 3.1 Framework-Specific Features
- 生成注册代码示例
- 框架特定的最佳实践
- 检测已有注册代码

#### 3.2 Logger Module
- 详细日志记录
- 日志文件管理
- Dry-run 模式

### Phase 4: 高级功能 (P3)

#### 4.1 Workspace Support
- Monorepo 检测
- 批量操作
- 并行处理

## Performance Considerations

1. **文件扫描优化**
   - 使用 `fast-glob` 而不是递归遍历
   - 限制扫描深度（默认 3 层）
   - 并行扫描多个目录

2. **缓存策略**
   - 缓存框架检测结果
   - 缓存文件内容分析结果
   - 使用 LRU 缓存

3. **异步操作**
   - 所有 I/O 操作使用 async/await
   - 并行执行独立任务
   - 使用 Promise.all 优化

4. **内存管理**
   - 流式处理大文件
   - 及时释放不需要的对象
   - 限制并发操作数量

## Security Considerations

1. **文件操作安全**
   - 验证文件路径，防止路径遍历攻击
   - 检查文件权限
   - 使用安全的文件操作 API

2. **代码注入防护**
   - 验证用户输入的配置
   - 转义特殊字符
   - 使用模板而不是字符串拼接

3. **网络安全**
   - 使用 HTTPS 访问 CDN
   - 验证 CDN 响应
   - 设置合理的超时时间

4. **备份安全**
   - 备份文件权限与原文件一致
   - 定期清理敏感信息
   - 加密存储（可选）

## Migration Guide

### 从当前版本迁移

现有用户无需修改任何代码，新功能完全向后兼容：

```bash
# 旧方式仍然有效
prefetch-integrate --create --output public/sw.js
prefetch-integrate --input public/sw.js --output public/sw.js

# 新方式更简单
prefetch-integrate --auto
prefetch-integrate --interactive
```

### 配置文件迁移

如果用户想使用配置文件：

```bash
# 生成配置文件模板
prefetch-integrate --init-config

# 编辑 .prefetchrc.json
# 之后直接运行
prefetch-integrate
```

## Development and Debugging

### 开发模式支持

为了便于开发和调试，CLI 工具提供多种方式指定 importScripts 的 URL：

#### 1. 命令行参数方式

```bash
# 使用本地开发服务器
prefetch-integrate --create \
  --output public/sw.js \
  --cdn-prefix http://localhost:3100 \
  --local-dev

# 使用自定义 CDN 前缀
prefetch-integrate --create \
  --output public/sw.js \
  --cdn-prefix https://my-cdn.example.com

# 指定完整的 URL（覆盖所有默认逻辑）
prefetch-integrate --create \
  --output public/sw.js \
  --cdn-url http://localhost:3100/prefetch-worker.umd.js
```

#### 2. 环境变量方式

```bash
# 设置环境变量
export PREFETCH_CDN_PREFIX=http://localhost:3100
export PREFETCH_LOCAL_DEV=true

# 运行命令
prefetch-integrate --create --output public/sw.js
```

#### 3. 配置文件方式

```json
{
  "development": {
    "cdnPrefix": "http://localhost:3100",
    "localDev": true,
    "debugPort": 3100
  }
}
```

#### 4. 快捷命令

```bash
# 开发模式快捷方式（自动使用 localhost:3100）
prefetch-integrate --dev

# 等同于
prefetch-integrate --cdn-prefix http://localhost:3100 --local-dev --debug
```

### CDN URL 解析逻辑

```typescript
class CDNResolver {
  resolveCDNUrl(options: IntegrationOptions): string {
    // 1. 优先使用完整 URL（如果提供）
    if (options.cdnUrl) {
      return options.cdnUrl;
    }
    
    // 2. 本地开发模式
    if (options.localDev || options.debug) {
      const port = options.debugPort || 3100;
      const prefix = options.cdnPrefix || `http://localhost:${port}`;
      return `${prefix}/prefetch-worker.umd.js`;
    }
    
    // 3. 自定义 CDN 前缀
    if (options.cdnPrefix) {
      const version = options.version || 'latest';
      return `${options.cdnPrefix}/@norejs/prefetch-worker@${version}/dist/prefetch-worker.umd.js`;
    }
    
    // 4. 默认使用 esm.sh CDN
    const version = options.version || require('../package.json').version;
    return `https://esm.sh/@norejs/prefetch-worker@${version}/dist/prefetch-worker.umd.js`;
  }
  
  // 验证 URL 格式
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // 检测是否为本地 URL
  isLocalUrl(url: string): boolean {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
}
```

### 开发工作流示例

#### 场景 1: 开发 prefetch-worker 包

```bash
# Terminal 1: 启动 prefetch-worker 开发服务器
cd packages/prefetch-worker
npm run dev:server
# Server running at http://localhost:3100

# Terminal 2: 在测试项目中集成
cd my-test-app
prefetch-integrate --dev --output public/sw.js

# 生成的 Service Worker 会使用:
# importScripts('http://localhost:3100/prefetch-worker.umd.js')
```

#### 场景 2: 测试不同版本

```bash
# 测试特定版本
prefetch-integrate --create \
  --output public/sw.js \
  --version 1.0.0

# 测试 beta 版本
prefetch-integrate --create \
  --output public/sw.js \
  --cdn-prefix https://cdn.example.com/beta

# 测试本地构建
prefetch-integrate --create \
  --output public/sw.js \
  --cdn-url file:///path/to/local/prefetch-worker.umd.js
```

#### 场景 3: 团队开发配置

```json
// .prefetchrc.json (提交到 Git)
{
  "prefetch": {
    "apiMatcher": "/api/*",
    "defaultExpireTime": 30000
  }
}

// .prefetchrc.local.json (不提交，本地开发用)
{
  "development": {
    "cdnPrefix": "http://localhost:3100",
    "localDev": true
  }
}
```

### 调试信息输出

开发模式下，CLI 会输出详细的调试信息：

```bash
$ prefetch-integrate --dev --verbose

🔍 Detecting framework...
   ✓ Framework: nextjs
   ✓ Public directory: public/

🔍 Scanning for Service Workers...
   ✓ Found: public/service-worker.js

🔍 Analyzing existing file...
   ✓ Has Prefetch integration: Yes
   ✓ Current version: 0.1.0-alpha.10
   ✓ Compatibility issues: None

🔧 Development Mode Configuration:
   • CDN URL: http://localhost:3100/prefetch-worker.umd.js
   • Debug: Enabled
   • Backup: Enabled

⚠️  Development Mode Warning:
   Make sure the dev server is running:
   cd packages/prefetch-worker && npm run dev:server

💾 Creating backup...
   ✓ Backup: public/service-worker.js.backup.1234567890

🔨 Integrating Prefetch code...
   ✓ Integration complete

✅ Success!
   Output: /path/to/public/service-worker.js
   Backup: /path/to/public/service-worker.js.backup.1234567890
   CDN URL: http://localhost:3100/prefetch-worker.umd.js
   
📝 Next steps:
   1. Start the dev server: cd packages/prefetch-worker && npm run dev:server
   2. Refresh your app to load the new Service Worker
   3. Check browser console for Prefetch logs
```

### 环境变量参考

```bash
# CDN 配置
PREFETCH_CDN_PREFIX=http://localhost:3100
PREFETCH_CDN_URL=http://localhost:3100/prefetch-worker.umd.js
PREFETCH_VERSION=1.0.0

# 开发模式
PREFETCH_LOCAL_DEV=true
PREFETCH_DEBUG=true
PREFETCH_DEBUG_PORT=3100

# 集成配置
PREFETCH_AUTO_SCAN=true
PREFETCH_CREATE_BACKUP=true
PREFETCH_MAX_BACKUPS=5

# 日志配置
PREFETCH_LOG_LEVEL=debug
PREFETCH_VERBOSE=true
```

### CLI 参数完整列表

```bash
prefetch-integrate [options]

Mode Options:
  --create                Create a new Service Worker
  --integrate             Integrate into existing Service Worker
  --update                Update existing integration
  --verify <file>         Verify integration
  --rollback [file]       Rollback to backup
  --auto                  Auto-detect and integrate
  --interactive, -i       Interactive mode

File Options:
  --input <file>          Input Service Worker file
  --output <file>         Output file path
  --scan-dir <dir>        Directory to scan (default: current)

CDN Options:
  --cdn-prefix <url>      CDN URL prefix (e.g., http://localhost:3100)
  --cdn-url <url>         Complete CDN URL (overrides prefix)
  --version <version>     Package version to use
  --local-dev             Enable local development mode
  --dev                   Shortcut for local dev mode

Configuration Options:
  --config <json>         Prefetch configuration (JSON string)
  --config-file <file>    Path to config file
  --init-config           Generate config file template

Debug Options:
  --debug                 Enable debug mode
  --debug-port <port>     Debug server port (default: 3100)
  --verbose, -v           Verbose output
  --dry-run               Simulate without making changes

Backup Options:
  --backup                Create backup (default: true)
  --no-backup             Skip backup creation
  --max-backups <n>       Max number of backups (default: 5)

Other Options:
  --force, -f             Force operation, skip warnings
  --help, -h              Show help
  --version               Show version

Examples:
  # Development mode
  prefetch-integrate --dev
  prefetch-integrate --cdn-prefix http://localhost:3100 --debug
  
  # Production mode
  prefetch-integrate --auto
  prefetch-integrate --create --output public/sw.js
  
  # Custom CDN
  prefetch-integrate --cdn-prefix https://my-cdn.com --version 1.0.0
  
  # Verify and rollback
  prefetch-integrate --verify public/sw.js
  prefetch-integrate --rollback public/sw.js
```

## Documentation Updates

需要更新的文档：

1. **README.md** - 添加新功能说明
2. **CLI 帮助文档** - 更新命令行选项
3. **配置文件文档** - 详细说明配置项
4. **开发指南** - 本地开发和调试流程
5. **故障排查指南** - 常见问题和解决方案
6. **API 文档** - 如果提供编程接口

## Monitoring and Metrics

可选的遥测数据（需用户同意）：

- 使用的框架类型
- 集成成功率
- 常见错误类型
- 平均执行时间
- 功能使用频率

这些数据可以帮助改进工具，但必须：
- 完全匿名
- 用户可选择退出
- 不收集敏感信息
- 透明地说明收集内容
