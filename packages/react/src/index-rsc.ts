export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18nContext } from "./I18nProvider"
import { getI18nOrThrow } from "./server"

export { TransRsc as Trans } from "./TransRsc"

export function useLingui(): I18nContext {
  return getI18nOrThrow()
}
