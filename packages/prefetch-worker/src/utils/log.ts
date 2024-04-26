const noop = () => {};
export const createLogger = (debug = false) => ({
  info: debug ? console.log : noop,
  warn: debug ? console.warn : noop,
  error: debug ? console.error : noop,
});
