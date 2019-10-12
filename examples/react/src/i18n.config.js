import { i18n } from "@lingui/core"

export const defaultLocale = "en"

export const locales = {
  en: "English",
  cs: "Česky"
}

export async function activate(locale) {
  /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
  const catalog = await import(`@lingui/loader!./locales/${locale}.po`)

  i18n.load(locale, catalog)
  i18n.activate(locale)
}

activate(defaultLocale)
