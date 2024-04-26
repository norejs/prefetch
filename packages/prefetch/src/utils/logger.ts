import { isDev } from "@/core/env";

function createLogger(debug: boolean) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    info: debug ? console.log : () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    error: debug ? console.error : () => {},
  };
}
const logger = createLogger(isDev);
export default logger;
