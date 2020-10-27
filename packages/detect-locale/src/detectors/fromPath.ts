import { LocaleString } from "../"

export default function detectFromPath(
  localePathIndex: number,
  location: Partial<Location> = globalThis.location,
): LocaleString {
  const locale: RegExpMatchArray = location.pathname.match(/\/([a-zA-Z-]*)/g)
  if (Array.isArray(locale)) {
    return locale[localePathIndex].replace("/", "")
  }

  return null
}