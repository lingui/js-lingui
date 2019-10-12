import * as React from "react"

import { locales, activate } from "./i18n.config"
import "./LocaleSwitcher.css"

export function LocaleSwitcher() {
  return (
    <ul className="LocaleSwitcher">
      {Object.keys(locales).map(locale => (
        <li key={locale}>
          <button onClick={() => activate(locale)} className="Locale">
            {locales[locale]}
          </button>
        </li>
      ))}
    </ul>
  )
}
