// 和当前宿主发生通讯
// 获取当前宿主的URL
export function getHostUrl() {
    return self.location.origin;
}

function sendMessageToSender(event:Event, message) {
    event.source.postMessage(message, event.origin);
}
