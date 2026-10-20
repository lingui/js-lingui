import React, { useMemo, useState } from "react"
import { Trans, Plural } from "@lingui/react/macro"
import { locales, dynamicActivate } from "./i18n"
import { useLingui } from "@lingui/react"
import { plural } from "@lingui/core/macro"
import "./App.css"

function App() {
  const [count, setCount] = useState(0)
  const { i18n } = useLingui()

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.locale),
    [i18n.locale],
  )
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.locale, {
        style: "currency",
        currency: "EUR",
      }),
    [i18n.locale],
  )

  return (
    <div className="App">
      <header className="App-header">
        <img
          className="App-logo"
          src="https://avatars3.githubusercontent.com/u/11225539?s=200&v=4"
          alt="Lingui Logo"
        />
        <h1>
          <Trans>React Webpack Po-Gettext Example</Trans>
        </h1>

        <h3>
          <Trans>Language switcher example:</Trans>
        </h3>
        <div className="lang-container">
          {Object.values(locales).map((locale, index) => (
            <button
              type="button"
              onClick={() => dynamicActivate(Object.keys(locales)[index])}
              key={locale}
            >
              {locale}
            </button>
          ))}
        </div>

        <h3>
          <Trans>Plurals example:</Trans>
        </h3>
        <div className="lang-container">
          <button type="button" onClick={() => setCount((state) => state + 1)}>
            <Trans>Increment</Trans>
          </button>
          <button type="button" onClick={() => setCount((state) => state - 1)}>
            <Trans>Decrement</Trans>
          </button>
        </div>

        <div>
          <Plural
            value={count}
            one={"There's one book"}
            other={"There are # books"}
          />
        </div>

        <div>
          {plural(count, {
            one: "one book",
            other: "many books",
          })}
        </div>

        <h3>
          <Trans>Date formatter example:</Trans>
        </h3>
        <div>
          <Trans>Today is {dateFormatter.format(new Date())}</Trans>
        </div>

        <h3>
          <Trans>Number formatter example:</Trans>
        </h3>
        <div>
          <Trans>
            I have a balance of {currencyFormatter.format(1_000_000)}
          </Trans>
        </div>
      </header>
    </div>
  )
}

export default App
