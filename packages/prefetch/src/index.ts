import setup from "./core/setup";
import { serviceWorkerUrl, scope } from "./constants";

export { default as PrefetchLink } from "./react/PrefetchLink";
export { default as preRequest } from "./core/preRequest";
export { headName, expireTimeHeadName } from "./constants";
export { default as runPreload } from "./core/runAppPreloadScript";

function main() {
  try {
    setup({
      serviceWorkerUrl,
      scope,
    });
  } catch (error) {}
}
main();
