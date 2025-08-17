import setupWorker from './setup';

// import setupWorker from "./setup";
declare var self: ServiceWorkerGlobalScope;

function main() {
    console.log('main');
    try {
        setupWorker({
            // TODO: 需要支持配置
            apiMatcher: /\/api\//,
        });
    } catch (e) {
        console.error(e);
        self.registration.unregister();
    }
    
}
main();
