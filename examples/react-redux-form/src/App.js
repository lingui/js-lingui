import * as React from "react"
import { connect } from "react-redux"

import { I18nProvider, Trans } from "lingui-react"
import linguiDev from "lingui-i18n/dev"

import messagesCs from "lingui-loader!../locale/cs/messages.json"
import messagesEn from "lingui-loader!../locale/en/messages.json"

import { setLanguage } from "./store"
import Form from "./Form"

function App({ language, setLanguage }) {
  return (
    <I18nProvider
      language={language}
      development={linguiDev}
      catalogs={{
        cs: messagesCs,
        en: messagesEn
      }}
    >
      <Trans render="h1">Form example</Trans>
      <p>
        <a onClick={() => setLanguage("en")}>English</a>
        {" | "}
        <a onClick={() => setLanguage("cs")}>Česky</a>
      </p>
      <Form onSubmit={console.log.bind(console)} />
    </I18nProvider>
  )
}

export default connect(state => ({ language: state.i18n.language }), {
  setLanguage
})(App)
