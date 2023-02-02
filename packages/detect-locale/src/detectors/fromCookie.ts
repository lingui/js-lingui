import { LocaleString } from ".."
import { getCookie } from "../utils/cookie-getter"

export default function detectFromCookie(key: string): LocaleString {
  return getCookie(key)
}
