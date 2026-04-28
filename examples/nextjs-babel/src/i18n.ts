import { setupI18n, Messages } from "@lingui/core"
import { useRouter } from "next/router"
import { useEffect } from "react"

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function loadCatalog(locale: string) {
  const catalog = await import(`./locales/${locale}.po`)
  return catalog.messages
}

export function useLinguiInit(messages: Messages) {
  const router = useRouter()
  const locale = router.locale || router.defaultLocale!

  return setupI18n({
    locale,
    messages: { [locale]: messages}
  })
}
