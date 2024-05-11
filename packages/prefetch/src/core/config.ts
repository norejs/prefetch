// @ts-expect-error
const _global =
  typeof global !== "undefined"
    ? global
    : typeof window !== "undefined"
    ? window
    : ({} as any);
const __PREFETCH__ = _global.__PREFETCH_ || ((_global.__PREFETCH_ = {}) as any);
export default __PREFETCH__;
