// modules/utils-esm.js - ES Module 工具函数
console.log('Utils ESM: 加载ES Module工具函数');

// 导出工具函数对象
export const moduleUtils = {
    // 获取模块信息
    getInfo() {
        return {
            type: 'esm',
            loadTime: new Date().toISOString(),
            features: ['es-modules', 'import-export', 'tree-shaking', 'static-analysis']
        };
    },
    
    // 格式化数据
    formatData(data) {
        return {
            ...data,
            formatted: true,
            formatTime: new Date().toISOString(),
            formatter: 'esm-utils'
        };
    },
    
    // 生成ID
    generateId(prefix = 'esm') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// 导出日志工具
export const logger = {
    log(message, data) {
        console.log(`[ESM Utils] ${message}`, data || '');
    },
    
    warn(message, data) {
        console.warn(`[ESM Utils] ${message}`, data || '');
    },
    
    error(message, data) {
        console.error(`[ESM Utils] ${message}`, data || '');
    }
};

// 导出验证工具
export const validate = {
    isString(value) {
        return typeof value === 'string';
    },
    
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    },
    
    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    
    isArray(value) {
        return Array.isArray(value);
    },
    
    isFunction(value) {
        return typeof value === 'function';
    },
    
    isPromise(value) {
        return value instanceof Promise;
    }
};

// 导出字符串工具
export const stringUtils = {
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    camelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    },
    
    snakeCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    },
    
    truncate(str, length = 50, suffix = '...') {
        return str.length > length ? str.substring(0, length) + suffix : str;
    }
};

// 导出对象工具
export const objectUtils = {
    deepClone(obj) {
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
    
    merge(target, ...sources) {
        return Object.assign(target, ...sources);
    },
    
    pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    },
    
    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    }
};

// 导出异步工具
export const asyncUtils = {
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    timeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), ms)
            )
        ]);
    },
    
    retry(fn, maxAttempts = 3, delay = 1000) {
        return new Promise(async (resolve, reject) => {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const result = await fn();
                    resolve(result);
                    return;
                } catch (error) {
                    if (attempt === maxAttempts) {
                        reject(error);
                        return;
                    }
                    await this.delay(delay);
                }
            }
        });
    }
};

// 默认导出
export default {
    moduleUtils,
    logger,
    validate,
    stringUtils,
    objectUtils,
    asyncUtils
};

console.log('Utils ESM: ✅ ES Module工具函数加载完成');