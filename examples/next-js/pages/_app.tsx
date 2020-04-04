import { useEffect } from "react"

import { I18nProvider } from "@lingui/react"
import { i18n } from "@lingui/core"

import { activate } from "../utils/i18n"

export default function Page({ Component, pageProps }) {
  useEffect(() => {
    activate("cs")
  }, [])

  return (
    // @ts-ignore
    <I18nProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nProvider>
  )
}
