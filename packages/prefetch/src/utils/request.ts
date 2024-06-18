/* eslint-disable @typescript-eslint/no-var-requires */
import { isNode } from "@/core/env";

export async function get(url: string): Promise<any> {
  try {
    let res = null;
    if (isNode) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fetch = require("node-fetch");
      res = await fetch(url);
    } else {
      res = await fetch(url);
    }

    if (res?.status !== 200) {
      return null;
    }
    res = await res?.text?.();
    try {
      res = JSON.parse(res);
    } catch (error) {}
    return res;
  } catch (error) {
    console.error("get error", error);
    return null;
  }
}
