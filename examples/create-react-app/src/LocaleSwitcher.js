import * as React from "react"

import { useLingui } from "@lingui/react"
import { locales } from "./i18n.config"
import "./LocaleSwitcher.css"

export function LocaleSwitcher() {
  const { i18n } = useLingui()

  return (
    <ul className="LocaleSwitcher">
      {Object.keys(locales).map(locale => (
        <li key={locale}>
          <button onClick={() => i18n.activate(locale)} className="Locale">
            {locales[locale]}
          </button>
        </li>
      ))}
    </ul>
  )
}
