// 运行在worker 中
import { remoteMessageType, callbackMessageType } from "../contants/index";
// import { getPrefetchWorker } from "./preloader-worker";
/**
 * 消息通信类
 * */
// 传递消息的统一前缀
const uniquePrefix = "swifcom:";
export class Massenger {
  private methods: {
    [key: string]: (data: any) => any;
  } = {};
  private messageChannel: string;
  private callbacks: {
    [key: string]: (data: any) => void;
  } = {};

  constructor(messageChannel: string) {
    // 避免重复初始化
    this.messageChannel = messageChannel;
    this.init();
  }

  private init() {
    this.listenRemoteCall();
    this.listenCheck();
  }

  // 监听远程调用
  private listenRemoteCall() {
    self.addEventListener("message", async (event) => {
      const { type, data } = event.data;
      const { customData } = data || {};
      switch (type) {
        case remoteMessageType:
          const { funName, callbackId } = data;
          // 收到信息后执行特定的方法
          const method = this.methods[funName];
          if (method) {
            const methodRes = await method(customData);
            // 执行完成后触发回调,通知主线程执行结果
            const client = event.source as Window;
            client.postMessage({
              type: callbackMessageType,
              data: {
                callbackId,
                customData: methodRes,
              },
            });
          }
          break;
      }
    });
  }

  // 监听主线程的检查消息
  private listenCheck() {
    self.addEventListener("message", (event) => {
      const { type, data } = event.data;
      if (type === `${uniquePrefix}-check:${this.messageChannel}`) {
        event.source?.postMessage({
          type: `${uniquePrefix}-check:${this.messageChannel}`,
          data: data,
        });
      }
    });
  }

  // 注册方法，用于远程调用
  register(name: string, method: any) {
    this.methods[name] = method;
  }

  // 取消注册方法，用于远程调用
  unRegister(name: string) {
    try {
      delete this.methods[name];
    } catch (error) {}
  }
}
