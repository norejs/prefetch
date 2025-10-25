// 共享配置模块
const config = {
  // 默认端口配置
  ports: {
    'api-server': 3001,
    'prefetch-worker': 18003,
    'esm-test': 8082
  },
  
  // 默认超时配置
  timeouts: {
    request: 5000,
    response: 10000
  },
  
  // 缓存配置
  cache: {
    maxAge: 300000, // 5分钟
    maxSize: 100
  },
  
  // 日志配置
  logging: {
    level: 'info',
    format: 'combined'
  },

  // 端口分配方法
  async allocatePort(serviceName, defaultPort) {
    const port = this.ports[serviceName] || defaultPort || 3000;
    return port;
  },

  // 获取端口方法
  getPort(serviceName) {
    return this.ports[serviceName];
  }
};

module.exports = config;