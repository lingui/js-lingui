import * as React from "react"

import { I18nProvider } from "@lingui/react"
import { t, Trans } from "@lingui/macro"

import NeverUpdate from "./Usecases/NeverUpdate"
import Children from "./Usecases/Children"
import ElementAttributes from "./Usecases/ElementAttributes"
import Formats from "./Usecases/Formats"

const languages = {
  en: `English`,
  cs: `Česky`
}

export default class App extends React.Component {
  state = {
    language: "en",
    catalogs: {}
  }

  loadLanguage = async language => {
    /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
    const catalogs = await import(`@lingui/loader!./locale/${language}/messages.po`)

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalogs
      }
    }))
  }

  componentDidMount() {
    this.loadLanguage(this.state.language)
  }

  shouldComponentUpdate(nextProps, { language, catalogs }) {
    if (language !== this.state.language && !catalogs[language]) {
      this.loadLanguage(language)
      return false
    }

    return true
  }

  render() {
    const { language, catalogs } = this.state

    if (!catalogs[language]) return null

    return (
      <div>
        <I18nProvider language={language} catalogs={catalogs}>
          <ul>
            {Object.keys(languages).map(language => (
              <li key={language}>
                <a onClick={() => this.setState({ language })}>
                  {languages[language]}
                </a>
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
      </div>
    )
  }
}
