import { Fragment, useEffect } from "react"

import { I18nProvider, useLingui } from "@lingui/react"
import { i18n } from "@lingui/core"

import { activate } from "lingui-example/i18n"
import "lingui-example/styles.css"

export default function Page({ Component, pageProps }) {
  useEffect(() => {
    // Activate the default locale on page load
    activate("en")
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <I18nWatchLocale>
        <Component {...pageProps} />
      </I18nWatchLocale>
    </I18nProvider>
  )
}

/**
 * Watch for locale changes and force re-render. Otherwise string
 * translations (e.g. using t`Macro`) won't be updated.
 * <Trans>Components</Trans> have access to Lingui context and
 * re-render automatically.
 */
function I18nWatchLocale({ children }) {
  const { i18n } = useLingui()

  // Skip render when locale isn't loaded
  if (!i18n.locale) return null

  // Force re-render by using active locale as an element key.
  return <Fragment key={i18n.locale}>{children}</Fragment>
}
