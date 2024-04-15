export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18nContext } from "./I18nProvider"
import { getI18n } from "./server"

export { TransRsc as Trans } from "./TransRsc"

export function useLingui(): I18nContext {
  const ctx = getI18n()
  if (!ctx?.current) {
    throw new Error(
      "You tried to use `useLingui` in a Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in the root of your page."
    )
  }

  return ctx.current
}
