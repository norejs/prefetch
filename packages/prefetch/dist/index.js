'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
require('core-js/modules/es.object.set-prototype-of.js');
require('core-js/modules/es.object.assign.js');
require('core-js/modules/es.array.index-of.js');
require('core-js/modules/es.symbol.js');
require('core-js/modules/es.object.get-own-property-descriptor.js');
require('core-js/modules/es.object.to-string.js');
require('core-js/modules/es.object.define-property.js');
require('core-js/modules/es.symbol.description.js');
require('core-js/modules/es.promise.js');
require('core-js/modules/es.symbol.iterator.js');
require('core-js/modules/es.array.iterator.js');
require('core-js/modules/es.string.iterator.js');
require('core-js/modules/web.dom-collections.iterator.js');
require('core-js/modules/es.array.concat.js');
require('core-js/modules/es.array.slice.js');
require('core-js/modules/es.symbol.async-iterator.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var manifestCache = {};
/**
 * 获取应用使用的资源
 * @param appUrl
 * @returns
 */
function loadMaifest(appUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var res, html, dom, scripts, links, styles, normalScripts_1, preloadScripts_1, manifest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (manifestCache[appUrl]) {
                        return [2 /*return*/, manifestCache[appUrl]];
                    }
                    return [4 /*yield*/, fetch(appUrl)];
                case 1:
                    res = _a.sent();
                    if (!(res && res.status === 200)) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.text()];
                case 2:
                    html = _a.sent();
                    dom = new DOMParser().parseFromString(html, 'text/html');
                    scripts = dom.querySelectorAll('script');
                    links = dom.querySelectorAll('link');
                    styles = Array.from(links).reduce(function (pre, link) {
                        if (link.rel === 'stylesheet') {
                            pre.push(link.href);
                        }
                        return pre;
                    }, []);
                    normalScripts_1 = [];
                    preloadScripts_1 = [];
                    Array.from(scripts).forEach(function (script) {
                        if ((script === null || script === void 0 ? void 0 : script.type) === 'preload') {
                            preloadScripts_1.push(script.src);
                        }
                        else {
                            normalScripts_1.push(script.src);
                        }
                    });
                    manifest = {
                        normalScripts: normalScripts_1,
                        preloadScripts: preloadScripts_1,
                        styles: styles,
                    };
                    manifestCache[appUrl] = manifest;
                    return [2 /*return*/, manifest];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}

/**
 * 初始化 service worker
 * @param
 */
function initServiceWorker(_a) {
    var _b = _a.url, url = _b === void 0 ? '' : _b, scope = _a.scope;
    return __awaiter(this, void 0, void 0, function () {
        var registration;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log(navigator.serviceWorker.controller);
                    if (!('serviceWorker' in navigator)) return [3 /*break*/, 2];
                    if (navigator.serviceWorker.controller) {
                        return [2 /*return*/, navigator.serviceWorker.controller];
                    }
                    if (!url) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, navigator.serviceWorker.register(url, {
                            scope: scope,
                        })];
                case 1:
                    registration = _c.sent();
                    return [2 /*return*/, registration.active];
                case 2: return [2 /*return*/, null];
            }
        });
    });
}

/**
 * 运行Preload
 * @param url
 */
