import 'server-only'

import { notFound } from 'next/navigation'
import { I18n, Messages, setupI18n } from '@lingui/core'
import linguiConfig from '../lingui.config'

const { locales } = linguiConfig

async function loadCatalog(locale: string): Promise<[string, Messages]> {
  const { messages } = await import(`./locales/${locale}.po`)
  return [locale, messages]
}

// Every catalog is loaded once, when the server starts.
const allMessages: Record<string, Messages> = Object.fromEntries(
  await Promise.all(locales.map(loadCatalog))
)

// One I18n instance per locale. Requests for different locales are handled
// concurrently on the server, so they must never share a single instance.
const allI18nInstances: Record<string, I18n> = Object.fromEntries(
  locales.map((locale) => [
    locale,
    setupI18n({ locale, messages: { [locale]: allMessages[locale]! } })
  ])
)

export function getI18nInstance(locale: string): I18n {
  const i18n = allI18nInstances[locale]
  // The proxy only lets known locales through, so this is a safety net
  if (!i18n) notFound()
  return i18n
}
