import { generateUUID } from "../utils/index";
import {
  remoteMessageType,
  callbackMessageType,
  authMessageType,
} from "../contants/index";
// import { getPrefetchWorker } from "./preloader-worker";
/**
 * 消息通信类
 * */
const MassengerInstances = new Map();
export class Massenger {
  private worker: Worker | null = null;
  private messageChannel: string;
  private methods: {
    [key: string]: (data: any) => any;
  } = {};

  private callbacks: {
    [key: string]: (data: any) => void;
  } = {};

  constructor(messageChannel: string) {
    if (MassengerInstances.has(messageChannel)) {
      throw new Error("messageChannel is exist");
    }
    this.messageChannel = messageChannel;
    this.init();
  }

  private addCallback(callback: (data: any) => any) {
    const id = generateUUID();
    this.callbacks[id] = callback;
    return id;
  }

  private async auth() {
    const res = await this.remoteInstance.__swiftcom__auth__();
    return res.messageChannel === this.messageChannel;
  }

  private init() {
    self.addEventListener("message", async (event) => {
      const { type, data } = event.data;
      const { customData, callbackId } = data || {};
      switch (type) {
        case callbackMessageType:
          const callback = this.callbacks[callbackId];
          if (callback) {
            callback(customData);
          }
          try {
            delete this.callbacks[callbackId];
          } catch (error) {}
          break;
      }
    });
  }

  private callRemote(funName: string, data: any) {
    return new Promise((resolve, reject) => {
      if (this.worker) {
        const callbackId = this.addCallback(resolve);
        this.worker.postMessage({
          type: remoteMessageType,
          data: {
            funName,
            data,
            callbackId,
          },
        });
      } else {
        reject(new Error("worker is not exist"));
      }
    });
  }
  /**
   * 远程对象，用于调用远程对象额放啊发
   * */

  get remoteInstance() {
    return new Proxy(
      {} as any,
      {
        get: (target, prop) => {
          return (...data: any[]) => {
            return this.callRemote(prop.toString(), data);
          };
        },
      }
    );
  }
}
