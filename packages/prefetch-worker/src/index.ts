import setupWorker from "./setup";
import { tripRequestToKey } from "./utils/trip";

// import setupWorker from "./setup";
declare var self: ServiceWorkerGlobalScope;

function main() {
  try {
    setupWorker({
      apiMatcher: /\/restapi\/restapi\//,
      requestToKey: tripRequestToKey,
      debug: /(\.fat|\.fws|localhost)/.test(self.location.host),
    });
  } catch (e) {
    console.error(e);
    self.registration.unregister();
  }
}
main();
