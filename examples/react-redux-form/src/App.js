import * as React from "react"
import { connect } from "react-redux"

import { I18nProvider, Trans } from "lingui-react"

import messagesCs from "lingui-loader!../locale/cs/messages.json"
import messagesEn from "lingui-loader!../locale/en/messages.json"

import { setLanguage } from "./store"
import Form from "./Form"

const catalogs = {
  cs: messagesCs,
  en: messagesEn
}

console.log(catalogs)

function Language({ activeLanguage, language, setLanguage, children }) {
  return (
    <a onClick={() => setLanguage(language)}>
      {language === activeLanguage ? <strong>{children}</strong> : children}
    </a>
  )
}

function App({ language, setLanguage }) {
  return (
    <I18nProvider
      language={language}
      catalogs={catalogs}
    >
      <Trans render="h1">Form example</Trans>
      <p>
        <Language
          activeLanguage={language}
          setLanguage={setLanguage}
          language="en"
        >
          English
        </Language>
        {" | "}
        <Language
          activeLanguage={language}
          setLanguage={setLanguage}
          language="cs"
        >
          Česky
        </Language>
      </p>
      <Form onSubmit={console.log.bind(console)} />
    </I18nProvider>
  )
}

export default connect(state => ({ language: state.i18n.language }), {
  setLanguage
})(App)
