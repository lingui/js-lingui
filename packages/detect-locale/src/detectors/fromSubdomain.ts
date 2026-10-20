import { LocaleString } from "../"

export default function detectFromSubdomain(
  localeSubdomainIndex: number,
  location: Partial<Location> = globalThis.location,
): LocaleString {
  // Only the host can contain subdomains. Dots in the path or query string
  // (e.g. "/files/report.v2.pdf") must not be treated as subdomain separators.
  const host = location.href
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, "")
    .split(/[/?#]/)[0]
    .replace(/^.*@/, "")
    .replace(/:\d*$/, "")

  const locale: RegExpMatchArray = host.match(/(.*?)\.(?=.*\..{2,5})/g)
  if (Array.isArray(locale) && locale[localeSubdomainIndex]) {
    return locale[localeSubdomainIndex].replace(".", "")
  }

  return null
}
