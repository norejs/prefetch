import React from 'react';
import { PrefetchLink } from 'prefetch';
import img from './images/img.png';
// decrypt(res);
export default function Home() {
    return (
        <div>
            <img
                style={{
                    width: '100%',
                }}
                alt=""
                src={img}
            />
            <PrefetchLink appUrl="/webapp/hailing/search">
                <button
                    onClick={() => {
                        window.location.href = '/webapp/hailing/search';
                    }}
                    style={{
                        position: 'absolute',
                        top: '80%',
                        left: '79%',
                        height: ' 40px',
                        width: '40px',
                        opacity: 0.5,
                    }}
                >
                    国内打车
                </button>
            </PrefetchLink>
            {/* <PrefetchLinks appUrl="/webapp/trainbooking/search?backurl=home&from=root">
                <button>火车票</button>
            </PrefetchLinks>
            <PrefetchLinks appUrl="/webapp/hailing/search?source=carHome&bdtype=webgl">
                <button>打车1</button>
            </PrefetchLinks> */}
            {/* <PrefetchLinks appUrl="/home"></PrefetchLinks> */}
        </div>
    );
}
