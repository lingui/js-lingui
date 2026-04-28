import type { I18n, Messages } from "@lingui/core";

import Locale from "./locales";

type CatalogModule = {
  messages: Messages;
};

const catalogs: Record<Locale, () => Promise<CatalogModule>> = {
  [Locale.ENGLISH]: () => import("./locales/en/messages.po"),
  [Locale.FRENCH]: () => import("./locales/fr/messages.po"),
};

export async function loadCatalog(locale: Locale) {
  const { messages } = await catalogs[locale]();

  return messages;
}

export async function dynamicActivate(i18n: I18n, locale: Locale) {
  const messages = await loadCatalog(locale);

  i18n.loadAndActivate({ locale, messages });
}
