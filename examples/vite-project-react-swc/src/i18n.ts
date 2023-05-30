import { i18n } from "@lingui/core"

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function loadCatalog(locale: string) {
  const { messages } = await import(`./locales/${locale}.po`)
  i18n.loadAndActivate({ locale, messages })
}
