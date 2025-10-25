// modules/utils-classic.js - 传统模式工具函数
console.log('Utils Classic: 加载传统工具函数模块');

// 在全局作用域定义工具函数
self.classicUtils = {
    // 获取模块信息
    getInfo: function() {
        return {
            type: 'classic',
            loadTime: new Date().toISOString(),
            features: ['importScripts', 'global-scope', 'synchronous-loading']
        };
    },
    
    // 格式化数据
    formatData: function(data) {
        return {
            ...data,
            formatted: true,
            formatTime: new Date().toISOString(),
            formatter: 'classic-utils'
        };
    },
    
    // 生成ID
    generateId: function(prefix = 'classic') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // 日志工具
    logger: {
        log: function(message, data) {
            console.log(`[Classic Utils] ${message}`, data || '');
        },
        
        warn: function(message, data) {
            console.warn(`[Classic Utils] ${message}`, data || '');
        },
        
        error: function(message, data) {
            console.error(`[Classic Utils] ${message}`, data || '');
        }
    },
    
    // 数据验证
    validate: {
        isString: function(value) {
            return typeof value === 'string';
        },
        
        isNumber: function(value) {
            return typeof value === 'number' && !isNaN(value);
        },
        
        isObject: function(value) {
            return value !== null && typeof value === 'object' && !Array.isArray(value);
        },
        
        isArray: function(value) {
            return Array.isArray(value);
        }
    },
    
    // 字符串工具
    string: {
        capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        
        camelCase: function(str) {
            return str.replace(/-([a-z])/g, function(g) {
                return g[1].toUpperCase();
            });
        },
        
        kebabCase: function(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        }
    },
    
    // 对象工具
    object: {
        deepClone: function(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        },
        
        merge: function(target, ...sources) {
            sources.forEach(source => {
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            });
            return target;
        }
    }
};

console.log('Utils Classic: ✅ 传统工具函数模块加载完成');