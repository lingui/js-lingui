import { Fragment, useEffect } from "react"

import { I18nProvider, useLingui } from "@lingui/react"
import { i18n } from "@lingui/core"
import { activate } from "../utils/i18n"

export default function Page({ Component, pageProps }) {
  useEffect(() => {
    activate("cs")
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <I18nWatchLocale>
        <Component {...pageProps} />
      </I18nWatchLocale>
    </I18nProvider>
  )
}

function I18nWatchLocale({ children }) {
  const { i18n } = useLingui()

  // Skip render when locale isn't loaded
  if (!i18n.locale) return null

  // Force re-render when locale changes. Otherwise string translations (e.g.
  // t`Macro`) won't be updated.
  return <Fragment key={i18n.locale}>{children}</Fragment>
}
