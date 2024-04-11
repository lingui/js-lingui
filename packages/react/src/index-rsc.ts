export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18nContext } from "./I18nProvider"
import { getI18n } from "./server"

export { TransRsc as Trans } from "./TransRsc"

export function useLingui(): I18nContext {
  const i18n = getI18n()
  if (!i18n) {
    throw new Error(
      "You tried to use `useLingui` in Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in root of your page"
    )
  }

  return {
    i18n,
    _: i18n.t.bind(i18n),
  }
}
