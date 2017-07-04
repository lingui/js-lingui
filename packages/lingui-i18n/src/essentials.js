// @flow

export const isString = (s: any) => typeof s === 'string'
export const isFunction = (f: any) => typeof f === 'function'
export function isEmpty (obj: any) {
  // null and undefined are "empty"
  if (obj === null) return true

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false
  if (obj.length === 0) return true

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object') return true

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) return false
  }

  return true
}
