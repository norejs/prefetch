import { IRule } from "@norejs/prefetch";
// 是否在SW 中可运行
import MD5 from "crypto-js/md5";

// 通过appUrl找到rule
const AppRuleMap: {
  [key: string]: {
    [key: string]: IRule;
  };
} = {};

// 通过key找到rule
const KeyRuleMap: {
  [key: string]: IRule;
} = {};

/**
 * 添加规则
 * @param appUrl
 * @param rule
 * @returns
 */
export function addRule(appUrl: string, rule: IRule) {
  if (!appUrl || !rule) {
    return null;
  }
  if (!AppRuleMap[appUrl]) {
    AppRuleMap[appUrl] = {};
  }
  // 利用rule和appUrl 计算唯一key
  const key = MD5(`${appUrl}-${JSON.stringify(rule)}`).toString();
  AppRuleMap[appUrl][key] = rule;
  // @ts-ignore
  rule.__key__ = key;
  // @ts-ignore
  rule.__appUrl__ = appUrl;
  // 不允许修改
  Object.defineProperties(rule, {
    __appUrl__: {
      writable: false,
    },
    __key__: {
      writable: false,
    },
  });
  KeyRuleMap[key] = rule;
  return key;
}

export function removeRule(key: string) {
  if (!key) {
    return null;
  }
  const rule = KeyRuleMap[key];
  const appUrl = rule.__appUrl__;
  if (appUrl && AppRuleMap[appUrl]) {
    delete AppRuleMap[appUrl][key];
  }
  if (KeyRuleMap[key]) {
    delete KeyRuleMap[key];
  }
  return true;
}

// 获取appUrl下的所有规则
export function getAppRules(appUrl: string) {
  return AppRuleMap[appUrl];
}

export function clearRules(appUrl: string) {
  if (appUrl && AppRuleMap[appUrl]) {
    Object.keys(AppRuleMap[appUrl]).forEach((key) => {
      if (KeyRuleMap[key]) {
        delete KeyRuleMap[key];
      }
    });
    delete AppRuleMap[appUrl];
  }
}
/**
 * 清空所有规则
 */
export function clearAllRules() {
  Object.keys(AppRuleMap).forEach((appUrl) => {
    clearRules(appUrl);
  });
}

/**
 * 匹配规则
 * @param appUrl
 * @param request
 */
export function matchRule(appUrl: string, request: Request) {
  const appRules = getAppRules(appUrl);
  // TODO: 这里可以通过算法优化将复杂度降到O(1)
  if (appRules) {
    for (const key in appRules) {
      const rule = appRules[key];
      if (isRuleMatched(rule, request)) {
        return rule;
      }
    }
  }
  return null;
}

/**
 * 通过请求匹配规则，从而决定如何缓存
 * @param rule
 * @param originRequest
 * @returns
 */
export function isRuleMatched(rule: IRule, originRequest: Request) {
  // type 相同、url 相同
  const request = originRequest.clone();
  const url = request.url;
  const method = request.method;
  return rule.type === method && rule.apiUrl === url;
}
