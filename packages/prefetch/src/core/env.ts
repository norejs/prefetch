export const isDev = process.env.NODE_ENV === "development";
export const isBrowser = typeof window !== "undefined";
export const isNode = Boolean(process);
