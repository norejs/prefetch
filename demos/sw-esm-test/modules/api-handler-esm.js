// modules/api-handler-esm.js - ES Module API处理器
console.log('API Handler ESM: 加载ES Module API处理器');

import { moduleUtils, logger } from './utils-esm.js';

export class ApiHandler {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.requestCount = 0;
        logger.log('API处理器初始化完成');
    }
    
    // 处理请求
    async handleRequest(request) {
        this.requestCount++;
        const url = new URL(request.url);
        const pathname = url.pathname;
        const searchParams = url.searchParams;
        
        logger.log(`处理API请求 #${this.requestCount}: ${pathname}`);
        
        let responseData = {
            swType: 'module',
            timestamp: Date.now(),
            pathname: pathname,
            method: request.method,
            requestId: this.requestCount,
            utils: moduleUtils.getInfo()
        };
        
        try {
            switch (pathname) {
                case '/api/test':
                    responseData = await this.handleTestApi(request, responseData, searchParams);
                    break;
                    
                case '/api/module':
                    responseData = await this.handleModuleApi(request, responseData);
                    break;
                    
                case '/api/importmap':
                    responseData = await this.handleImportMapApi(request, responseData);
                    break;
                    
                default:
                    responseData.message = 'Unknown API endpoint';
                    responseData.error = 'Endpoint not found';
                    responseData.availableEndpoints = ['/api/test', '/api/module', '/api/importmap'];
            }
        } catch (error) {
            logger.error('API处理失败', error);
            responseData.error = error.message;
            responseData.stack = error.stack;
        }
        
        return new Response(JSON.stringify(responseData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'X-SW-Type': 'module',
                'X-Request-ID': this.requestCount.toString()
            }
        });
    }
    
    // 处理测试API
    async handleTestApi(request, responseData, searchParams) {
        responseData.message = 'ES Module Service Worker 基础测试成功';
        responseData.type = searchParams.get('type') || 'unknown';
        responseData.features = {
            esModules: true,
            classes: true,
            asyncAwait: true,
            destructuring: true,
            templateLiterals: true
        };
        
        // 使用工具函数
        responseData.formatted = moduleUtils.formatData({
            test: 'success',
            timestamp: Date.now()
        });
        
        return responseData;
    }
    
    // 处理模块API
    async handleModuleApi(request, responseData) {
        responseData.message = 'ES Module Service Worker 模块功能测试';
        responseData.note = '使用 ES Module import/export';
        
        // 获取缓存信息
        if (this.cacheManager) {
            responseData.cacheInfo = await this.cacheManager.getInfo();
            responseData.cacheStats = await this.cacheManager.getStats();
        }
        
        // 展示ES Module特性
        responseData.moduleFeatures = {
            namedImports: '✅ 支持命名导入',
            defaultImports: '✅ 支持默认导入',
            dynamicImports: '✅ 支持动态导入',
            treeShaking: '✅ 支持树摇优化',
            staticAnalysis: '✅ 支持静态分析'
        };
        
        return responseData;
    }
    
    // 处理Import Map API
    async handleImportMapApi(request, responseData) {
        responseData.message = 'ES Module Service Worker Import Map 测试';
        responseData.note = 'Import Maps 在 Service Worker 中的支持有限';
        
        // 检查Import Map支持
        responseData.importMapSupport = {
            browserSupport: 'HTMLScriptElement.supports' in self && 
                           HTMLScriptElement.supports('importmap'),
            serviceWorkerSupport: '有限支持',
            alternatives: [
                '使用完整URL导入',
                '使用构建工具处理',
                '使用动态导入映射'
            ]
        };
        
        // 演示动态导入映射
        const moduleMap = {
            'utils': './modules/utils-esm.js',
            'cache': './modules/cache-manager-esm.js',
            'api': './modules/api-handler-esm.js'
        };
        
        responseData.dynamicModuleMap = moduleMap;
        responseData.example = {
            description: '动态导入示例',
            code: `
// 传统方式
import { utils } from './modules/utils-esm.js';

// 使用映射
const modulePath = moduleMap['utils'];
const { utils } = await import(modulePath);
            `.trim()
        };
        
        return responseData;
    }
    
    // 获取处理器统计
    getStats() {
        return {
            requestCount: this.requestCount,
            cacheManagerAvailable: !!this.cacheManager,
            startTime: this.startTime || Date.now()
        };
    }
}

console.log('API Handler ESM: ✅ ES Module API处理器加载完成');