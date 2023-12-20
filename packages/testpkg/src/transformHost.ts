const testHostList = [".a.com",'.b.com'];

function getCurrentHost(windowHost) {
    const host = windowHost || window.location.host;
    return testHostList.find(item => host.indexOf(item) > -1);
}

export default function transformHost(result, windowHost = "") {
    const currentTestHost = getCurrentHost(windowHost);
    if (!currentTestHost) {
        return result;
    }
    testHostList.forEach(item => {
        if (item !== currentTestHost) {
            const reg = new RegExp(`${item.replace(/\./gi, `\\.`)}`, "ig");
            result = result.replace(reg, currentTestHost);
        }
    });
    return result;
}