/**
 * 响应延迟中间件
 * 用于模拟网络延迟
 */

/**
 * 创建延迟中间件
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Object} options - 配置选项
 * @returns {Function} Express 中间件函数
 */
function createDelayMiddleware(delay, options = {}) {
  const {
    randomize = false,
    minDelay = 0,
    maxDelay = delay
  } = options;

  return (req, res, next) => {
    if (delay <= 0) {
      return next();
    }

    let actualDelay = delay;

    // 如果启用随机延迟
    if (randomize) {
      actualDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    }

    setTimeout(next, actualDelay);
  };
}

/**
 * 创建可配置的延迟中间件
 * 允许在运行时动态调整延迟
 */
class ConfigurableDelayMiddleware {
  constructor(initialDelay = 0) {
    this.delay = initialDelay;
    this.enabled = initialDelay > 0;
  }

  /**
   * 设置延迟时间
   * @param {number} delay - 延迟时间（毫秒）
   */
  setDelay(delay) {
    this.delay = delay;
    this.enabled = delay > 0;
  }

  /**
   * 获取中间件函数
   * @returns {Function} Express 中间件函数
   */
  middleware() {
    return (req, res, next) => {
      if (!this.enabled || this.delay <= 0) {
        return next();
      }
      setTimeout(next, this.delay);
    };
  }
}

module.exports = {
  createDelayMiddleware,
  ConfigurableDelayMiddleware
};
