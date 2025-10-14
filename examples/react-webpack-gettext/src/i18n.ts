import { i18n } from "@lingui/core"

export const locales = {
  en: "English",
  cs: "Česky",
}
export const defaultLocale = "en"

// Extend window to include our compiled translations namespace
declare global {
  interface Window {
    i18n?: Record<string, any>
  }
}

/**
 * Activate locale using compiled JS files loaded from script tags
 * Will retry if translations are not available yet
 * @param locale any locale string
 * @param retryCount current retry attempt (for internal use)
 * @param maxRetries maximum number of retries before giving up
 */
export function dynamicActivate(locale: string, retryCount: number = 0, maxRetries: number = 10) {
  // Get messages from the global namespace set by compiled JS files
  i18n.loadAndActivate({ locale, messages: [] })
  const messages = window.i18n?.messages
  
  if (messages) {
    i18n.loadAndActivate({ locale, messages })
  } else if (retryCount < maxRetries) {
    // Translations not loaded yet, retry after a short delay
    console.log(`Translations not ready for locale ${locale}, retrying... (${retryCount + 1}/${maxRetries})`)
    setTimeout(() => {
      dynamicActivate(locale, retryCount + 1, maxRetries)
    }, 1000) // Wait 100ms before retrying
  } else {
    console.warn(`No translations found for locale: ${locale} after ${maxRetries} retries`)
  }
}
