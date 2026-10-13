import type { AppProps } from "next/app"
import { I18nProvider } from "@lingui/react"

import "../styles.css"
import { useLinguiInit } from "../i18n"

export default function MyApp({ Component, pageProps }: AppProps) {
  const i18n = useLinguiInit(pageProps.translation)

  return (
    <I18nProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nProvider>
  )
}
