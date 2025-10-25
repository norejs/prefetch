// Service Worker - ImportScripts Demo
console.log('Service Worker: 脚本开始加载');

// 要导入的外部脚本
const SCRIPTS_TO_IMPORT = [
  './utils.js',
  './cache-helper.js',
  'http://localhost:18003/service-worker.js'  // 使用开发环境 CDN
];

// 记录导入状态
let importStatus = {
  success: [],
  failed: []
};

// 尝试导入脚本
function loadExternalScripts() {
  console.log('Service Worker: 开始导入外部脚本...');

  SCRIPTS_TO_IMPORT.forEach(scriptUrl => {
    try {
      console.log(`Service Worker: 正在导入 ${scriptUrl}`);

      // 使用 importScripts 同步导入脚本
      importScripts(scriptUrl);

      console.log(`Service Worker: ✓ 成功导入 ${scriptUrl}`);
      importStatus.success.push(scriptUrl);

    } catch (error) {
      console.error(`Service Worker: ✗ 导入失败 ${scriptUrl}:`, error.message);
      importStatus.failed.push({
        url: scriptUrl,
        error: error.message
      });
    }
  });

  console.log('Service Worker: 脚本导入完成', importStatus);
}

// 安装阶段
self.addEventListener('install', (event) => {
  console.log('Service Worker: 安装中...');

  // 在安装阶段导入脚本
  loadExternalScripts();

  // 跳过等待，立即激活
  self.skipWaiting();
});

// 激活阶段
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 激活中...');

  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Service Worker: 已激活并控制所有客户端');

      // 向所有客户端发送导入状态
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'IMPORT_STATUS',
            status: importStatus
          });
        });
      });
    })
  );
});

// Fetch 事件处理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 拦截测试API请求
  if (url.pathname === '/test-api') {
    event.respondWith(handleTestApi(event.request));
    return;
  }

  // 其他请求直接透传
});

// 处理测试API请求
async function handleTestApi(request) {
  const url = new URL(request.url);
  const timestamp = url.searchParams.get('timestamp');

  // 使用导入的工具函数（如果成功导入的话）
  let response = {
    message: 'Hello from Service Worker!',
    timestamp: timestamp,
    importStatus: importStatus
  };

  // 如果成功导入了utils.js，使用其中的函数
  if (typeof self.formatResponse === 'function') {
    response = self.formatResponse(response);
  }

  // 如果成功导入了cache-helper.js，记录缓存信息
  if (typeof self.getCacheInfo === 'function') {
    response.cacheInfo = await self.getCacheInfo();
  }

  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// 消息处理
self.addEventListener('message', (event) => {
  console.log('Service Worker: 收到消息', event.data);

  if (event.data && event.data.type === 'GET_IMPORT_STATUS') {
    // 发送导入状态
    event.source.postMessage({
      type: 'IMPORT_STATUS_RESPONSE',
      status: importStatus
    });
  }
});

console.log('Service Worker: 脚本加载完成');