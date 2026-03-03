import { parse } from "../utils/query-string"
import { LocaleString } from ".."

export default function detectFromUrl(
  parameter: string,
  location: Partial<Location> = globalThis.location,
): LocaleString {
  if (!parameter) throw new Error("fromUrl parameter is required")

  const result: LocaleString = parse(location.search)[parameter] || null
  return result
}
