import { LinguiConfig } from "../types"

export function replaceRootDir<T extends Partial<LinguiConfig>>(
  config: T,
  rootDir: string | undefined,
): T {
  if (!rootDir) {
    return config
  }
  return (function replaceDeep(value: any, rootDir: string): any {
    const replace = (s: string) => s.replace("<rootDir>", rootDir)

    if (value == null) {
      return value
    } else if (typeof value === "string") {
      return replace(value)
    } else if (Array.isArray(value)) {
      return value.map((item) => replaceDeep(item, rootDir))
    } else if (isPlainObject(value)) {
      // Build a new object instead of mutating `value`: it may be the caller's
      // config or the shared `defaultConfig`, which must stay untouched.
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          replace(key),
          replaceDeep(item, rootDir),
        ]),
      )
    }

    return value
  })(config, rootDir) as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
