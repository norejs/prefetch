export { default as PrefetchLink } from './PrefetchLink';
export * as moduleA from './modulea';
// export { default as ServiceWorker } from './ServiceWorker';
export function unUsedFunction() {
    console.log(Array.from(arguments));
    console.log(Array.isArray(arguments));
    console.log(new Map());
    Object.assign({}, { a: 1 });
    const a = Symbol('111');
    console.log(a);
}
export const unUsedConst = '______unUsedConst_______';
