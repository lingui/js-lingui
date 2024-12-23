import { i18n, Messages } from '@lingui/core'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export async function loadCatalog(locale: string) {
  const catalog = await import(`./locales/${locale}.po`)
  return catalog.messages
}

export function useLinguiInit(messages: Messages) {
  const isClient = typeof window !== 'undefined'
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] ?? 'en'

  if (!isClient && locale !== i18n.locale) {
    // there is single instance of i18n on the server
    // note: on the server, we could have an instance of i18n per supported locale
    // to avoid calling loadAndActivate for (worst case) each request, but right now that's what we do
    i18n.loadAndActivate({ locale, messages })
  }
  if (isClient && !i18n.locale) {
    // first client render
    i18n.loadAndActivate({ locale, messages })
  }

  useEffect(() => {
    const localeDidChange = locale !== i18n.locale
    if (localeDidChange) {
      i18n.loadAndActivate({ locale, messages })
    }
  }, [locale])

  return i18n
}
