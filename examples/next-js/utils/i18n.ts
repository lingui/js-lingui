import { i18n } from "@lingui/core"
import { en, cs } from "make-plural/plurals"

i18n.loadLocaleData("en", { plurals: en })
i18n.loadLocaleData("cs", { plurals: cs })

export async function activate(locale: string) {
  const { messages } = await import(`../locale/${locale}/messages.js`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}
