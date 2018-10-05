import { setupI18n } from "@lingui/react"

export const locales = {
  en: "English",
  cs: "Česky"
}

function loadCatalog(locale) {
  return import(`@lingui/loader!./locales/${locale}/messages.po`)
}

export const i18n = setupI18n()
i18n.willActivate(loadCatalog)
i18n.activate("en")
