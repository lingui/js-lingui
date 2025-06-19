import {
  getHeaders,
  getWebRequest,
  setHeader,
} from "@tanstack/react-start/server"
import { parse, serialize } from "cookie-es"

import { defaultLocale, dynamicActivate, isLocaleValid } from "./i18n"
import type { I18n } from "@lingui/core"

function getLocaleFromRequest() {
  const request = getWebRequest()
  const headers = getHeaders()
  const cookie = parse(headers.cookie ?? "")

  const url = new URL(request.url)
  const queryLocale = url.searchParams.get("locale") ?? ""

  if (isLocaleValid(queryLocale)) {
    setHeader(
      "Set-Cookie",
      serialize("locale", queryLocale, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      })
    )

    return queryLocale
  }

  if (cookie.locale && isLocaleValid(cookie.locale)) {
    return cookie.locale
  }

  // Mostly used for API requests
  if (headers["accept-language"] && isLocaleValid(headers["accept-language"])) {
    return headers["accept-language"]
  }

  setHeader(
    "Set-Cookie",
    serialize("locale", defaultLocale, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
  )

  return defaultLocale
}

export async function setupLocaleFromRequest(i18n: I18n) {
  await dynamicActivate(i18n, getLocaleFromRequest())
}
