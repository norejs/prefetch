#!/usr/bin/env node

import express from 'express';
import { watch } from 'chokidar';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

interface DevServerOptions {
  port?: number;
  distDir?: string;
  srcDir?: string;
  cors?: boolean;
  hotReload?: boolean;
}

class ServiceWorkerDevServer {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer | null = null;
  private buildProcess: any = null;
  private options: Required<DevServerOptions>;

  constructor(options: DevServerOptions = {}) {
    this.options = {
      port: options.port || 18003,
      distDir: options.distDir || 'dist',
      srcDir: options.srcDir || 'src',
      cors: options.cors !== false,
      hotReload: options.hotReload !== false
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // CORS 支持
    if (this.options.cors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Service-Worker-Allowed', '/');
        
        // Service Worker 特定头部
        if (req.path.endsWith('.js')) {
          res.header('Content-Type', 'application/javascript');
          res.header('X-Content-Type-Options', 'nosniff');
        }
        
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // 请求日志
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.url}`);
      next();
    });

    // 静态文件服务
    this.app.use(express.static(this.options.distDir, {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
  }

  private setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        distDir: this.options.distDir,
        hotReload: this.options.hotReload
      });
    });

    // 文件列表
    this.app.get('/files', (req, res) => {
      try {
        const files = fs.readdirSync(this.options.distDir)
          .filter(file => file.endsWith('.js'))
          .map(file => ({
            name: file,
            path: `/${file}`,
            size: fs.statSync(path.join(this.options.distDir, file)).size,
            mtime: fs.statSync(path.join(this.options.distDir, file)).mtime
          }));
        
        res.json({ files });
      } catch (error) {
        res.status(500).json({ error: 'Failed to read files' });
      }
    });

    // 构建状态
    this.app.get('/build-status', (req, res) => {
      res.json({
        building: !!this.buildProcess,
        lastBuild: new Date().toISOString()
      });
    });

    // 手动触发构建
    this.app.post('/build', (req, res) => {
      this.triggerBuild();
      res.json({ message: 'Build triggered' });
    });
  }

  private setupHotReload() {
    if (!this.options.hotReload) return;

    // 创建 WebSocket 服务器
    this.wss = new WebSocketServer({ server: this.server });
    
    this.wss.on('connection', (ws) => {
      console.log('🔌 Hot reload client connected');
      
      ws.on('close', () => {
        console.log('🔌 Hot reload client disconnected');
      });
    });

    // 监听源文件变化
    const watcher = watch(this.options.srcDir, {
      ignored: /node_modules/,
      persistent: true
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      this.triggerBuild();
    });

    watcher.on('add', (filePath) => {
      console.log(`➕ File added: ${filePath}`);
      this.triggerBuild();
    });

    watcher.on('unlink', (filePath) => {
      console.log(`🗑️  File removed: ${filePath}`);
      this.triggerBuild();
    });

    console.log(`👀 Watching for changes in: ${this.options.srcDir}`);
  }

  private triggerBuild() {
    if (this.buildProcess) {
      console.log('⏳ Build already in progress...');
      return;
    }

    console.log('🔨 Starting build...');
    
    this.buildProcess = spawn('npm', ['run', 'build:dev'], {
      stdio: 'pipe',
      shell: true
    });

    let buildOutput = '';

    this.buildProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      buildOutput += output;
      process.stdout.write(output);
    });

    this.buildProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      buildOutput += output;
      process.stderr.write(output);
    });

    this.buildProcess.on('close', (code: number) => {
      this.buildProcess = null;
      
      if (code === 0) {
        console.log('✅ Build completed successfully');
        this.notifyClients('build-success', { 
          timestamp: new Date().toISOString(),
          output: buildOutput
        });
      } else {
        console.log(`❌ Build failed with code ${code}`);
        this.notifyClients('build-error', { 
          code,
          timestamp: new Date().toISOString(),
          output: buildOutput
        });
      }
    });

    this.buildProcess.on('error', (error: Error) => {
      this.buildProcess = null;
      console.error('❌ Build process error:', error);
      this.notifyClients('build-error', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  private notifyClients(type: string, data: any) {
    if (!this.wss) return;

    const message = JSON.stringify({ type, data });
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);
      
      this.server.listen(this.options.port, () => {
        console.log('🚀 Service Worker Dev Server started');
        console.log(`📍 Server: http://localhost:${this.options.port}`);
        console.log(`📁 Serving: ${path.resolve(this.options.distDir)}`);
        console.log(`👀 Watching: ${path.resolve(this.options.srcDir)}`);
        console.log('📋 Available endpoints:');
        console.log('  GET  /health          - Health check');
        console.log('  GET  /files           - List built files');
        console.log('  GET  /build-status    - Build status');
        console.log('  POST /build           - Trigger build');
        console.log('  GET  /*.js            - Service Worker files');
        
        if (this.options.hotReload) {
          console.log('🔥 Hot reload enabled');
        }
        
        this.setupHotReload();
        resolve();
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${this.options.port} is already in use`);
          console.log('💡 Try using a different port: --port 18004');
        } else {
          console.error('❌ Server error:', error);
        }
        reject(error);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.buildProcess) {
        this.buildProcess.kill();
      }
      
      if (this.wss) {
        this.wss.close();
      }
      
      if (this.server) {
        this.server.close(() => {
          console.log('👋 Dev server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// CLI 支持
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: DevServerOptions = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        options.port = parseInt(args[++i]);
        break;
      case '--dist':
        options.distDir = args[++i];
        break;
      case '--src':
        options.srcDir = args[++i];
        break;
      case '--no-cors':
        options.cors = false;
        break;
      case '--no-hot-reload':
        options.hotReload = false;
        break;
      case '--help':
        console.log(`
Service Worker Dev Server

Usage: node dev-server.js [options]

Options:
  --port <number>     Server port (default: 18003)
  --dist <path>       Distribution directory (default: dist)
  --src <path>        Source directory (default: src)
  --no-cors          Disable CORS headers
  --no-hot-reload    Disable hot reload
  --help             Show this help message

Examples:
  node dev-server.js
  node dev-server.js --port 8080 --dist build
  node dev-server.js --no-hot-reload
        `);
        process.exit(0);
    }
  }

  const server = new ServiceWorkerDevServer(options);
  
  // 优雅关闭
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  // 启动服务器
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { ServiceWorkerDevServer };
export default ServiceWorkerDevServer;