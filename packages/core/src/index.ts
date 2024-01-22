export { setupI18n, I18n } from "./i18n"

export * from './i18n.t';

export type {
  AllMessages,
  Messages,
  AllLocaleData,
  LocaleData,
  Locale,
  Locales,
} from "./i18n"

// Default i18n object
import { setupI18n } from "./i18n"
export const i18n = setupI18n()

import * as formats from "./formats"
export { formats }
