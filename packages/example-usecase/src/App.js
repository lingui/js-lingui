import React from 'react'

import { unpackCatalog } from 'lingui-i18n'
import { I18nProvider, Trans } from 'lingui-react'
import NeverUpdate from './Usecases/NeverUpdate'
import Children from './Usecases/Children'
import ElementAttributes from './Usecases/ElementAttributes'
import Formats from './Usecases/Formats'

class App extends React.Component {
  state = {
    language: 'en',
    catalogs: {}
  }

  loadLanguage = async (language) => {
    const catalogs = await import(
      /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
      `../locale/${language}/messages.js`).then(unpackCatalog)

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalogs
      }
    }))
  }

  componentDidMount () {
    this.loadLanguage(this.state.language)
  }

  shouldComponentUpdate (nextProps, { language, catalogs }) {
    if (language !== this.state.language && !catalogs[language]) {
      this.loadLanguage(language)
      return false
    }

    return true
  }

  render () {
    const { language, catalogs, languageData } = this.state

    if (!catalogs[language]) return null

    return (
      <div>
        <ul>
          <li><a onClick={() => this.setState({language: 'en'})}>English</a></li>
          <li><a onClick={() => this.setState({language: 'fr'})}>French</a></li>
          <li><a onClick={() => this.setState({language: 'cs'})}>Czech</a></li>
        </ul>

        <I18nProvider language={language} catalogs={catalogs} languageData={languageData}>
          <h2><Trans>Translation of children</Trans></h2>
          <Children />

          <h2><Trans>Translation of element attributes</Trans></h2>
          <ElementAttributes />

          <h2><Trans>Formats</Trans></h2>
          <Formats />

          <h2><Trans>Translations wrapped in component which never updates</Trans></h2>
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
