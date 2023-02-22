import { compileMessage } from "@lingui/core/compile"

export function createBrowserCompiledCatalog(messages: Record<string, any>) {
  return Object.keys(messages).reduce((obj, key: string) => {
    const value = messages[key]

    const translation = value || key

    obj[key] = compileMessage(translation)
    return obj
  }, {})
}
