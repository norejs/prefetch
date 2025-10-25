const express = require('express');
const cors = require('cors');
const config = require('../test-config');
const createLoggerMiddleware = require('./middleware/logger');
const { ConfigurableDelayMiddleware } = require('./middleware/delay');

class APIServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.requestLogs = [];
    this.port = config.apiServer.port;
    this.host = config.apiServer.host;
    this.delayMiddleware = new ConfigurableDelayMiddleware(config.apiServer.responseDelay);
    
    this._setupMiddleware();
    this._setupRoutes();
  }

  /**
   * 配置基础中间件
   * @private
   */
  _setupMiddleware() {
    // CORS 中间件
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Test-Source', 'X-Prefetch-Request-Type', 'X-Prefetch-Expire-Time'],
      credentials: false
    }));

    // Body parser 中间件
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 请求日志中间件
    this.app.use(createLoggerMiddleware(this.requestLogs, {
      maxLogs: 1000,
      verbose: config.reporting?.verbose || false
    }));

    // 响应延迟中间件（模拟网络延迟）
    this.app.use(this.delayMiddleware.middleware());
  }

  /**
   * 配置路由
   * @private
   */
  _setupRoutes() {
    // 导入路由模块
    const productsRouter = require('./routes/products');
    const usersRouter = require('./routes/users');

    // 注册路由
    this.app.use('/api/products', productsRouter);
    this.app.use('/api/users', usersRouter);

    // 健康检查路由
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // 获取请求日志的路由（用于调试）
    this.app.get('/api/logs', (req, res) => {
      res.json({
        total: this.requestLogs.length,
        logs: this.requestLogs
      });
    });

    // 404 处理
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
      });
    });

    // 错误处理中间件
    this.app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    });
  }

  /**
   * 启动 API 服务器
   * @param {number} port - 端口号（可选）
   * @returns {Promise<void>}
   */
  async start(port) {
    if (this.server) {
      throw new Error('Server is already running');
    }

    // 直接使用指定端口
    const serverPort = port || this.port;
    this.port = serverPort;

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(serverPort, this.host, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`API Server running at http://${this.host}:${serverPort}`);
          resolve();
        }
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${serverPort} is already in use`));
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * 停止 API 服务器
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.server) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('API Server stopped');
          this.server = null;
          resolve();
        }
      });
    });
  }

  /**
   * 获取请求日志
   * @returns {Array<Object>} 请求日志数组
   */
  getRequestLogs() {
    return [...this.requestLogs];
  }

  /**
   * 清除请求日志
   */
  clearRequestLogs() {
    this.requestLogs = [];
  }

  /**
   * 设置响应延迟
   * @param {number} delay - 延迟时间（毫秒）
   */
  setResponseDelay(delay) {
    this.delayMiddleware.setDelay(delay);
  }

  /**
   * 获取服务器统计信息
   * @returns {Object} 服务器统计信息
   */
  getStats() {
    return {
      isRunning: this.server !== null,
      port: this.port,
      host: this.host,
      totalRequests: this.requestLogs.length,
      uptime: this.server ? process.uptime() : 0
    };
  }
}

// 导出单例实例
module.exports = new APIServer();

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  const server = module.exports;
  server.start()
    .then(() => {
      console.log('Server started successfully');
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });

  // 优雅关闭
  process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await server.stop();
    process.exit(0);
  });
}
