'use client'

import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { usePathname, useRouter } from 'next/navigation'

// The names are message descriptors, so the switcher is translated as well.
// Keep this in sync with `locales` in lingui.config.ts.
const languages = {
  en: msg`English`,
  sr: msg`Serbian`,
  es: msg`Spanish`,
  pseudo: msg`Pseudo`
}

export function Switcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { i18n } = useLingui()

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // Swap the locale segment and keep the rest of the path, e.g.
    // /en/about -> /es/about
    const segments = (pathname ?? '').split('/')
    segments[1] = event.target.value
    router.push(segments.join('/'))
  }

  return (
    <select value={i18n.locale} onChange={handleChange}>
      {Object.entries(languages).map(([locale, name]) => (
        <option value={locale} key={locale}>
          {i18n._(name)}
        </option>
      ))}
    </select>
  )
}
