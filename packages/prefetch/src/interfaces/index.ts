export interface IRequestParams {
  header: object;
  body: object;
}

export type ICache = {
  data: any;
  expire: number;
};

// 缓存规则
export interface IRule {
  // 基本参数
  // apiUrl?: string | RegExp;
  apiUrl: string;
  type: "POST" | "GET" | "PUT" | "DELETE";
  // 过期时间，ms,默认10000ms
  expireTime?: number;
  // 开始预请求的时机:空闲时、点击按钮时、按钮展示时
  triger?: "idle" | "click" | "visible";
  // 预请求时携带的参数
  // requestParams:
  //   | IRequestParams
  //   | (() => Promise<IRequestParams> | IRequestParams);
  // 高级参数，开发者可自定义请求方法
  fetch?: () => Promise<Response> | Response;
  // 是否被劫持的方法
  // 用户可自定义 cache 的校验规则
  validateCache?: (cache: ICache) => boolean;
  __key__?: string;
  __appUrl__?: string;
}
