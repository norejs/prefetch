// fetch-interceptor.js - 在 main 函数中劫持 fetch 事件

console.log('Fetch Interceptor Module: 开始加载');

// fetch 处理器函数
const interceptorFetchHandler = (event) => {
  const url = new URL(event.request.url);
  console.log('🎯 Fetch Interceptor: 拦截到请求:', url.pathname);

  // 只处理特定的请求
  if (url.pathname.startsWith('/api/interceptor/')) {
    console.log('🔄 Fetch Interceptor: 处理拦截请求');

    event.respondWith(
      new Response(JSON.stringify({
        message: '来自 Fetch Interceptor 模块的响应',
        url: event.request.url,
        method: event.request.method,
        timestamp: Date.now(),
        interceptedBy: 'fetch-interceptor-module',
        addedBy: 'async-main-function'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Intercepted-By': 'fetch-interceptor-module'
        }
      })
    );
  }
};

// 导出 main 方法 - 异步执行 fetch 劫持
export async function main() {
  console.log('🚀 Fetch Interceptor: main() 异步方法被调用');

  // 模拟一些异步初始化工作
  console.log('⏳ Fetch Interceptor: 开始异步初始化...');

  // 异步等待一小段时间
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('🎯 Fetch Interceptor: 异步初始化完成，现在添加 fetch 监听器...');

  // 在异步函数中添加 fetch 监听器
  self.addEventListener('fetch', interceptorFetchHandler);
  console.log('✅ Fetch Interceptor: fetch 监听器已在异步 main 函数中添加');

  // 返回配置信息
  const config = {
    interceptorActive: true,
    addedAt: 'async-main-function',
    timestamp: Date.now(),
    message: 'Fetch 监听器已在异步 main 函数中成功添加',
    asyncDelay: 100
  };

  console.log('⚙️ Fetch Interceptor: 异步配置完成', config);

  return config;
}

// 导出测试方法
export function testInterceptor() {
  console.log('🧪 Fetch Interceptor: 测试方法被调用');

  return {
    moduleLoaded: true,
    fetchHandlerAdded: true,
    testUrl: '/api/interceptor/test',
    message: 'Fetch 拦截器模块测试成功'
  };
}

// 导出获取状态的方法
export function getInterceptorStatus() {
  return {
    active: true,
    handlerType: 'async-main-function',
    addedAt: 'async-main-execution',
    targetPaths: ['/api/interceptor/*'],
    description: 'Fetch 监听器在异步 main 函数执行时添加'
  };
}

console.log('Fetch Interceptor Module: ✅ 模块加载完成，等待异步 main() 函数调用来添加 fetch 监听器');