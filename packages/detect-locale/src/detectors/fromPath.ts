import { LocaleString } from "../"

export default function detectFromPath(
  localePathIndex: number,
  location: Partial<Location> = globalThis.location,
): LocaleString {
  const locale: RegExpMatchArray = location.pathname.match(/\/([^/]*)/g)
  if (Array.isArray(locale) && locale[localePathIndex]) {
    return locale[localePathIndex].replace("/", "")
  }

  return null
}
