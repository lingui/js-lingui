import { lang } from 'next/root-params'
import { getI18nInstance } from './appRouterI18n'
import { setI18n } from '@lingui/react/server'

/**
 * Reads the locale from the `[lang]` root segment and makes the matching
 * i18n instance available to Server Components for the current request.
 *
 * Call it at the top of every page and layout (and in `generateMetadata`).
 */
export async function initLingui() {
  const i18n = getI18nInstance(await lang())
  setI18n(i18n)
  return i18n
}
