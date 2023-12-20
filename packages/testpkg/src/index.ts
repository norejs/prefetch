import CryptoJS from "crypto-js";
import { getKey } from "./keys";
import transformHost from "./transformHost";
import { IS_TEST } from "./env";
const { AES, MD5: md5 } = CryptoJS;
const DEFAULT_KEY = getKey();
export function _jiami(data) {
    const FAKE_KEY = "MTIzMTI0MzQ1MjM0NTI0NTIzNDUyMzU=";
    // 加密算法
    return AES.crypto(md5(data), FAKE_KEY);
}

export function encrypt(originData, key: string = DEFAULT_KEY) {
    // 支持JSON
    let dataStr = originData;
    if (typeof originData === "object") {
        dataStr = JSON.stringify(originData);
    }
    if (typeof dataStr !== "string") {
        throw new Error("数据必须是string");
    }
    const decodeKey = CryptoJS.enc.Base64.parse(key);
    const md5key = md5(decodeKey);
    const iv = md5key;
    const encoded = AES.encrypt(dataStr, decodeKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encoded.toString();
}

export function decrypt(encodeStr: string, key: string = DEFAULT_KEY, transformTestHost = true) {
    const decodeKey = CryptoJS.enc.Base64.parse(key);
    const md5key = md5(decodeKey);
    const iv = md5key;
    const encoded = AES.decrypt(encodeStr, decodeKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    let res = encoded.toString(CryptoJS.enc.Utf8);
    // 尝试对host 进行转换
    try {
        res && typeof res === "string" && transformTestHost && (res = transformHost(res));
    } catch (error) {}
    try {
        return JSON.parse(res);
    } catch (error) {
        return res;
    }
}

type IResType = {
    stat: object;
    content: Array<any>;
};
export function gatewayDecrypt(res: IResType, key: string = DEFAULT_KEY, options = {}) {
    if (res && res.content && Array.isArray(res.content) && res.content.length > 0) {
        // 尝试对content 解密
        res.content = res.content.map(contentItem => {
            if (contentItem && typeof contentItem === "string" && contentItem.length % 4 === 0) {
                try {
                    let res = decrypt(contentItem, key);
                    if (res !== "") {
                        try {
                            _sendDebugInfo(options, res);
                        } catch (error) {}
                        return res;
                    }
                } catch (error) {
                    console.log("content 解密失败");
                }
            }
            return contentItem;
        });
    }
    return res;
}

function _sendDebugInfo(request, response) {
    if (!IS_TEST) {
        console.log("cannot sendBlobRequest in production");
        return;
    }
    sendBlobRequest({ request, response });
}

function lookLikeEncrypted(str) {
    return typeof str === "string" && str.length % 4 === 0 && str.length > 0;
}

function tryDescryptObject(obj, key = DEFAULT_KEY) {
    try {
        const newObject = {};
        if (typeof obj === "object") {
            for (var i in obj) {
                let item = obj[i];
                if (typeof obj[i] !== "object") {
                    newObject[i] = (lookLikeEncrypted(item) && decrypt(item, key)) || obj[i];
                } else {
                    newObject[i] = (obj[i] && tryDescryptObject(obj[i], key)) || obj[i];
                }
            }
            return newObject;
        }
    } catch (error) {}
    return obj;
}

export function sendBlobRequest(data) {
    if (!IS_TEST) {
        console.log("cannot sendBlobRequest in production");
        return;
    }
    try {
        const blob = new Blob([JSON.stringify(tryDescryptObject(data), null, 2)], { type: "application/json" });
        const blobUrl = URL.createObjectURL(blob);
        fetch && fetch(blobUrl);
        return blobUrl;
    } catch (error) {}
}
