import 'server-only'

import linguiConfig from '../lingui.config'
import { I18n, Messages, setupI18n } from '@lingui/core'

const { locales } = linguiConfig
// optionally use a stricter union type
type SupportedLocales = string

async function loadCatalog(locale: SupportedLocales): Promise<{
  [k: string]: Messages
}> {
  const { messages } = await import(`./locales/${locale}.po`)
  return {
    [locale]: messages
  }
}
const catalogs = await Promise.all(locales.map(loadCatalog))

// transform array of catalogs into a single object
export const allMessages = catalogs.reduce((acc, oneCatalog) => {
  return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = { [K in SupportedLocales]: I18n }

export const allI18nInstances: AllI18nInstances = locales.reduce(
  (acc, locale) => {
    const messages = allMessages[locale] ?? {}
    const i18n = setupI18n({
      locale,
      messages: { [locale]: messages }
    })
    return { ...acc, [locale]: i18n }
  },
  {}
)
