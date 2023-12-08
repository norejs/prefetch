// 缓存请求
// 检测当前存活的serviceWorker
// 通知serviceWorker
const apiUrl = location.origin;
console.log('apiUrl', apiUrl);
const currentStrategy = {
    [apiUrl + '/home/api/get']: {
        expire: 1000 * 100,
    },
    [apiUrl + '/home/api/post']: {
        expire: 1000 * 10,
    },
};

console.log('currentStrategy', currentStrategy);

console.log('web worker postmessage start ', currentStrategy);

console.log('web worker postmessage end', currentStrategy);

self.addEventListener('message', (event) => {
    const { type, data } = event.data;
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

function addCacheStrategy(strategy) {
    return new Promise(() => {
        // 生成随机数
        const hash = Math.random();
        
        self.postMessage({
            type: 'add-strategy',
            data: {...currentStrategy,_hash: Math.random()},
        });
    });
}
