import React from "react"
import logo from "./logo.svg"
import { I18nProvider, useLingui } from "@lingui/react"
import { Trans, t } from "@lingui/macro"

import { i18n } from "./i18n.config"
import { LocaleSwitcher } from "./LocaleSwitcher"
import "./App.css"

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Content />
    </I18nProvider>
  )
}

function Content() {
  const { i18n } = useLingui()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt={i18n._(t`logo`)} />
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
  )
}

export default App
