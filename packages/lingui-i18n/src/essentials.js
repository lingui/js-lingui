// @flow

export const isString = (s: any) => typeof s === 'string'
export const isFunction = (f: any) => typeof f === 'function'
export function isEmpty (obj: any) {
  // null and undefined are "empty"
  if (obj === null || obj === undefined) return true

  if (obj.length > 0) return false
  if (obj.length === 0) return true

  return !Object.getOwnPropertyNames(obj).length
}
