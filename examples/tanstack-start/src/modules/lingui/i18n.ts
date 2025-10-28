import { setupI18n, type I18n } from "@lingui/core"

let i18nInstance : I18n | null = null

export function getI18n() {
	if (!i18nInstance) {
		i18nInstance = setupI18n();
	}

	return i18nInstance;
}

export const locales = {
  en: "English",
  fr: "French",
}

export const isLocaleValid = (locale: string) =>
  Object.keys(locales).includes(locale)

export const defaultLocale = "en"

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(i18n: I18n, locale: string) {
  const { messages } = await import(`../../locales/${locale}/messages.po`)
  i18n.loadAndActivate({ locale, messages })
}
