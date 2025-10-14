import { i18n } from "@lingui/core"

export const locales = {
  en: "English",
  cs: "Česky",
}
export const defaultLocale = "cs"

export function dynamicActivate(locale: string) {
    fetch(`locales/${locale}.json`).then(response => response.json()).then(data => {
        console.log(`Loaded translations for ${locale}:`, data);
        i18n.load(locale, data)
        i18n.activate(locale)
    }).catch(error => {
        console.error('Failed to load translations:', error);
    });
}
