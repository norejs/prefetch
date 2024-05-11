// fetch-polyfill.js
const fetch = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  // globalThis.Headers = Headers;
  // globalThis.Request = Request;
  // globalThis.Response = Response;
}

export default fetch;
