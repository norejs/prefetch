import { generateUUID } from '../utils/index';

class Massenger {
  private methods: {
    [key: string]: (data: any) => any;
  } = {};

  private callbacks: {
    [key: string]: (data: any) => void;
  } = {};

  constructor() {
    this.init();
  }

  addCallback(callback: (data: any) => any) {
    const id = generateUUID();
    this.callbacks[id] = callback;
    return id;
  }

  init() {
    window.addEventListener('message', event => {
      const { type, data } = event.data;
      const { callbackId, customData } = data || {};
      // 收到信息后执行特定的方法
      if (type === 'prefetch:worker-to-main-callback') {
        const callback = this.callbacks[callbackId];
        if (callback) {
          callback(customData);
        }
        try {
          delete this.callbacks[callbackId];
        } catch (error) {}
      }
    });
  }

  register(name: string, method: any) {
    this.methods[name] = method;
  }

  unRegister(name: string) {
    try {
      delete this.methods[name];
    } catch (error) {}
  }

  private callRemote(name: string, data: any) {
    return new Promise((resolve, reject) => {
      const callbackId = this.addCallback(resolve);
      window.postMessage(
        {
          type: 'prefetch:main-to-worker-callback',
          data: {
            name,
            data,
            callbackId,
          },
        },
        '*',
      );
    });
  }

  get remoteInstance() {
    return new Proxy(
      {},
      {
        get: (target, prop) => {
          return (...data: any[]) => {
            return this.callRemote(prop.toString(), data);
          };
        },
      },
    );
  }
}

export default new Massenger();
