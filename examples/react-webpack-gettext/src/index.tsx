import React, { useEffect } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { defaultLocale, dynamicActivate } from "./i18n"

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

const container = document.getElementById("root")
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <I18nApp />
  </React.StrictMode>
)
