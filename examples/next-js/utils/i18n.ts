import { i18n } from "@lingui/core"

export async function activate(locale) {
  const catalog = await import(`../locale/${locale}/messages.js`)
  await i18n.load(locale, catalog)
  await i18n.activate(locale)
}
