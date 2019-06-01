import { setupI18n } from "@lingui/core"

export const defaultLocale = "en"

export const locales = {
  en: "English",
  cs: "Česky"
}

async function loadCatalog(locale) {
  /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
  const catalog = await import(`@lingui/loader!./locales/${locale}/messages.po`)
  i18n.load(locale, catalog)
}

export const i18n = setupI18n()
i18n.on("activate", loadCatalog)
i18n.activate(defaultLocale)
