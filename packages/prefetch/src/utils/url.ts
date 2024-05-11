export function getFullUrl(url = "/") {
  if (url.startsWith("http")) {
    return url;
  }
  if (typeof location === "undefined") {
    return url;
  }
  const baseUrl = location.origin;
  return `${baseUrl}${url}`;
}

export function getAbsoluteUrl(releativeUrl = "", baseUrl = "") {
  if (releativeUrl.startsWith("http") || releativeUrl.startsWith("//")) {
    return releativeUrl;
  }
  // 计算前面的路径
  const baseUrlObj = new URL(baseUrl || location?.href);
  // 获取pathName
  const pathName = baseUrlObj.pathname;
  const endFileorFold = pathName.split("/").pop();

  const isFold = !endFileorFold?.includes(".");
  let fullPathName = isFold
    ? pathName
    : pathName.replace(endFileorFold || "", "");
  if (!fullPathName.endsWith("/")) {
    fullPathName += "/";
  }

  if (releativeUrl.startsWith("/")) {
    return baseUrlObj.origin + releativeUrl;
  }
  return baseUrlObj.origin + fullPathName + releativeUrl;
}
