import { setupI18n } from "@lingui/core"

export const locales = {
  en: "English",
  cs: "Česky"
}

async function loadCatalog(locale) {
  const catalog = await import(
    /* webpackChunkName: "i18n-[index]" */ `@lingui/loader!./locales/${locale}.po`
  )
  i18n.load(locale, catalog)
}

export const i18n = setupI18n()
i18n.on("activate", loadCatalog)
i18n.activate("en")
