import { i18n } from "@lingui/core";
import { en, cs } from 'make-plural/plurals'

export const locales = {
  en: "English",
  cs: "Česky",
};
export const defaultLocale = "en";

i18n.loadLocaleData({
  en: { plurals: en },
  cs: { plurals: cs },
})

async function importMessages(locale: string) {
  /* eslint-disable import/no-webpack-loader-syntax */
  switch (locale) {
    case "cs":
      // @ts-ignore
      return await import("messages.js!=!@lingui/loader!./locales/cs/messages.po")
    case "en":
    default:
      // @ts-ignore
      return await import("messages.js!=!@lingui/loader!./locales/en/messages.po")
  }
  /* eslint-enable */
}

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale: string) {
  const { messages } = await importMessages(locale)
  i18n.load(locale, messages)
  i18n.activate(locale)
}

// If not we can just load all the catalogs and do a simple i18n.active(localeToActive)
// i18n.load({
//   en: messagesEn,
//   cs: messagesCs,
// });
