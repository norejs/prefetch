import SHA256 from 'crypto-js/sha256';

/**
 * 将请求转换为缓存键
 */
export default async function requestToKey(request: Request): Promise<string> {
  const clonedRequest = request.clone();
  const url = clonedRequest.url;
  const method = clonedRequest.method;
  const body = await clonedRequest.text();
  
  // 组合信息
  const combinedInfo = `${method.toUpperCase()} ${url} ${JSON.stringify(body)}`;
  
  // 使用 SHA-256 生成唯一键
  const key = SHA256(combinedInfo).toString();
  return key;
}