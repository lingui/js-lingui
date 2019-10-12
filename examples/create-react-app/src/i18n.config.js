import { i18n } from "@lingui/core"

export const locales = {
  en: "English",
  cs: "Česky"
}

export async function activate(locale) {
  const catalog = await import(
    /* webpackChunkName: "i18n-[index]" */ `@lingui/loader!./locales/${locale}.po`
  )

  i18n.load(locale, catalog)
  i18n.activate(locale)
}

activate("en")
