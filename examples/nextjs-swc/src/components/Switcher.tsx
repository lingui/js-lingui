import { useRouter } from 'next/router'
import { useState } from 'react'
import { t, msg } from '@lingui/core/macro'
import { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react'

type LOCALES = 'en' | 'sr' | 'es' | 'pseudo'

const languages: { [key: string]: MessageDescriptor } = {
  en: msg`English`,
  sr: msg`Serbian`,
  es: msg`Spanish`
}

export function Switcher() {
  const router = useRouter()
  const { i18n } = useLingui()

  const [locale, setLocale] = useState<LOCALES>(
    router.locale!.split('-')[0] as LOCALES
  )

  // disabled for DEMO - so we can demonstrate the 'pseudo' locale functionality
  // if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
  //   languages['pseudo'] = t`Pseudo`
  // }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as LOCALES

    setLocale(locale)
    router.push(router.pathname, router.pathname, { locale })
  }

  return (
    <select value={locale} onChange={handleChange}>
      {Object.keys(languages).map((locale) => {
        return (
          <option value={locale} key={locale}>
            {i18n._(languages[locale as unknown as LOCALES])}
          </option>
        )
      })}
    </select>
  )
}
