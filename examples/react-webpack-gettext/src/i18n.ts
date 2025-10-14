import { i18n } from "@lingui/core"

export const locales = {
  en: "English",
  cs: "Česky",
}
export const defaultLocale = "en"

// Extend window to include our compiled translations namespace
declare global {
  interface Window {
    i18njs?: Record<string, any>
  }
}

/**
 * Activate locale using compiled JS files loaded from script tags
 * @param locale any locale string
 */
export function dynamicActivate(locale: string) {
  // Get messages from the global namespace set by compiled JS files
  const messages = window.i18njs?.[locale]
  
  if (messages) {
    i18n.loadAndActivate({ locale, messages })
  } else {
    console.warn(`No translations found for locale: ${locale}`)
  }
}
