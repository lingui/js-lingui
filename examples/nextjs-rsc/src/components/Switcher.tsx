'use client'

import { useRouter, useParams } from 'next/navigation'
import { t, msg } from '@lingui/macro'
import { MessageDescriptor } from '@lingui/core/src'
import { useLingui } from '@lingui/react'

type LOCALES = 'en' | 'sr' | 'es' | 'pseudo'

const languages: { [key: string]: MessageDescriptor } = {
  en: msg`English`,
  sr: msg`Serbian`,
  es: msg`Spanish`
}

export function LocaleSwitcher() {
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const { i18n } = useLingui()
  const currentLocale = locale!.split('-')[0]

  // disabled for DEMO - so we can demonstrate the 'pseudo' locale functionality
  // if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
  //   languages['pseudo'] = t`Pseudo`
  // }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as LOCALES
    router.push(`/${locale}`)
  }

  return (
    <select value={currentLocale} onChange={handleChange}>
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
