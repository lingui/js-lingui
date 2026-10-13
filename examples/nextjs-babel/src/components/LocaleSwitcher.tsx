import type { ChangeEvent } from "react"
import { useRouter } from "next/router"
import type { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { useLingui } from "@lingui/react"

// The names are message descriptors, so the switcher is translated as well.
// Keep this in sync with `i18n.locales` in next.config.ts.
const languages: Record<string, MessageDescriptor> = {
  en: msg`English`,
  cs: msg`Czech`,
  pseudo: msg`Pseudo`,
}

export function LocaleSwitcher() {
  const router = useRouter()
  const { i18n } = useLingui()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const { pathname, query, asPath } = router
    // Next.js adds the locale prefix itself. `getStaticProps` runs again for
    // the new locale and `_app` receives its catalog.
    router.push({ pathname, query }, asPath, { locale: event.target.value })
  }

  return (
    <select value={i18n.locale} onChange={handleChange}>
      {router.locales?.map((locale) => (
        <option key={locale} value={locale}>
          {i18n._(languages[locale] ?? locale)}
        </option>
      ))}
    </select>
  )
}
