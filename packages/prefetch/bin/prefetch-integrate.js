#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const VERSION = require('../package.json').version;

// esm.sh CDN URL
const ESM_SH_BASE = 'https://esm.sh';
const PACKAGE_NAME = '@norejs/prefetch-worker';

class PrefetchIntegrator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 检测项目框架
   */
  detectFramework() {
    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return { framework: 'unknown', publicDir: 'public' };
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // 检测框架
      if (dependencies['react'] || dependencies['react-dom']) {
        if (dependencies['next']) {
          return { framework: 'nextjs', publicDir: 'public', buildDir: '.next' };
        } else if (dependencies['react-scripts']) {
          return { framework: 'cra', publicDir: 'public', buildDir: 'build' };
        } else if (dependencies['vite']) {
          return { framework: 'react-vite', publicDir: 'public', buildDir: 'dist' };
        }
        return { framework: 'react', publicDir: 'public' };
      }

      if (dependencies['vue']) {
        if (dependencies['@vue/cli-service']) {
          return { framework: 'vue-cli', publicDir: 'public', buildDir: 'dist' };
        } else if (dependencies['vite']) {
          return { framework: 'vue-vite', publicDir: 'public', buildDir: 'dist' };
        } else if (dependencies['nuxt']) {
          return { framework: 'nuxt', publicDir: 'public', buildDir: '.nuxt' };
        }
        return { framework: 'vue', publicDir: 'public' };
      }

      if (dependencies['vite']) {
        return { framework: 'vite', publicDir: 'public', buildDir: 'dist' };
      }

      return { framework: 'unknown', publicDir: 'public' };
    } catch (error) {
      console.warn('Failed to detect framework:', error.message);
      return { framework: 'unknown', publicDir: 'public' };
    }
  }

  /**
   * 获取推荐的 Service Worker 路径
   */
  getRecommendedPath(framework) {
    const paths = {
      'nextjs': 'public/service-worker.js',
      'cra': 'public/service-worker.js',
      'react-vite': 'public/service-worker.js',
      'vue-cli': 'public/service-worker.js',
      'vue-vite': 'public/service-worker.js',
      'nuxt': 'public/service-worker.js',
      'vite': 'public/service-worker.js',
      'react': 'public/service-worker.js',
      'vue': 'public/service-worker.js',
      'unknown': 'public/service-worker.js'
    };

    return paths[framework] || 'public/service-worker.js';
  }

  /**
   * 显示框架特定的提示
   */
  showFrameworkTips(framework) {
    const tips = {
      'nextjs': `
📝 Next.js 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 在 _app.js 或 _app.tsx 中注册 Service Worker
  - 确保在客户端代码中使用 'use client' 指令（App Router）
`,
      'cra': `
📝 Create React App 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 在 src/index.js 中注册 Service Worker
  - CRA 默认不支持 Service Worker，需要手动注册
`,
      'react-vite': `
📝 React + Vite 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 在 src/main.jsx 中注册 Service Worker
  - Vite 会自动复制 public 目录到构建输出
`,
      'vue-cli': `
📝 Vue CLI 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 在 src/main.js 中注册 Service Worker
  - Vue CLI 会自动处理 public 目录
`,
      'vue-vite': `
📝 Vue 3 + Vite 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 在 src/main.js 中注册 Service Worker
  - Vite 会自动复制 public 目录到构建输出
`,
      'nuxt': `
📝 Nuxt.js 项目提示:
  - Service Worker 文件已创建在 public/ 目录
  - 考虑使用 @nuxtjs/pwa 模块
  - 或在 app.vue 中手动注册
`
    };

    return tips[framework] || `
📝 提示:
  - Service Worker 文件已创建
  - 请在应用入口文件中注册 Service Worker
  - 确保文件在构建时被正确复制
`;
  }

  /**
   * 生成 Prefetch 集成代码
   */
  generateIntegrationCode(options = {}) {
    const {
      version = VERSION,
      config = {},
      useLatest = false,
      debug = false,
      debugPort = 3100
    } = options;

    // 根据 debug 模式选择 CDN URL
    const cdnUrl = debug
      ? `http://localhost:${debugPort}/prefetch-worker.umd.js`
      : useLatest 
        ? `${ESM_SH_BASE}/${PACKAGE_NAME}@latest/dist/prefetch-worker.umd.js`
        : `${ESM_SH_BASE}/${PACKAGE_NAME}@${version}/dist/prefetch-worker.umd.js`;

    const configJson = JSON.stringify(config, null, 2).split('\n').map((line, i) => 
      i === 0 ? line : '      ' + line
    ).join('\n');

    return `
// ============================================
// Prefetch Worker Integration
// Version: ${version}
// Mode: ${debug ? 'DEBUG (Local Dev Server)' : 'PRODUCTION (CDN)'}
// Generated: ${new Date().toISOString()}
// ============================================

(function() {
  'use strict';
  
  const PREFETCH_CONFIG = {
    // CDN URL${debug ? ' - Local Dev Server' : ' - esm.sh CDN'}
    cdnUrl: '${cdnUrl}',
    
    // 本地降级文件（可选）
    fallbackUrl: '/prefetch-worker.umd.js',
    
    // 加载超时时间（毫秒）
    timeout: 5000,
    
    // 最大重试次数
    maxRetries: 2,
    
    // Prefetch 配置
    prefetchConfig: ${configJson}
  };
  
  let prefetchHandler = null;
  let loadAttempts = 0;
  let isLoading = false;
  
  /**
   * 加载 Prefetch Worker
   */
  function loadPrefetchWorker() {
    if (isLoading) {
      console.log('[Prefetch] Already loading...');
      return false;
    }
    
    if (loadAttempts >= PREFETCH_CONFIG.maxRetries) {
      console.error('[Prefetch] Max load attempts reached');
      return false;
    }
    
    isLoading = true;
    loadAttempts++;
    
    try {
      const startTime = Date.now();
      console.log(\`[Prefetch] Loading from CDN (attempt \${loadAttempts})...\`);
      
      // 同步加载脚本
      importScripts(PREFETCH_CONFIG.cdnUrl);
      
      const loadTime = Date.now() - startTime;
      console.log(\`[Prefetch] ✓ Loaded successfully in \${loadTime}ms\`);
      
      // 验证加载成功
      if (!self.PrefetchWorker) {
        throw new Error('PrefetchWorker not found in global scope');
      }
      
      isLoading = false;
      return true;
      
    } catch (error) {
      console.warn(\`[Prefetch] ✗ Load attempt \${loadAttempts} failed:\`, error.message);
      isLoading = false;
      
      // 重试
      if (loadAttempts < PREFETCH_CONFIG.maxRetries) {
        console.log('[Prefetch] Retrying...');
        return loadPrefetchWorker();
      }
      
      // 尝试降级到本地文件
      if (PREFETCH_CONFIG.fallbackUrl) {
        try {
          console.log('[Prefetch] Trying fallback URL...');
          importScripts(PREFETCH_CONFIG.fallbackUrl);
          
          if (self.PrefetchWorker) {
            console.log('[Prefetch] ✓ Loaded from fallback');
            return true;
          }
        } catch (fallbackError) {
          console.error('[Prefetch] ✗ Fallback also failed:', fallbackError.message);
        }
      }
      
      return false;
    }
  }
  
  /**
   * 初始化 Prefetch Handler
   */
  function initializePrefetch(config) {
    if (!self.PrefetchWorker) {
      console.error('[Prefetch] PrefetchWorker not available');
      return null;
    }
    
    try {
      const mergedConfig = {
        ...PREFETCH_CONFIG.prefetchConfig,
        ...config
      };
      
      console.log('[Prefetch] Initializing with config:', mergedConfig);
      
      const handler = self.PrefetchWorker.setup(mergedConfig);
      
      console.log('[Prefetch] ✓ Initialized successfully');
      return handler;
      
    } catch (error) {
      console.error('[Prefetch] ✗ Initialization failed:', error);
      return null;
    }
  }
  
  /**
   * 消息处理 - 支持延迟加载
   */
  self.addEventListener('message', (event) => {
    if (!event.data) return;
    
    // 初始化消息
    if (event.data.type === 'PREFETCH_INIT') {
      console.log('[Prefetch] Received INIT message');
      
      if (!prefetchHandler) {
        // 延迟加载：只在需要时加载
        if (loadPrefetchWorker()) {
          prefetchHandler = initializePrefetch(event.data.config || {});
          
          // 通知主线程初始化完成
          if (event.source && prefetchHandler) {
            event.source.postMessage({
              type: 'PREFETCH_INIT_SUCCESS',
              config: event.data.config
            });
          } else if (event.source) {
            event.source.postMessage({
              type: 'PREFETCH_INIT_ERROR',
              error: 'Failed to initialize Prefetch Worker'
            });
          }
        }
      }
    }
    
    // 健康检查
    if (event.data.type === 'PREFETCH_HEALTH_CHECK') {
      if (event.source) {
        event.source.postMessage({
          type: 'PREFETCH_HEALTH_RESPONSE',
          loaded: !!self.PrefetchWorker,
          initialized: !!prefetchHandler,
          attempts: loadAttempts
        });
      }
    }
  });
  
  /**
   * Fetch 事件处理
   */
  const originalFetchHandler = self.onfetch;
  
  self.addEventListener('fetch', (event) => {
    // 优先使用 Prefetch 处理
    if (prefetchHandler) {
      try {
        const response = prefetchHandler(event);
        if (response) {
          return event.respondWith(response);
        }
      } catch (error) {
        console.error('[Prefetch] Fetch handler error:', error);
      }
    }
    
    // 调用原有的 fetch 处理逻辑（如果存在）
    if (originalFetchHandler) {
      return originalFetchHandler.call(self, event);
    }
  });
  
  console.log('[Prefetch] Integration loaded, waiting for INIT message');
  
})();

// ============================================
// End of Prefetch Worker Integration
// ============================================
`;
  }

  /**
   * 创建新的 Service Worker
   */
  async createServiceWorker(options = {}) {
    let {
      output,
      config = {},
      debug = false,
      debugPort = 3100
    } = options;

    // 检测框架并推荐路径
    const frameworkInfo = this.detectFramework();
    
    if (!output) {
      output = this.getRecommendedPath(frameworkInfo.framework);
      console.log(`\n🔍 检测到框架: ${frameworkInfo.framework}`);
      console.log(`📁 推荐路径: ${output}`);
    }

    const baseServiceWorker = `
// Service Worker
// Generated by @norejs/prefetch

console.log('Service Worker: Script loaded');

// 安装阶段
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// 激活阶段
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Service Worker: Activated and controlling clients');
    })
  );
});

// Fetch 事件处理（将被 Prefetch 集成代码增强）
self.addEventListener('fetch', (event) => {
  // 默认行为：直接透传请求
  // Prefetch 集成代码会拦截并处理匹配的请求
});

console.log('Service Worker: Base setup complete');
`;

    const integrationCode = this.generateIntegrationCode({ 
      config, 
      debug, 
      debugPort 
    });
    const fullContent = baseServiceWorker + '\n' + integrationCode;

    // 写入文件
    const outputPath = path.resolve(process.cwd(), output);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, fullContent);

    console.log('\n✅ Service Worker created successfully!');
    console.log(`📁 Output: ${outputPath}`);
    
    if (debug) {
      console.log(`🔧 Mode: DEBUG`);
      console.log(`🌐 Local Dev Server: http://localhost:${debugPort}/prefetch-worker.umd.js`);
      console.log(`\n⚠️  Make sure to start the dev server:`);
      console.log(`   cd packages/prefetch-worker && npm run dev:server`);
    } else {
      console.log(`🌐 CDN: esm.sh/${PACKAGE_NAME}@${VERSION}`);
    }
    
    console.log(this.showFrameworkTips(frameworkInfo.framework));
    
    return outputPath;
  }

  /**
   * 集成到现有 Service Worker
   */
  async integrateExisting(options = {}) {
    const {
      input,
      output,
      config = {},
      debug = false,
      debugPort = 3100
    } = options;

    // 读取现有文件
    const inputPath = path.resolve(process.cwd(), input);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const existingContent = fs.readFileSync(inputPath, 'utf8');

    // 检查是否已经集成
    if (existingContent.includes('Prefetch Worker Integration')) {
      console.log('\n⚠️  Warning: This Service Worker already has Prefetch integration');
      const answer = await this.question('Do you want to replace it? (y/n): ');
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.');
        return null;
      }

      // 移除旧的集成代码
      const cleanContent = existingContent.replace(
        /\/\/ ={40,}\n\/\/ Prefetch Worker Integration[\s\S]*?\/\/ End of Prefetch Worker Integration\n\/\/ ={40,}\n/g,
        ''
      );

      const integrationCode = this.generateIntegrationCode({ 
        config, 
        debug, 
        debugPort 
      });
      const fullContent = cleanContent + '\n' + integrationCode;

      fs.writeFileSync(path.resolve(process.cwd(), output), fullContent);
    } else {
      // 添加集成代码
      const integrationCode = this.generateIntegrationCode({ 
        config, 
        debug, 
        debugPort 
      });
      const fullContent = existingContent + '\n' + integrationCode;

      fs.writeFileSync(path.resolve(process.cwd(), output), fullContent);
    }

    console.log('\n✅ Integration complete!');
    console.log(`📁 Input: ${inputPath}`);
    console.log(`📁 Output: ${path.resolve(process.cwd(), output)}`);
    
    if (debug) {
      console.log(`🔧 Mode: DEBUG`);
      console.log(`🌐 Local Dev Server: http://localhost:${debugPort}/prefetch-worker.umd.js`);
    } else {
      console.log(`🌐 CDN: esm.sh/${PACKAGE_NAME}@${VERSION}`);
    }

    return output;
  }

  /**
   * 交互式配置
   */
  async interactive() {
    console.log('\n🚀 Prefetch Worker Integration Tool\n');

    // 1. 选择操作类型
    console.log('What would you like to do?');
    console.log('  1) Create a new Service Worker');
    console.log('  2) Integrate into existing Service Worker');
    
    const choice = await this.question('\nEnter your choice (1 or 2): ');

    // 2. 收集配置
    console.log('\n📝 Configuration:');
    
    const apiMatcher = await this.question('API matcher pattern (default: /api/*): ') || '/api/*';
    const expireTime = await this.question('Default cache expire time in ms (default: 30000): ') || '30000';
    const maxCacheSize = await this.question('Max cache size (default: 100): ') || '100';
    const debug = await this.question('Enable debug mode? (y/n, default: n): ');

    const config = {
      apiMatcher,
      defaultExpireTime: parseInt(expireTime),
      maxCacheSize: parseInt(maxCacheSize),
      debug: debug.toLowerCase() === 'y'
    };

    // 3. 执行操作
    if (choice === '1') {
      const output = await this.question('\nOutput file path (default: public/service-worker.js): ') 
        || 'public/service-worker.js';
      
      await this.createServiceWorker({ output, config });
    } else if (choice === '2') {
      const input = await this.question('\nExisting Service Worker path: ');
      if (!input) {
        console.error('Error: Input path is required');
        return;
      }

      const output = await this.question('Output file path (default: same as input): ') || input;
      
      await this.integrateExisting({ input, output, config });
    } else {
      console.error('Invalid choice');
    }

    this.rl.close();
  }

  /**
   * 验证集成
   */
  verify(options = {}) {
    const { input } = options;
    const inputPath = path.resolve(process.cwd(), input);

    if (!fs.existsSync(inputPath)) {
      console.error(`❌ File not found: ${inputPath}`);
      return false;
    }

    const content = fs.readFileSync(inputPath, 'utf8');

    console.log('\n🔍 Verifying Prefetch integration...\n');

    const checks = [
      {
        name: 'Has Prefetch integration',
        test: () => content.includes('Prefetch Worker Integration')
      },
      {
        name: 'Has importScripts call',
        test: () => content.includes('importScripts')
      },
      {
        name: 'Uses esm.sh CDN',
        test: () => content.includes('esm.sh')
      },
      {
        name: 'Has message handler',
        test: () => content.includes("type === 'PREFETCH_INIT'")
      },
      {
        name: 'Has fetch handler',
        test: () => content.includes('prefetchHandler')
      }
    ];

    let passed = 0;
    checks.forEach(check => {
      const result = check.test();
      console.log(`${result ? '✅' : '❌'} ${check.name}`);
      if (result) passed++;
    });

    console.log(`\n${passed}/${checks.length} checks passed`);

    if (passed === checks.length) {
      console.log('\n✅ Integration looks good!');
      return true;
    } else {
      console.log('\n⚠️  Some checks failed. Please review the integration.');
      return false;
    }
  }

  /**
   * 辅助方法：询问用户输入
   */
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }
}

