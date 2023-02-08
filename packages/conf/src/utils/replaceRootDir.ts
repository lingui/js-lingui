import { LinguiConfig } from "../types"

export function replaceRootDir<T extends Partial<LinguiConfig>>(
  config: T,
  rootDir: string
): T {
  return (function replaceDeep(value: any, rootDir: string): any {
    const replace = (s: string) => s.replace("<rootDir>", rootDir)

    if (value == null) {
      return value
    } else if (typeof value === "string") {
      return replace(value)
    } else if (Array.isArray(value)) {
      return value.map((item) => replaceDeep(item, rootDir))
    } else if (typeof value === "object") {
      Object.keys(value).forEach((key) => {
        const newKey = replaceDeep(key, rootDir)
        value[newKey] = replaceDeep(value[key], rootDir)
        if (key !== newKey) delete value[key]
      })
    }

    return value
  })(config, rootDir) as T
}
