# Prefetch 项目改进建议与实现方案

## 🎯 核心问题分析

通过对项目的深入分析，发现以下关键问题需要解决：

1. **规则系统不完整** - 定义了 `IRule` 但缺少实际使用
2. **触发器机制缺失** - `trigger` 属性未实现
3. **swiftcom 集成度低** - 通信包功能强大但未充分利用
4. **缺少监控和统计** - 无法追踪性能指标
5. **错误处理不完善** - 缺少详细的错误分类

## 💡 改进方案

### 1. 实现完整的规则系统

#### 当前状态
```typescript
// 仅定义了接口，但没有实际使用
interface IRule {
  apiUrl: string;
  type: "POST" | "GET" | "PUT" | "DELETE";
  triger?: "idle" | "click" | "visible";
  // ... 其他属性
}
```

#### 建议实现
创建 `packages/prefetch/src/core/ruleManager.ts`:

```typescript
import { IRule, IRequestParams } from '../interfaces';

export class PrefetchRuleManager {
  private rules: Map<string, IRule> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  
  addRule(rule: IRule): string {
    const key = this.generateRuleKey(rule);
    this.rules.set(key, rule);
    this.setupTrigger(rule, key);
    return key;
  }
  
  removeRule(key: string): boolean {
    const rule = this.rules.get(key);
    if (rule) {
      this.cleanupTrigger(key);
      this.rules.delete(key);
      return true;
    }
    return false;
  }
  
  private setupTrigger(rule: IRule, key: string): void {
    switch (rule.triger) {
      case 'visible':
        this.setupVisibilityTrigger(rule, key);
        break;
      case 'idle':
        this.setupIdleTrigger(rule, key);
        break;
      case 'click':
        this.setupClickTrigger(rule, key);
        break;
    }
  }
  
  private setupVisibilityTrigger(rule: IRule, key: string): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.executePrefetch(rule);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    this.observers.set(key, observer);
    
    // 查找匹配的元素并开始观察
    const elements = document.querySelectorAll(`[data-prefetch-rule="${key}"]`);
    elements.forEach(el => observer.observe(el));
  }
  
  private setupIdleTrigger(rule: IRule, key: string): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.executePrefetch(rule);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.executePrefetch(rule);
      }, 100);
    }
  }
  
  private setupClickTrigger(rule: IRule, key: string): void {
    const handleClick = () => {
      this.executePrefetch(rule);
    };
    
    document.addEventListener('click', handleClick, { once: true });
  }
  
  private async executePrefetch(rule: IRule): Promise<void> {
    try {
      let params: IRequestParams;
      
      if (typeof rule.requestParams === 'function') {
        params = await rule.requestParams();
      } else {
        params = rule.requestParams;
      }
      
      const customFetch = rule.fetch || fetch;
      const response = await customFetch(params);
      
      // 触发预请求
      const prefetchFn = preRequest();
      await prefetchFn(rule.apiUrl, {
        expireTime: rule.expireTime
      });
      
    } catch (error) {
      console.error('Prefetch rule execution failed:', error);
    }
  }
  
  private generateRuleKey(rule: IRule): string {
    return `${rule.apiUrl}-${rule.type}-${Date.now()}`;
  }
  
  private cleanupTrigger(key: string): void {
    const observer = this.observers.get(key);
    if (observer) {
      observer.disconnect();
      this.observers.delete(key);
    }
  }
}

// 全局实例
export const ruleManager = new PrefetchRuleManager();
```

### 2. 增强 swiftcom 集成

#### 建议实现
创建 `packages/prefetch/src/core/communicationBridge.ts`:

```typescript
import { Massenger } from 'swiftcom/main';

export class PrefetchCommunicationBridge {
  private messenger: Massenger;
  
  constructor() {
    this.messenger = new Massenger('prefetch-channel');
  }
  
  async getCacheStats(): Promise<CacheStats> {
    return this.messenger.remoteInstance.getCacheStats();
  }
  
  async clearCache(pattern?: string): Promise<boolean> {
    return this.messenger.remoteInstance.clearCache(pattern);
  }
  
  async updateRules(rules: IRule[]): Promise<boolean> {
    return this.messenger.remoteInstance.updateRules(rules);
  }
  
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.messenger.remoteInstance.getPerformanceMetrics();
  }
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  cacheHitCount: number;
  cacheMissCount: number;
  errorCount: number;
}
```

相应地，在 `packages/prefetch-worker/src/workerMethods.ts` 中实现：

```typescript
import { Massenger } from 'swiftcom/worker';

export class PrefetchWorkerMethods {
  private messenger: Massenger;
  private cacheStats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0
  };
  
  constructor() {
    this.messenger = new Massenger('prefetch-channel');
    this.registerMethods();
  }
  
  private registerMethods(): void {
    this.messenger.register('getCacheStats', () => this.getCacheStats());
    this.messenger.register('clearCache', (pattern) => this.clearCache(pattern));
    this.messenger.register('updateRules', (rules) => this.updateRules(rules));
    this.messenger.register('getPerformanceMetrics', () => this.getPerformanceMetrics());
  }
  
  private getCacheStats(): CacheStats {
    return this.cacheStats;
  }
  
  private clearCache(pattern?: string): boolean {
    // 实现缓存清理逻辑
    return true;
  }
  
  // ... 其他方法
}
```