var workers = new Map();
function runAppPreloadScript(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.appUrl, appUrl = _c === void 0 ? '' : _c, _d = _b.scriptUrl, scriptUrl = _d === void 0 ? '' : _d, _e = _b.lifespan, lifespan = _e === void 0 ? 10000 : _e, _f = _b.autoInstallServiceWorker, autoInstallServiceWorker = _f === void 0 ? true : _f;
    return __awaiter(this, void 0, void 0, function () {
        var worker_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!appUrl || !scriptUrl) {
                        return [2 /*return*/, null];
                    }
                    if (workers.get(scriptUrl)) {
                        return [2 /*return*/, workers.get(scriptUrl)];
                    }
                    if (!(typeof Worker !== 'undefined')) return [3 /*break*/, 3];
                    if (!autoInstallServiceWorker) return [3 /*break*/, 2];
                    return [4 /*yield*/, initServiceWorker({
                            url: '/webapp/home/service-worker.js',
                            scope: '/',
                        })];
                case 1:
                    _g.sent();
                    _g.label = 2;
                case 2:
                    worker_1 = new Worker(scriptUrl);
                    createMessageChannel(worker_1, appUrl);
                    workers.set(scriptUrl, true);
                    // 5s后销毁
                    setTimeout(function () {
                        worker_1.terminate();
                        workers.set(scriptUrl, true);
                    }, lifespan);
                    return [2 /*return*/, true];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
// 建立preloader与sw的通信
function createMessageChannel(worker, appUrl) {
    window.addEventListener('message', function (event) {
        event.data;
        // const { type, data } = eventData;
        // console.log('message from window', eventData);
        // // service worker的通讯，传递给preloader
        // worker.postMessage({
        //     type: 'PRELOADER:' + type,
        //     data,
        // });
    });
    worker.addEventListener('message', function (event) {
        var _a, _b, _c, _d;
        console.log('message from worker', event);
        var eventData = event.data;
        var type = eventData.type, data = eventData.data;
        if (type === 'getcookie') {
            return worker.postMessage({
                type: 'getcookie',
                data: document.cookie,
            });
        }
        // 预加载相关的通讯，传递给service worker
        console.log('navigator?.serviceWorker?.controller', (_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller);
        (_c = (_b = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _b === void 0 ? void 0 : _b.controller) === null || _c === void 0 ? void 0 : _c.postMessage({
            type: 'PRELOADER:' + type,
            data: data,
            appUrl: appUrl,
        });
        (_d = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _d === void 0 ? void 0 : _d.addEventListener('message', function (event) {
            console.log('navigator?.serviceWorker?.controller?.addEven', event);
            var eventData = event.data;
            var type = eventData.type, data = eventData.data; eventData.appUrl;
            // service worker的通讯，传递给preloader
            worker.postMessage({
                type: type === null || type === void 0 ? void 0 : type.replace('PRELOADER:', ''),
                data: data,
            });
        });
    });
}

var registedApps = {};
/**
 * 注册需要预加载的APP
 * @param appUrl
 * @returns
 */
function registerPreloadApp(appUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var manifest, _a, _b, normalScripts, _c, preloadScripts, _d, styles;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (registedApps[appUrl]) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, loadMaifest(appUrl)];
                case 1:
                    manifest = _e.sent();
                    _a = manifest !== null && manifest !== void 0 ? manifest : {}, _b = _a.normalScripts, normalScripts = _b === void 0 ? [] : _b, _c = _a.preloadScripts, preloadScripts = _c === void 0 ? [] : _c, _d = _a.styles, styles = _d === void 0 ? [] : _d;
                    appendPrefetchLink([appUrl]);
                    appendPrefetchLink(styles);
                    appendPrefetchLink(normalScripts);
                    if (preloadScripts.length > 1) {
                        console.warn('preload script must be one');
                    }
                    else if (preloadScripts.length === 1) {
                        runAppPreloadScript({ scriptUrl: preloadScripts[0], appUrl: appUrl });
                    }
                    else {
                        console.warn("app:".concat(appUrl, " no preload script"));
                    }
                    registedApps[appUrl] = true;
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * 添加预加载的link
 * @param links
 */
function appendPrefetchLink(links) {
    var _a;
    try {
        var fragment_1 = document.createDocumentFragment();
        links.forEach(function (link) {
            if (!link)
                return;
            var linkEl = document.createElement('link');
            linkEl.setAttribute('rel', 'prefetch');
            linkEl.setAttribute('href', link);
            fragment_1.appendChild(linkEl);
        });
        (_a = document === null || document === void 0 ? void 0 : document.head) === null || _a === void 0 ? void 0 : _a.appendChild(fragment_1);
    }
    catch (error) {
        console.log(error);
    }
}

/**
 * PrefetchLinks 组件，用于预加载应用资源
 */
// 加载应用的资源
function PrefetchLinks(props) {
    var appUrl = props.appUrl, children = props.children;
    React.useEffect(function () {
        registerPreloadApp(appUrl);
    }, []);
    return React__default["default"].createElement(React__default["default"].Fragment, null, children);
}

exports.PrefetchLink = PrefetchLinks;
//# sourceMappingURL=index.js.map
