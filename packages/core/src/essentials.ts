export const isString = (s: unknown): s is string => typeof s === "string"
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isFunction = (f: unknown): f is Function => typeof f === "function"
