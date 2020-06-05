import { i18n } from "@lingui/core"
import { en, ru } from "make-plural/plurals"

i18n.loadLocaleData("en", { plurals: en })
// Using actually Russian translations instead of Cs, just for demo purpose
i18n.loadLocaleData("cs", { plurals: ru })

export const locales = {
  en: "English",
  cs: "Česky",
}

export async function activate(locale) {
  const { messages } = await import(
    /* webpackChunkName: "i18n-[index]" */ `@lingui/loader!./locales/${locale}.json`
  )

  i18n.load(locale, messages)
  i18n.activate(locale)
}

activate("en")
