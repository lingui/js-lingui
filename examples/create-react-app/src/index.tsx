import React, { useEffect } from "react"
import "./index.css"
import App from "./App"
import * as serviceWorker from "./serviceWorker"

import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { defaultLocale, dynamicActivate } from "./i18n"
import * as ReactDOMClient from "react-dom/client"

const I18nApp = () => {
  useEffect(() => {
    // With this method we dynamically load the catalogs
    dynamicActivate(defaultLocale)
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  )
}

ReactDOMClient.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <I18nApp />
  </React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
