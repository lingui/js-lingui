export const isString = (s): s is string => typeof s === "string"
export const isFunction = (f): f is Function => typeof f === "function"
export function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj === null || obj === undefined) return true

  if (obj.length > 0) return false
  if (obj.length === 0) return true

  return !Object.getOwnPropertyNames(obj).length
}
