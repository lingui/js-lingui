import { setupI18n } from "@lingui/core";
import { en, cs } from 'make-plural/plurals'

export const locales = {
  en: "English",
  cs: "Česky",
};
export const defaultLocale = "en";
export const i18n = setupI18n();

i18n.loadLocaleData({
  en: { plurals: en },
  cs: { plurals: cs },
})

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./locales/${locale}/messages`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}

// If not we can just load all the catalogs and do a simple i18n.active(localeToActive)
// i18n.load({
//   en: messagesEn,
//   cs: messagesCs,
// });
