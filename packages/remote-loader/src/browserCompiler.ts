import { compileMessage } from "@lingui/core"

export function createBrowserCompiledCatalog(messages: Record<string, any>) {
  return Object.keys(messages).reduce((obj, key: string) => {
    const value = messages[key]

    // If the current ID's value is a context object, create a nested
    // expression, and assign the current ID to that expression
    if (typeof value === "object") {
      obj[key] = Object.keys(value).reduce((obj, contextKey) => {
        obj[contextKey] = compileMessage(value[contextKey])
        return obj
      }, {})

      return obj
    }

    const translation = value || key

    obj[key] = compileMessage(translation)
    return obj
  }, {})
}
