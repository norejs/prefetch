// utils.js - 工具函数库
console.log('Utils: 工具函数库加载中...');

// 格式化响应数据
self.formatResponse = function(data) {
    console.log('Utils: 格式化响应数据');
    
    return {
        ...data,
        formatted: true,
        formatTime: new Date().toISOString(),
        version: '1.0.0'
    };
};

// 生成唯一ID
self.generateId = function() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
};

// 日志工具
self.logger = {
    info: function(message, data) {
        console.log(`[Utils Info] ${message}`, data || '');
    },
    
    warn: function(message, data) {
        console.warn(`[Utils Warn] ${message}`, data || '');
    },
    
    error: function(message, data) {
        console.error(`[Utils Error] ${message}`, data || '');
    }
};

// 简单的数据验证
self.validate = {
    isString: function(value) {
        return typeof value === 'string';
    },
    
    isNumber: function(value) {
        return typeof value === 'number' && !isNaN(value);
    },
    
    isObject: function(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
};

console.log('Utils: ✓ 工具函数库加载完成');