// sw-module.js - 简化的 ES Module Service Worker
console.log('Module SW: 开始加载ES Module Service Worker');

// 在顶部导入 fetch 拦截器模块并执行 main 方法
import { main as initFetchInterceptor, testInterceptor, getInterceptorStatus } from './modules/fetch-interceptor.js';

// 异步执行 main 方法来初始化 fetch 拦截器
console.log('Module SW: 🔄 开始异步初始化 Fetch 拦截器...');
const interceptorConfigPromise = initFetchInterceptor();

// 处理异步初始化结果
interceptorConfigPromise.then(config => {
  console.log('Module SW: ✅ Fetch 拦截器异步初始化完成:', config);
}).catch(error => {
  console.error('Module SW: ❌ Fetch 拦截器异步初始化失败:', error);
});

// 导入 prefetch-worker ES 模块 (CDN方式)
import { initializePrefetchWorker, setupLifecycle } from 'http://localhost:18003/prefetch-worker.esm.js';

console.log('Module SW: ✅ prefetch-worker ES Module 导入成功');

// 初始化 prefetch-worker (不传入配置，等待主进程配置)
initializePrefetchWorker();
setupLifecycle();

console.log('Module SW: ✅ prefetch-worker 初始化完成，等待主进程配置');

// ===== 测试案例：演示不同方式添加 fetch 监听器 =====

// 测试1：正确的方式 - 在脚本初始化时添加 fetch 监听器
const correctFetchHandler = (event) => {
  console.log('✅ 正确的 fetch 处理器被调用:', event.request.url);
};

// 这是正确的 - 在脚本加载时立即添加
self.addEventListener('fetch', correctFetchHandler);
console.log('✅ 正确：在脚本初始化时添加了 fetch 监听器');

// 测试变量
let dynamicFetchHandler = null;

// 消息处理器
const messageHandler = async (event) => {
  console.log('收到消息:', event.data);

  // 测试1：直接在消息处理器中添加 fetch 监听器
  if (event.data && event.data.type === 'ADD_DYNAMIC_FETCH_HANDLER') {
    console.log('⚠️ 方法1：直接在消息处理器中添加 fetch 监听器...');

    dynamicFetchHandler = (fetchEvent) => {
      console.log('❌ 直接添加的 fetch 处理器被调用:', fetchEvent.request.url);
    };

    // 这会触发浏览器警告
    self.addEventListener('fetch', dynamicFetchHandler);
    console.log('❌ 方法1：fetch 监听器已添加（会被浏览器忽略）');

    event.source.postMessage({
      type: 'DYNAMIC_FETCH_HANDLER_ADDED',
      method: 'direct',
      warning: 'fetch 监听器在非初始化阶段添加，可能被浏览器忽略'
    });
  }

  // 测试2：通过 ESM 动态导入模块来添加 fetch 监听器
  if (event.data && event.data.type === 'ADD_DYNAMIC_FETCH_VIA_ESM') {
    console.log('🧪 方法2：通过 ESM 动态导入模块来添加 fetch 监听器...');

    try {
      // 动态导入模块
      console.log('📦 开始动态导入模块...');
      const { addDynamicFetchListener, testDynamicModule } = await import('./modules/dynamic-fetch-module.js');

      console.log('✅ 动态模块导入成功');

      // 测试模块功能
      const testResult = testDynamicModule();
      console.log('🧪 模块测试结果:', testResult);

      // 在动态导入的模块中添加 fetch 监听器
      const result = addDynamicFetchListener();

      event.source.postMessage({
        type: 'DYNAMIC_FETCH_HANDLER_ADDED',
        method: 'esm-import',
        moduleTest: testResult,
        result: result,
        warning: '通过 ESM 动态导入的模块中添加 fetch 监听器，同样会触发浏览器警告'
      });

    } catch (error) {
      console.error('❌ 动态导入模块失败:', error);
      event.source.postMessage({
        type: 'DYNAMIC_FETCH_ERROR',
        method: 'esm-import',
        error: error.message
      });
    }
  }

  // 测试 fetch 处理器状态
  if (event.data && event.data.type === 'TEST_FETCH_HANDLERS') {
    console.log('🧪 测试 fetch 处理器状态...');

    // 获取拦截器状态
    const interceptorStatus = getInterceptorStatus();

    event.source.postMessage({
      type: 'FETCH_HANDLERS_STATUS',
      correctHandlerActive: true,
      dynamicHandlerActive: !!dynamicFetchHandler,
      interceptorActive: interceptorStatus.active,
      interceptorConfig: interceptorStatus,
      message: '检查控制台是否有 fetch 事件监听器警告'
    });
  }

  // 测试拦截器功能
  if (event.data && event.data.type === 'TEST_INTERCEPTOR') {
    console.log('🧪 测试 Fetch 拦截器...');

    try {
      const testResult = testInterceptor();
      const status = getInterceptorStatus();

      event.source.postMessage({
        type: 'INTERCEPTOR_TEST_RESULT',
        testResult: testResult,
        status: status,
        message: '拦截器测试完成，可以访问 /api/interceptor/test 来验证'
      });

    } catch (error) {
      console.error('❌ 拦截器测试失败:', error);
      event.source.postMessage({
        type: 'INTERCEPTOR_TEST_ERROR',
        error: error.message
      });
    }
  }

  // 测试异步初始化状态
  if (event.data && event.data.type === 'TEST_ASYNC_INIT') {
    console.log('🧪 测试异步初始化状态...');

    try {
      // 等待异步初始化完成
      const config = await interceptorConfigPromise;

      event.source.postMessage({
        type: 'ASYNC_INIT_TEST_RESULT',
        config: config,
        message: '异步初始化测试完成'
      });

    } catch (error) {
      console.error('❌ 异步初始化测试失败:', error);
      event.source.postMessage({
        type: 'ASYNC_INIT_TEST_ERROR',
        error: error.message
      });
    }
  }
};

self.addEventListener('message', messageHandler);

console.log('Module SW: ✅ ES Module Service Worker 加载完成');
console.log('Module SW: 🧪 测试案例已准备就绪');
console.log('Module SW: 🎯 Fetch 拦截器已在模块导入时激活');
console.log('Module SW: 💡 可以测试不同方式添加 fetch 监听器的效果');