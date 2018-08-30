// @flow

export const isString = (s: any): %checks => typeof s === "string"
export const isFunction = (f: any): %checks => typeof f === "function"
export function isEmpty(obj: any): boolean {
  // null and undefined are "empty"
  if (obj === null || obj === undefined) return true

  if (obj.length > 0) return false
  if (obj.length === 0) return true

  return !Object.getOwnPropertyNames(obj).length
}
