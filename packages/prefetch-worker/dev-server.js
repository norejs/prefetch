#!/usr/bin/env node

/**
 * Prefetch Worker 本地开发服务器
 * 用于在开发和调试时提供 UMD 格式的 Prefetch Worker 文件
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PREFETCH_DEV_PORT || 3100;

// 启用 CORS，允许跨域访问
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 提供 UMD 文件
app.get('/prefetch-worker.umd.js', (req, res) => {
  const umdPath = path.join(__dirname, 'dist/static/js/prefetch-worker.umd.js');
  
  if (!fs.existsSync(umdPath)) {
    console.error('❌ UMD file not found. Please run: npm run build');
    return res.status(404).json({
      error: 'UMD file not found',
      message: 'Please run "npm run build" first',
      path: umdPath
    });
  }
  
  res.type('application/javascript');
  res.sendFile(umdPath);
});

// 提供类型定义文件（可选）
app.get('/prefetch-worker.d.ts', (req, res) => {
  const dtsPath = path.join(__dirname, 'dist/types/setup.d.ts');
  
  if (!fs.existsSync(dtsPath)) {
    return res.status(404).json({
      error: 'Type definition file not found'
    });
  }
  
  res.type('text/plain');
  res.sendFile(dtsPath);
});

// 健康检查端点
app.get('/health', (req, res) => {
  const umdPath = path.join(__dirname, 'dist/static/js/prefetch-worker.umd.js');
  const umdExists = fs.existsSync(umdPath);
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    files: {
      umd: {
        exists: umdExists,
        path: umdPath,
        size: umdExists ? fs.statSync(umdPath).size : 0
      }
    }
  });
});

// 根路径 - 显示使用说明
app.get('/', (req, res) => {
  const umdPath = path.join(__dirname, 'dist/static/js/prefetch-worker.umd.js');
  const umdExists = fs.existsSync(umdPath);
  
  res.type('text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prefetch Worker Dev Server</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1 { color: #333; }
        .status {
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .status.ok {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .status.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Courier New', monospace;
        }
        pre {
          background: #f4f4f4;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        .endpoint {
          margin: 10px 0;
        }
        .endpoint a {
          color: #0066cc;
          text-decoration: none;
        }
        .endpoint a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>🚀 Prefetch Worker Dev Server</h1>
      
      <div class="status ${umdExists ? 'ok' : 'error'}">
        <strong>Status:</strong> ${umdExists ? '✅ Ready' : '❌ UMD file not found'}
        ${!umdExists ? '<br><br>Please run: <code>npm run build:umd</code>' : ''}
      </div>
      
      <h2>📡 Available Endpoints</h2>
      
      <div class="endpoint">
        <strong>UMD File:</strong><br>
        <a href="/prefetch-worker.umd.js" target="_blank">
          http://localhost:${PORT}/prefetch-worker.umd.js
        </a>
      </div>
      
      <div class="endpoint">
        <strong>Health Check:</strong><br>
        <a href="/health" target="_blank">
          http://localhost:${PORT}/health
        </a>
      </div>
      
      <h2>💡 Usage in Service Worker</h2>
      
      <pre><code>// In your Service Worker
importScripts('http://localhost:${PORT}/prefetch-worker.umd.js');

// Initialize Prefetch Worker
const setupWorker = self.PrefetchWorker;
const prefetchHandler = setupWorker({
  maxAge: 3600,
  maxCacheSize: 50
});

// Use in fetch handler
self.addEventListener('fetch', (event) => {
  if (prefetchHandler) {
    const response = prefetchHandler(event);
    if (response) {
      event.respondWith(response);
    }
  }
});</code></pre>

      <h2>🔧 CLI Integration</h2>
      
      <pre><code># Create Service Worker with local dev server
prefetch-integrate --create \\
  --output public/service-worker.js \\
  --debug

# Or set environment variable
DEBUG=true prefetch-integrate --create \\
  --output public/service-worker.js</code></pre>

      <h2>📝 Environment Variables</h2>
      
      <ul>
        <li><code>PREFETCH_DEV_PORT</code> - Server port (default: 3100)</li>
        <li><code>DEBUG</code> - Enable debug mode in CLI</li>
      </ul>
      
      <p style="margin-top: 40px; color: #666; font-size: 14px;">
        Server running on port ${PORT} | 
        <a href="https://github.com/yourusername/prefetch">Documentation</a>
      </p>
    </body>
    </html>
  `);
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.url,
    availableEndpoints: [
      '/',
      '/prefetch-worker.umd.js',
      '/health'
    ]
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Prefetch Worker Dev Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`📦 UMD File: http://localhost:${PORT}/prefetch-worker.umd.js`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  // 检查 UMD 文件是否存在
  const umdPath = path.join(__dirname, 'dist/static/js/prefetch-worker.umd.js');
  if (!fs.existsSync(umdPath)) {
    console.log('⚠️  Warning: UMD file not found!');
    console.log('   Please run: npm run build');
    console.log('');
  } else {
    const stats = fs.statSync(umdPath);
    console.log(`✅ UMD file ready (${(stats.size / 1024).toFixed(2)} KB)`);
    console.log('');
  }
  
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

