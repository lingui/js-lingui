import { LocaleString } from "../"

export default function detectFromSubdomain(
  localeSubdomainIndex: number,
  location: Partial<Location> = globalThis.location,
): LocaleString {
  const locale: RegExpMatchArray = location.href.match(
    /(?:http[s]*:\/\/)*(.*?)\.(?=[^/]*\..{2,5})/gi,
  )
  if (Array.isArray(locale)) {
    return locale[localeSubdomainIndex]
      .replace("http://", "")
      .replace("https://", "")
      .replace(".", "")
  }

  return null
}
