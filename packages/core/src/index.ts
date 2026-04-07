export { setupI18n, I18n } from "./i18n"

export type {
  AllMessages,
  MessageDescriptor,
  MessagePlaceholderValue,
  MessageValue,
  Messages,
  Locale,
  Locales,
  MessageOptions,
  Values,
} from "./i18n"

// Default i18n object
import { setupI18n } from "./i18n"
export const i18n = setupI18n()

import * as formats from "./formats"
export { formats }
