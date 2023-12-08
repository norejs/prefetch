import React from 'react';
import PrefetchLinks from '../prefetch-engine/PrefetchLink';
import { post } from '../utlis/request';

// decrypt(res);
export default function Home() {
    const [count, setCount] = React.useState(0);
    return (
        <>
            {/* <PrefetchLinks appUrl="/webapp/trainbooking/search?backurl=home&from=root">
                <button>火车票</button>
            </PrefetchLinks>
            <PrefetchLinks appUrl="/webapp/hailing/search?source=carHome&bdtype=webgl">
                <button>打车1</button>
            </PrefetchLinks> */}
            {/* <PrefetchLinks appUrl="/home"></PrefetchLinks> */}
        </>
    );
}
