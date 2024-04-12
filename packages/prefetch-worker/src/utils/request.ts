import sha256 from 'crypto-js/sha256';
/**
 * 将request 转化为cache key
 * @param request
 * @returns
 */
export async function requestToCacheKey(oriRequest: Request): Promise<string> {
    // 提取请求类型和URL
    const request = oriRequest.clone();
    const method = request.method;
    const url = request.url;

    // 提取请求体作为文本
    // 注意：这可能会导致请求体被读取，之后可能无法再次读取
    let body = await request.text();
    // 提取并排序请求头部
    const headersArray: string[] = [];
    request.headers.forEach((value, key) => {
        headersArray.push(`${key.toLowerCase()}:${value}`);
    });
    headersArray.sort(); // 确保头部的顺序不影响键的唯一性

    // 组合信息
    const combinedInfo = `${method.toUpperCase()} ${url} ${headersArray.join(
        ' '
    )} ${body}`;

    // 使用btoa函数进行编码生成唯一键
    // 注意：在实际应用中，可能需要使用更安全的哈希函数如SHA-256
    const key = sha256(combinedInfo).toString();
    return key;
}

// 根据请求生成url,用于和规则中的声明做判断
export function requestToUrl(oriRequest: Request) {
    // TODO
    const request = oriRequest.clone();
    const url = request.url;
    const method = request.method;
    return `${method.toUpperCase()}-${url}`;
}
