import { generateUUID } from "../utils/index";
import { remoteMessageType, callbackMessageType } from "../contants/index";
import { createTimeId } from "../utils/index";
/**
 * 消息通信类
 * */
const MassengerInstances = new Map();

export type IWorkerStatus = "unfoud" | "actived" | "closed";

export class Massenger {
  private worker: ServiceWorker | null = null;
  private messageChannel: string;
  // 用于存储worker 执行完成后通知主线程的回调
  private callbacks: {
    [key: string]: (data: any) => void;
  } = {};
  public status: IWorkerStatus = "unfoud";
  constructor(messageChannel: string) {
    if (MassengerInstances.has(messageChannel)) {
      throw new Error("messageChannel is exist");
    }
    this.messageChannel = messageChannel;
    this.init();
  }
  // 注册一个回调，返回callbackId，worker 执行完成后通知时带上callbackId
  private addCallback(callback: (data: any) => any) {
    const id = generateUUID();
    this.callbacks[id] = callback;
    return id;
  }

  private init() {
    this.listenCallback();
    this.listenWorkerStatus();
  }
  private listenCallback() {
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
  // 监听Worker 的事件，更新自身状态
  private listenWorkerStatus() {
    const handleActiveChange = () => {
      const activedWorker = navigator?.serviceWorker?.controller;
      if (activedWorker && this.worker === activedWorker) {
        return;
      }
      if (activedWorker) {
        this.checkWorker(activedWorker)
          .then((res) => {
            this.worker = activedWorker;
            this.status = "actived";
          })
          .catch(() => {
            this.status = "closed";
            this.worker = null;
          });
      }
    };
    handleActiveChange();
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleActiveChange
    );
  }
  // 检查worker 是否匹配
  private async checkWorker(worker: ServiceWorker) {
    return new Promise((resolve, reject) => {
      const id = createTimeId();
      const timer = setTimeout(() => {
        reject(new Error("check worker timeout"));
      }, 1000);
      worker.addEventListener("message", (event) => {
        const { type, data = {} } = event as MessageEvent;
        if (
          type === `swifcom-check:${this.messageChannel}` &&
          data?.id === id
        ) {
          timer && clearTimeout(timer);
          resolve(true);
        }
      });

      worker.postMessage({
        type: `swifcom-check:${this.messageChannel}`,
        data: { id },
      });
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
    return new Proxy({} as any, {
      get: (target, prop) => {
        return (...data: any[]) => {
          return this.callRemote(prop.toString(), data);
        };
      },
    });
  }
}