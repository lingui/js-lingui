import { render } from "solid-js/web"
import { I18nProvider } from "@lingui/solid"
import { setupI18n } from "@lingui/core"
import { App } from "./App"
import "./index.css"
import { loadCatalog } from "./i18n"

const i18n = setupI18n()
await loadCatalog("en", i18n)

render(
  () => (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  ),
  document.getElementById("root") as HTMLElement,
)
