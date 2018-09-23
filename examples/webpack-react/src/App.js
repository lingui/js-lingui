import * as React from "react"

import { setupI18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { Trans } from "@lingui/macro"

import NeverUpdate from "./Usecases/NeverUpdate"
import Children from "./Usecases/Children"
import ElementAttributes from "./Usecases/ElementAttributes"
import Formats from "./Usecases/Formats"

const locales = {
  en: `English`,
  cs: `Česky`
}

const i18n = setupI18n()
i18n.willActivate(async locale => {
  /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
  const {
    default: catalog
  } = await import(`@lingui/loader!./locale/${locale}/messages.po`)
  return catalog
})
i18n.activate("en")

export default class App extends React.Component {
  render() {
    return (
      <I18nProvider i18n={i18n}>
        <ul>
          {Object.keys(locales).map(locale => (
            <li key={locale}>
              <a onClick={() => i18n.activate(locale)}>{locales[locale]}</a>
            </li>
          ))}
        </ul>

        <h2>
          <Trans>Translations with rich-text</Trans>
        </h2>
        <Children />

        <h2>
          <Trans>Translation of element attributes</Trans>
        </h2>
        <ElementAttributes />

        <h2>
          <Trans>Formats</Trans>
        </h2>
        <Formats />

        <h2>
          <Trans>Translations wrapped in component which never updates</Trans>
        </h2>
        <NeverUpdate>
          <Children />
          <ElementAttributes />
        </NeverUpdate>
      </I18nProvider>
    )
  }
}
