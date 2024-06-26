import sha256 from "crypto-js/sha256";
export default async function requestToKey(_request: Request) {
  const request = _request.clone();
  const url = request.url;
  const method = request.method;
  const body = await request.text();
  // 组合信息
  const combinedInfo = `${method.toUpperCase()} ${url} ${JSON.stringify(body)}`;
  // 使用btoa函数进行编码生成唯一键
  // 注意：在实际应用中，可能需要使用更安全的哈希函数如SHA-256
  const key = sha256(combinedInfo).toString();
  return key;
}
