import { i18n } from "@lingui/core"

export async function activate(locale) {
  const catalog = await import(`../locale/${locale}/messages.js`)
  i18n.loadLocaleData(locale, catalog.localeData)
  i18n.load(locale, catalog.messages)
  i18n.activate(locale)
}
