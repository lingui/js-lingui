import React from 'react'

import { I18nProvider, Trans } from 'lingui-react'
import NeverUpdate from './Usecases/NeverUpdate'
import Children from './Usecases/Children'
import ElementAttributes from './Usecases/ElementAttributes'
import Formats from './Usecases/Formats'

class App extends React.Component {
  state = {
    language: 'en',
    messages: {},
    languageData: {}
  }

  loadLanguage = async (language) => {
    const messages = await import(
      /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
      `../locale/${language}/messages.js`)

    this.setState(state => ({
      messages: {
        ...state.messages,
        [language]: messages.m
      },
      languageData: {
        ...state.languageData,
        [language]: {
          plurals: messages.l.p
        }
      }
    }))
  }

  componentDidMount () {
    this.loadLanguage(this.state.language)
  }

  shouldComponentUpdate (nextProps, { language, messages }) {
    if (language !== this.state.language && !messages[language]) {
      this.loadLanguage(language)
      return false
    }

    return true
  }

  render () {
    const { language, messages, languageData } = this.state

    if (!messages[language]) return null

    return (
      <div>
        <ul>
          <li><a onClick={() => this.setState({language: 'en'})}>English</a></li>
          <li><a onClick={() => this.setState({language: 'fr'})}>French</a></li>
          <li><a onClick={() => this.setState({language: 'cs'})}>Czech</a></li>
        </ul>

        <I18nProvider language={language} messages={messages} languageData={languageData}>
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