// ============================================
// CLI 入口
// ============================================

function showHelp() {
  console.log(`
@norejs/prefetch Integration Tool v${VERSION}

Usage:
  prefetch-integrate [options]

Options:
  --create                Create a new Service Worker
  --input <file>          Existing Service Worker file to integrate
  --output <file>         Output file path
  --interactive, -i       Interactive mode
  --verify <file>         Verify existing integration
  --config <json>         Prefetch configuration (JSON string)
  --version <version>     Specify package version (default: ${VERSION})
  --debug                 Enable debug mode (use local dev server)
  --debug-port <port>     Local dev server port (default: 18030)
  --help, -h              Show this help

Examples:
  # Create new Service Worker
  prefetch-integrate --create --output public/service-worker.js

  # Create with debug mode (local dev server)
  prefetch-integrate --create --output public/service-worker.js --debug

  # Integrate into existing Service Worker
  prefetch-integrate --input public/sw.js --output public/sw-integrated.js

  # Interactive mode
  prefetch-integrate --interactive

  # Verify integration
  prefetch-integrate --verify public/service-worker.js

  # With custom config
  prefetch-integrate --create --output public/sw.js --config '{"maxAge":7200}'

  # Debug mode with custom port
  prefetch-integrate --create --output public/sw.js --debug --debug-port 3200
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const integrator = new PrefetchIntegrator();

  try {
    // 解析参数
    const options = {};
    
    // 检查环境变量
    if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
      options.debug = true;
    }
    if (process.env.PREFETCH_DEV_PORT) {
      options.debugPort = parseInt(process.env.PREFETCH_DEV_PORT, 10);
    }
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--create') {
        options.create = true;
      } else if (arg === '--input') {
        options.input = args[++i];
      } else if (arg === '--output') {
        options.output = args[++i];
      } else if (arg === '--interactive' || arg === '-i') {
        options.interactive = true;
      } else if (arg === '--verify') {
        options.verify = args[++i];
      } else if (arg === '--config') {
        options.config = JSON.parse(args[++i]);
      } else if (arg === '--version') {
        options.version = args[++i];
      } else if (arg === '--debug') {
        options.debug = true;
      } else if (arg === '--debug-port') {
        options.debugPort = parseInt(args[++i], 10);
      }
    }

    // 执行操作
    if (options.interactive) {
      await integrator.interactive();
    } else if (options.verify) {
      integrator.verify({ input: options.verify });
    } else if (options.create) {
      if (!options.output) {
        console.error('Error: --output is required when using --create');
        process.exit(1);
      }
      await integrator.createServiceWorker(options);
    } else if (options.input) {
      if (!options.output) {
        options.output = options.input;
      }
      await integrator.integrateExisting(options);
    } else {
      showHelp();
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// 运行 CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PrefetchIntegrator };

