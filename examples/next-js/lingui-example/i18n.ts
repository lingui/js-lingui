import { i18n } from "@lingui/core"

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function activate(locale: string) {
  const { messages } = await import(`../locale/${locale}/messages.po`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}
