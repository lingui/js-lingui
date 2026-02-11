import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import "./index.css"
import { setupI18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { loadCatalog } from "./i18n"

const i18n = setupI18n()
await loadCatalog("en", i18n)

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </React.StrictMode>,
)
