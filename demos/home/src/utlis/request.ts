// 发送POST请求
const defaultOptions = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
};
export function request(url: string, data = {}, options: any) {
    return new Promise((resolve, rejects) => {
        fetch(url, {
            ...(defaultOptions ?? {}),
            ...(options ?? {}),
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                rejects(error);
            });
    });
}
export function post(url: string, data: any) {
    return request(url, data, {
        method: 'POST',
    });
}

// 发送GET请求
export function get(url: string, data: any) {
    return request(url, data, {
        method: 'GET',
    });
}
