// modules/dynamic-feature.js - 动态导入功能演示
console.log('Dynamic Feature: 加载动态功能模块');

// 动态功能处理函数
export function dynamicFeature(input) {
    console.log('Dynamic Feature: 处理输入', input);
    
    return {
        processed: true,
        input: input,
        output: `动态处理结果: ${input}`,
        timestamp: new Date().toISOString(),
        features: {
            dynamicImport: '✅ 动态导入成功',
            topLevelAwait: '✅ 顶级await支持',
            moduleScope: '✅ 模块作用域隔离'
        },
        processingSteps: [
            '1. 接收输入数据',
            '2. 验证数据格式',
            '3. 应用处理逻辑',
            '4. 生成输出结果',
            '5. 返回处理结果'
        ]
    };
}

// 异步动态功能
export async function asyncDynamicFeature(input) {
    console.log('Dynamic Feature: 异步处理输入', input);
    
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
        processed: true,
        async: true,
        input: input,
        output: `异步动态处理结果: ${input}`,
        timestamp: new Date().toISOString(),
        delay: 100,
        features: {
            asyncProcessing: '✅ 异步处理',
            promiseSupport: '✅ Promise支持',
            errorHandling: '✅ 错误处理'
        }
    };
}

// 复杂数据处理
export class DataProcessor {
    constructor(options = {}) {
        this.options = {
            enableLogging: true,
            maxRetries: 3,
            timeout: 5000,
            ...options
        };
        
        this.processedCount = 0;
        this.errors = [];
        
        if (this.options.enableLogging) {
            console.log('Dynamic Feature: DataProcessor 初始化', this.options);
        }
    }
    
    async process(data) {
        this.processedCount++;
        
        try {
            // 数据验证
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // 处理逻辑
            const result = {
                id: this.processedCount,
                originalData: data,
                processedData: this.transformData(data),
                metadata: {
                    processedAt: new Date().toISOString(),
                    processorVersion: '1.0.0',
                    options: this.options
                }
            };
            
            if (this.options.enableLogging) {
                console.log('Dynamic Feature: 数据处理完成', result.id);
            }
            
            return result;
            
        } catch (error) {
            this.errors.push({
                error: error.message,
                data: data,
                timestamp: new Date().toISOString()
            });
            
            console.error('Dynamic Feature: 数据处理失败', error);
            throw error;
        }
    }
    
    transformData(data) {
        // 简单的数据转换逻辑
        const transformed = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                transformed[key] = value.toUpperCase();
            } else if (typeof value === 'number') {
                transformed[key] = value * 2;
            } else if (Array.isArray(value)) {
                transformed[key] = value.map(item => 
                    typeof item === 'string' ? item.toUpperCase() : item
                );
            } else {
                transformed[key] = value;
            }
        }
        
        return transformed;
    }
    
    getStats() {
        return {
            processedCount: this.processedCount,
            errorCount: this.errors.length,
            successRate: this.processedCount > 0 ? 
                ((this.processedCount - this.errors.length) / this.processedCount * 100).toFixed(2) + '%' : 
                '0%',
            options: this.options
        };
    }
    
    getErrors() {
        return this.errors;
    }
}

// 工具函数
export const dynamicUtils = {
    // 生成随机数据
    generateRandomData() {
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: `Item ${Math.floor(Math.random() * 1000)}`,
            value: Math.floor(Math.random() * 100),
            tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1),
            timestamp: Date.now()
        };
    },
    
    // 验证数据
    validateData(data) {
        const errors = [];
        
        if (!data.id) errors.push('Missing id field');
        if (!data.name) errors.push('Missing name field');
        if (typeof data.value !== 'number') errors.push('Invalid value field');
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // 格式化输出
    formatOutput(data) {
        return {
            formatted: true,
            data: data,
            formattedAt: new Date().toISOString(),
            size: JSON.stringify(data).length
        };
    }
};

// 默认导出
export default {
    dynamicFeature,
    asyncDynamicFeature,
    DataProcessor,
    dynamicUtils
};

console.log('Dynamic Feature: ✅ 动态功能模块加载完成');