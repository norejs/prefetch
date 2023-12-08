import React from 'react';
import PrefetchLinks from '../prefetch-engine/PrefetchLink';
import { post } from '../utlis/request';

// decrypt(res);
export default function Home() {
    const [count, setCount] = React.useState(0);
    return (
        <>
            <link rel="prefetch" href="https://baidu.com" />
            <PrefetchLinks appUrl="/webapp/trainbooking/search?backurl=home&from=root">
                <button>火车票</button>
            </PrefetchLinks>
            <PrefetchLinks appUrl="/webapp/hailing/search?source=carHome&bdtype=webgl">
                <button>打车1</button>
            </PrefetchLinks>
            <PrefetchLinks appUrl="/home">
                <button
                    onClick={() => {
                        post('home/api/post', {
                            content: '111',
                            count: 0,
                        }).then((res) => {
                            console.log('请求完成', res);
                        });
                        setCount(count + 1);
                        // fetch('home/api/get').then((res) => {
                        //     console.log(res);
                        // });
                    }}
                >
                    发起请求
                </button>
            </PrefetchLinks>
        </>
    );
}
