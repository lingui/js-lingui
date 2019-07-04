import React from "react"
import logo from "./logo.svg"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { Trans, t } from "@lingui/macro"

import { LocaleSwitcher } from "./LocaleSwitcher"
import "./App.css"

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt={t`logo`} />
          <p>
            <Trans>
              Edit <code>src/App.js</code> and save to reload.
            </Trans>
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Learn React</Trans>
          </a>

          <LocaleSwitcher />
        </header>
      </div>
    </I18nProvider>
  )
}

export default App
