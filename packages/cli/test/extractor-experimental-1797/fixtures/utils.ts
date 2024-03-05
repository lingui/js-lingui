import { i18n, Messages } from '@lingui/core'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export async function loadCatalog(locale: string, pathname: string) {
  if (pathname === '_error') {
    return {}
  }
  const catalog = await import(
    `@lingui/loader!./locales/src/pages/${pathname}.page/${locale}.po`
  )
  return catalog.messages
}

export function useLinguiInit(messages: Messages) {
  const router = useRouter()
  const locale = router.locale || router.defaultLocale!
  useState(() => {
    i18n.loadAndActivate({ locale, messages })
  })

  useEffect(() => {
    const localeDidChange = locale !== i18n.locale
    if (localeDidChange) {
      i18n.loadAndActivate({ locale, messages })
    }
  }, [locale, messages])

  return i18n
}
