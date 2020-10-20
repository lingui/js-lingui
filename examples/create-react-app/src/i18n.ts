import { setupI18n } from "@lingui/core";
import { messages as messagesEn } from "./locales/en/messages"
import { messages as messagesCs } from "./locales/cs/messages"

import { en, cs } from 'make-plural/plurals'

export const locales = {
  en: "English",
  cs: "Česky",
};

export const defaultLocale = "en";

export const i18n = setupI18n();
i18n.load({
  en: messagesEn,
  cs: messagesCs,
});
i18n.loadLocaleData({
  en: { plurals: en },
  cs: { plurals: cs },
})
