// 缓存请求
// 检测当前存活的serviceWorker
// 通知serviceWorker
const apiUrl = location.origin;
console.log('apiUrl', apiUrl);

const currentStrategy = {
    [apiUrl +
    '/restapi/restapi?serviceName=CorpFrontendBasicCommon&operation=getPublicKey']:
        {
            expire: 1000 * 100,
        },
    [apiUrl + '/home/api/post']: {
        expire: 1000 * 10,
    },
};

console.log('currentStrategy', currentStrategy);

console.log('web worker postmessage start ', currentStrategy);

console.log('web worker postmessage end', currentStrategy);
self.addEventListener('install', (event) => {
    console.log('web worker install');
});
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    if (type === 'getcookie') {
        console.log('get cookie', data);
        addCacheStrategy(data);
        return;
    }
    console.log('web worker receive message', event.data);
    if (type === 'receive-strategy') {
        console.log('start api prefetch', data);
        // 开始预请求
        fetch('/home/api/get').then((response) => {
            console.log('prefetch get success response', response);
        });
        fetch('/home/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: '111',
                count: 0,
            }),
        }).then((response) => {
            console.log('prefetch post success response', response);
        });
    }
});

function addCacheStrategy(cookie) {
    const gid = getCookieValue('GUID', cookie);
    console.log('get guid', gid);
    return new Promise(() => {
        // 生成随机数
        const hash = Math.random();
        console.log('add cache strategy', hash);
        self.postMessage({
            type: 'add-strategy',
            data: { ...currentStrategy, _hash: Math.random() },
        });
    });
}

self.postMessage({
    type: 'getcookie',
});

function getCookieValue(cookieName, cookiesStr) {
    const cookies = cookiesStr.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}
