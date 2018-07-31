import * as React from "react"

import { I18nProvider, Trans, i18nMark } from "@lingui/react"
import NeverUpdate from "./Usecases/NeverUpdate"
import Children from "./Usecases/Children"
import ElementAttributes from "./Usecases/ElementAttributes"
import Formats from "./Usecases/Formats"

const languages = {
  en: i18nMark("English"),
  cs: i18nMark("Czech"),
  fr: i18nMark("French")
}

class App extends React.Component {
  state = {
    language: "en",
    catalogs: {}
  }

  loadLanguage = async language => {
    /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
    const catalogs = await import(`@lingui/loader!./locale/${language}/messages.json`)

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
    const { language, catalogs, languageData } = this.state

    if (!catalogs[language]) return null

    return (
      <div>
        <I18nProvider
          language={language}
          catalogs={catalogs}
          languageData={languageData}
        >
          <ul>
            {Object.keys(languages).map(language => (
              <li key={language}>
                <a onClick={() => this.setState({ language })}>
                  <Trans id={languages[language]} />
                </a>
              </li>
            ))}
          </ul>

          <h2>
            <Trans>Translation of children</Trans>
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

export default App
