const promiseMap = new WeakMap<Function, Promise<void>>();
export function flightSingle(fn: (...args: any[]) => Promise<void>) {
    return async (...args: any[]) => {
        if (promiseMap.has(fn)) {
            return promiseMap.get(fn)!;
        }
        const promise = fn(...args).finally(() => {
            promiseMap.delete(fn);
        });
        promiseMap.set(fn, promise);
        return promise;
    };
}
