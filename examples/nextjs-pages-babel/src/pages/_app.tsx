import { I18nProvider } from "@lingui/react"
import { i18n } from "@lingui/core"

import "../styles.css"
import { useLinguiInit } from "../i18n"
import { AppProps } from "next/app"

export default function MyApp({ Component, pageProps }: AppProps) {
  useLinguiInit(pageProps.translation)

  return (
    <>
      <I18nProvider i18n={i18n}>
        <Component {...pageProps} />
      </I18nProvider>
    </>
  )
}
