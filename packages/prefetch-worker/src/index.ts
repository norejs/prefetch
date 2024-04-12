// service worker 文件，这里只能写SW 的语法
// 接受缓存策略，执行缓存策略
/**
 * 仅用于修复代码提示报错
 */
const cacheStrategies = {};
const sessionCache = new Map();
const PRELOADER_PREFIX = 'PRELOADER:';


function getAppUrlByEvent(event: MessageEvent) {
  console.log('getAppUrlByEvent', event);
  const {} = event;
}

self.addEventListener('install', event => {
  // @ts-ignore
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('activate');
});

const preloadMessageHandler = {
  'add-strategy': (data, appUrl: string) => {
    // 添加策略
    Object.assign(cacheStrategies, data);
  },
};

self.addEventListener('message', event => {
  console.log('service worker receive message', event.data);
  const { type, data, appUrl } = event.data;
  // 来自于preloader的信息
  try {
    if (type.startsWith(PRELOADER_PREFIX)) {
      const messageType = type.split(':')[1];
      const handler = preloadMessageHandler[messageType];
      handler?.(data, appUrl);
      sendMessageToSender(event, {
        type: `${PRELOADER_PREFIX}${messageType}-success`,
      });
    }
  } catch (error) {
    console.log('error', error);
  }
});

// 用于检测是否支持preload
self.addEventListener('message', function (event) {
  const { type, data } = event.data;
  if (type === 'check-support-preload') {
    sendMessageToSender(event, {
      type: 'check-support-preload-success',
      data,
    });
  }
});

/**
 * 根据event.source.id发送消息
 * @param {*} event
 * @param {*} data
 */
function sendMessageToSender(event:MessageEvent, data: any) {
  self.clients.matchAll().then(function (clientList) {
    var senderID = event.source.id;
    // 消息不传递给发送者本身
    clientList.forEach(function (client) {
      if (client.id !== senderID) {
        return;
      }
      client.postMessage(data);
    });
  });
}

/**
 * 更具参数和请求方法生成key
 * @param {*} request
 * @returns
 */
async function getRequestKey(request) {
  const { url, method } = request;
  const primary = `${method}:${url}`;
  let params = 'default';
  try {
    const body = await request.clone().json();
    params = JSON.stringify(body);
  } catch (error) {}
  return {
    primary,
    params,
  };
}

/**
 * 匹配当前的缓存策略
 * @param {*} request
 * @returns
 */
const matchStrategy = async event => {
  console.log('matchStrategy', event);
  const appUrl = await getAppUrlByEvent(event);
  console.log('appUrl', appUrl);
  const client = await getClientByEvent(event);
  const windowUrl = client.url;
  // 如何定义APPURL
  // const { request } = event;
  // const { url } = request;
  // if (!isInWhiteList(url)) {
  //     return null;
  // }
  // const stratety = cacheStrategies[url];
  // return stratety;
};
/**
 * 监听请求
 */
self.addEventListener('fetch', function (event) {
  const request = event.request;
  // const matchedStrategy = matchStrategy(request);
  // 执行缓存策略，只有特定的请求才会执行缓存策略
  // 有缓存策略，走缓存
  // const cacheKey = `${request.method}:${request.url}`; // 增加参数
  if (isInWhiteList(request.url)) {
    event.respondWith(handleFetch(event));
  }
});
async function getClientByEvent(event) {
  const { clientId } = event;
  const client = await self.clients.get(clientId);
  console.log('getClientByEvent', client);
  return client;
}
async function handleFetch(event) {
  const matchedStrategy = await matchStrategy(event);

  // const { expire } = matchedStrategy ?? {};
  // const { primary, params } = await getRequestKey(request);
  // // 当前内存中是否有缓存
  // const cache = sessionCache.get(primary)?.get?.(params);
  // // 判断缓存是否过期
  // if (cache && cache?.data && cache.expire > Date.now()) {
  //     return new Response(JSON.stringify(cache?.data));
  // } else {
  //     console.log('no cache or cache expire');
  // }
  // // 没有缓存，请求真实数据
  const response = await fetch(event.request);
  const { status } = response;
  try {
    const resCache = await getResContent(response);
    // sessionCache.set(primary, new Map());
    if (status === 200) {
      // 保存到内存中
      console.log('cache the response', resCache);
      // sessionCache
      //     .get(primary)
      //     .set(params, { data: resCache, expire: Date.now() + expire });
    }
    return new Response(JSON.stringify(resCache));
  } catch (error) {
    return await fetch(event.request);
  }
}

const getResContent = (res: Response) => {
  try {
    return res.json();
  } catch (error) {
    try {
      return res.text();
    } catch (error) {
      return '';
    }
  }
};

function sendMessage() {}
