import setupWorker from './setup';

// import setupWorker from "./setup";
declare var self: ServiceWorkerGlobalScope;

function main() {
    try {
        setupWorker({
            apiMatcher: /\/restapi\/restapi\//,
        });
    } catch (e) {
        console.error(e);
        self.registration.unregister();
    }
}
main();
