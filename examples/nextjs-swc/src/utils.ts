import { i18n, Messages } from '@lingui/core'
import { useRouter } from 'next/router'

export async function loadCatalog(locale: string) {
  const catalog = await import(`@lingui/loader!./locales/${locale}.po`)
  return catalog.messages
}

export function useLinguiInit(messages: Messages) {
  const router = useRouter()
  const locale = router.locale || router.defaultLocale!
  i18n.loadAndActivate(locale, messages, false)

  return i18n
}
