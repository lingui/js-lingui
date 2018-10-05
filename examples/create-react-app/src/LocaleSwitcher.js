import * as React from "react"

import { withI18n } from "@lingui/react"
import { locales } from "./i18n"
import "./LocaleSwitcher.css"

function LocaleSwitcher({ i18n }) {
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

export default withI18n(LocaleSwitcher)
