
/**
 * api 白名单
 */
const apiHostWhiteList = [

];

const isInWhiteList = (url: string) => {
  try {
    const urlObj = new URL(url);
    return apiHostWhiteList.some(host => host===urlObj.host || urlObj.host.endsWith('.'+host));
    } catch (error) {
      return false
    }
};