import React from "react"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"

import { LocaleSwitcher } from "./LocaleSwitcher"
import "./App.css"
import Test from "./Test"

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <div className="App">
        <header className="App-header">
          <Test />

          <LocaleSwitcher />
        </header>
      </div>
    </I18nProvider>
  )
}

export default App
