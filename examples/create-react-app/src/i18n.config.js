import { i18n } from "@lingui/core"

export const locales = {
  en: "English",
  cs: "Česky",
}

export async function activate(locale) {
  const catalog = await import(
    /* webpackChunkName: "i18n-[index]" */ `@lingui/loader!./locales/${locale}.po`
  )

  i18n.loadLocaleData(locale, catalog.localeData)
  i18n.load(locale, catalog.messages)
  i18n.activate(locale)
}

activate("en")
