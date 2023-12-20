function isIp(host) {
    return !isNaN(Number(host.replace(".", "")));
}
const host = window.location.host;
export const IS_TEST = host.indexOf(".dev.") > -1 || isIp(host) || host === "localhost" || host.indexOf(".test.") > -1;