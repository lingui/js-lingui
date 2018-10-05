import React, { Component } from "react"
import { I18nProvider, I18n } from "@lingui/react"
import { Trans, t } from "@lingui/macro"

import LocaleSwitcher from "./LocaleSwitcher"
import { i18n } from "./i18n"

import logo from "./logo.svg"
import "./App.css"

class App extends Component {
  render() {
    return (
      <I18nProvider i18n={i18n}>
        <div className="App">
          <header className="App-header">
            <I18n>
              {({ i18n }) => (
                <img src={logo} className="App-logo" alt={i18n._(t`logo`)} />
              )}
            </I18n>

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
}

export default App