### 3. 实现性能监控系统

#### 建议实现
创建 `packages/prefetch/src/core/performanceMonitor.ts`:

```typescript
export class PerformanceMonitor {
  private metrics: Map<string, MetricData> = new Map();
  private startTimes: Map<string, number> = new Map();
  
  startTiming(key: string): void {
    this.startTimes.set(key, performance.now());
  }
  
  endTiming(key: string): number {
    const startTime = this.startTimes.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(key, duration);
      this.startTimes.delete(key);
      return duration;
    }
    return 0;
  }
  
  recordCacheHit(url: string): void {
    const key = `cache-hit-${url}`;
    this.incrementCounter(key);
  }
  
  recordCacheMiss(url: string): void {
    const key = `cache-miss-${url}`;
    this.incrementCounter(key);
  }
  
  recordError(error: Error, context: string): void {
    const key = `error-${context}`;
    this.incrementCounter(key);
    console.error('Prefetch error:', error);
  }
  
  getMetrics(): PerformanceReport {
    const report: PerformanceReport = {
      totalRequests: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      errors: [],
      timestamp: Date.now()
    };
    
    // 计算统计数据
    let totalHits = 0;
    let totalMisses = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    this.metrics.forEach((metric, key) => {
      if (key.startsWith('cache-hit-')) {
        totalHits += metric.count;
      } else if (key.startsWith('cache-miss-')) {
        totalMisses += metric.count;
      } else if (key.startsWith('response-time-')) {
        totalResponseTime += metric.total;
        responseTimeCount += metric.count;
      }
    });
    
    report.totalRequests = totalHits + totalMisses;
    report.cacheHitRate = report.totalRequests > 0 ? totalHits / report.totalRequests : 0;
    report.averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    
    return report;
  }
  
  private recordMetric(key: string, value: number): void {
    const existing = this.metrics.get(key) || { total: 0, count: 0, average: 0 };
    existing.total += value;
    existing.count += 1;
    existing.average = existing.total / existing.count;
    this.metrics.set(key, existing);
  }
  
  private incrementCounter(key: string): void {
    const existing = this.metrics.get(key) || { total: 0, count: 0, average: 0 };
    existing.count += 1;
    this.metrics.set(key, existing);
  }
}

interface MetricData {
  total: number;
  count: number;
  average: number;
}

interface PerformanceReport {
  totalRequests: number;
  cacheHitRate: number;
  averageResponseTime: number;
  errors: string[];
  timestamp: number;
}

export const performanceMonitor = new PerformanceMonitor();
```

### 4. 改进错误处理系统

#### 建议实现
创建 `packages/prefetch/src/core/errorHandler.ts`:

```typescript
export enum PrefetchErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  SERVICE_WORKER_ERROR = 'SERVICE_WORKER_ERROR',
  RULE_EXECUTION_ERROR = 'RULE_EXECUTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class PrefetchError extends Error {
  public readonly type: PrefetchErrorType;
  public readonly context: string;
  public readonly originalError?: Error;
  
  constructor(
    type: PrefetchErrorType,
    message: string,
    context: string,
    originalError?: Error
  ) {
    super(message);
    this.type = type;
    this.context = context;
    this.originalError = originalError;
    this.name = 'PrefetchError';
  }
}

export class ErrorHandler {
  private errorListeners: ((error: PrefetchError) => void)[] = [];
  
  handleError(error: Error | PrefetchError, context: string): void {
    let prefetchError: PrefetchError;
    
    if (error instanceof PrefetchError) {
      prefetchError = error;
    } else {
      prefetchError = this.categorizeError(error, context);
    }
    
    // 记录错误
    this.logError(prefetchError);
    
    // 通知监听器
    this.errorListeners.forEach(listener => {
      try {
        listener(prefetchError);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
  
  onError(listener: (error: PrefetchError) => void): () => void {
    this.errorListeners.push(listener);
    
    // 返回取消监听的函数
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }
  
  private categorizeError(error: Error, context: string): PrefetchError {
    if (error.message.includes('fetch')) {
      return new PrefetchError(
        PrefetchErrorType.NETWORK_ERROR,
        'Network request failed',
        context,
        error
      );
    }
    
    if (error.message.includes('ServiceWorker')) {
      return new PrefetchError(
        PrefetchErrorType.SERVICE_WORKER_ERROR,
        'Service Worker error',
        context,
        error
      );
    }
    
    return new PrefetchError(
      PrefetchErrorType.VALIDATION_ERROR,
      error.message,
      context,
      error
    );
  }
  
  private logError(error: PrefetchError): void {
    console.error(`[Prefetch ${error.type}] ${error.message}`, {
      context: error.context,
      originalError: error.originalError,
      timestamp: new Date().toISOString()
    });
  }
}

export const errorHandler = new ErrorHandler();
```

