import { createApp, h } from "vue"
import { I18nProvider } from "@lingui/vue"
import { setupI18n } from "@lingui/core"
import App from "./App.vue"
import "./index.css"
import { loadCatalog } from "./i18n"

const i18n = setupI18n()
await loadCatalog("en", i18n)

createApp({
  render: () => h(I18nProvider, { i18n }, { default: () => h(App) }),
}).mount("#app")
