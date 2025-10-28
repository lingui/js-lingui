import { parse, serialize } from "cookie-es"

import { defaultLocale, isLocaleValid } from "./i18n"

export function getLocaleFromRequest(request: Request) {
  const headers = request.headers

  const url = new URL(request.url)
  const queryLocale = url.searchParams.get("locale") ?? ""

  if (isLocaleValid(queryLocale)) {
    return { locale: queryLocale, headers: [{
      key: "Set-Cookie",
      value: serialize("locale", queryLocale, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      })
    }]}
  }

  const cookie = parse(headers.get('cookie') ?? "")
  if (cookie.locale && isLocaleValid(cookie.locale)) {
    return { locale: cookie.locale }
  }

  // Mostly used for API requests
  const acceptedLanguage = headers.get("accept-language") ?? ""
  if (acceptedLanguage && isLocaleValid(acceptedLanguage)) {
    return { locale: acceptedLanguage }
  }

  return{ locale: defaultLocale, headers: [{
      key: "Set-Cookie",
      value: serialize("locale", defaultLocale, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      })
    }]}
}