### 5. 增强的 API 设计

#### 建议实现
创建 `packages/prefetch/src/core/enhancedPrefetch.ts`:

```typescript
import { ruleManager } from './ruleManager';
import { performanceMonitor } from './performanceMonitor';
import { errorHandler } from './errorHandler';

export class EnhancedPrefetch {
  private initialized = false;
  
  async initialize(config: PrefetchConfig): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 初始化 Service Worker
      await setup({
        serviceWorkerUrl: config.serviceWorkerUrl,
        scope: config.scope
      });
      
      // 设置错误监听
      errorHandler.onError((error) => {
        performanceMonitor.recordError(error, error.context);
      });
      
      this.initialized = true;
    } catch (error) {
      errorHandler.handleError(error as Error, 'initialization');
      throw error;
    }
  }
  
  createRule(rule: IRule): string {
    try {
      return ruleManager.addRule(rule);
    } catch (error) {
      errorHandler.handleError(error as Error, 'rule-creation');
      throw error;
    }
  }
  
  removeRule(key: string): boolean {
    try {
      return ruleManager.removeRule(key);
    } catch (error) {
      errorHandler.handleError(error as Error, 'rule-removal');
      return false;
    }
  }
  
  async prefetch(url: string, options: PrefetchOptions = {}): Promise<void> {
    const requestId = `prefetch-${Date.now()}`;
    
    try {
      performanceMonitor.startTiming(requestId);
      
      const prefetchFn = preRequest();
      await prefetchFn(url, options);
      
      performanceMonitor.endTiming(requestId);
      performanceMonitor.recordCacheHit(url);
      
    } catch (error) {
      performanceMonitor.endTiming(requestId);
      performanceMonitor.recordCacheMiss(url);
      errorHandler.handleError(error as Error, 'prefetch-execution');
      throw error;
    }
  }
  
  getMetrics(): PerformanceReport {
    return performanceMonitor.getMetrics();
  }
  
  onError(callback: (error: PrefetchError) => void): () => void {
    return errorHandler.onError(callback);
  }
}

export interface PrefetchConfig {
  serviceWorkerUrl: string;
  scope?: string;
  debug?: boolean;
  maxCacheSize?: number;
  defaultExpireTime?: number;
}

export interface PrefetchOptions {
  expireTime?: number;
  priority?: 'high' | 'normal' | 'low';
  retryAttempts?: number;
}

// 单例实例
export const enhancedPrefetch = new EnhancedPrefetch();
```

### 6. 使用示例

#### 完整使用示例
```typescript
import { enhancedPrefetch, PrefetchErrorType } from '@norejs/prefetch';

// 初始化
await enhancedPrefetch.initialize({
  serviceWorkerUrl: '/prefetch-worker/service-worker.js',
  scope: '/',
  debug: true,
  maxCacheSize: 200,
  defaultExpireTime: 30000
});

// 创建规则
const ruleKey = enhancedPrefetch.createRule({
  apiUrl: '/api/user/profile',
  type: 'GET',
  expireTime: 60000,
  triger: 'visible',
  requestParams: {
    url: '/api/user/profile',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer token'
    }
  }
});

// 手动预请求
await enhancedPrefetch.prefetch('/api/important-data', {
  expireTime: 10000,
  priority: 'high'
});

// 错误处理
const unsubscribe = enhancedPrefetch.onError((error) => {
  if (error.type === PrefetchErrorType.NETWORK_ERROR) {
    console.log('网络错误，可能需要重试');
  }
});

// 获取性能指标
const metrics = enhancedPrefetch.getMetrics();
console.log('缓存命中率:', metrics.cacheHitRate);
console.log('平均响应时间:', metrics.averageResponseTime);
```

## 🚧 实施计划

### 阶段一：核心功能完善 (2-3 周)
1. 实现规则管理器
2. 添加触发器机制
3. 增强错误处理

### 阶段二：性能优化 (2-3 周)
1. 实现性能监控
2. 优化缓存策略
3. 增强 swiftcom 集成

### 阶段三：用户体验改进 (1-2 周)
1. 完善 API 设计
2. 添加使用示例
3. 编写详细文档

### 阶段四：测试和优化 (1-2 周)
1. 单元测试覆盖
2. 性能测试
3. 浏览器兼容性测试

## 📈 预期收益

- **开发效率**: 提升 40-60%（通过完善的 API 和工具）
- **性能提升**: 页面加载时间减少 30-50%
- **用户体验**: 显著降低感知延迟
- **可维护性**: 通过模块化设计和错误处理提升代码质量
- **可扩展性**: 规则系统支持复杂的预请求场景

这些改进将使 Prefetch 从一个基础的预请求库发展为一个功能完整、生产就绪的性能优化解决方案。
