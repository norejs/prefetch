/**
 * 请求日志中间件
 * 记录所有进入的 HTTP 请求
 */

/**
 * 创建日志中间件
 * @param {Array} requestLogs - 存储日志的数组引用
 * @param {Object} options - 配置选项
 * @returns {Function} Express 中间件函数
 */
function createLoggerMiddleware(requestLogs, options = {}) {
  const {
    maxLogs = 1000,
    verbose = false
  } = options;

  return (req, res, next) => {
    const startTime = Date.now();

    // 记录请求信息
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress
    };

    // 捕获响应信息
    const originalSend = res.send;
    res.send = function(data) {
      logEntry.statusCode = res.statusCode;
      logEntry.duration = Date.now() - startTime;
      logEntry.responseSize = data ? data.length : 0;
      
      originalSend.apply(res, arguments);
    };

    // 添加到日志数组
    requestLogs.push(logEntry);

    // 限制日志数量，避免内存溢出
    if (requestLogs.length > maxLogs) {
      requestLogs.shift();
    }

    // 控制台输出（如果启用详细模式）
    if (verbose) {
      console.log(`[${logEntry.timestamp}] ${req.method} ${req.url}`);
    }

    next();
  };
}

module.exports = createLoggerMiddleware;
