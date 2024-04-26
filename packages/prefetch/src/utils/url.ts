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
