
/**
 * api 白名单
 */
const apiHostWhiteList = [
  'qa.nt.ctripcorp.com',
  'trip.com',
  'trip.biz',
  'ctrip.com',
];

const isInWhiteList = (url: string) => {
  try {
    const urlObj = new URL(url);
    return apiHostWhiteList.some(host => host===urlObj.host || urlObj.host.endsWith('.'+host));
    } catch (error) {
      return false
    }
};