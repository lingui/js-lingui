import React from 'react'

import { I18nProvider, Trans } from 'lingui-react'
import NeverUpdate from './Usecases/NeverUpdate'
import Children from './Usecases/Children'
import ElementAttributes from './Usecases/ElementAttributes'

const reloader = {
  subscribers: [],
  subscribe (cb) {
    this.subscribers.push(cb)
  },
  broadcast () {
    this.subscribers.forEach(f => f())
  }
}

const locales = {}

function reloadLocales (context) {
  context.keys().forEach((item) => {
    const parts = item.split('/')
    const locale = parts[parts.length - 2]
    locales[locale] = context(item)
  })
}

const context = require.context('../locale/', true, /([\w-]+)\/.*\.json$/)
reloadLocales(context)

if (module.hot) {
  module.hot.accept(context.id, function () {
    reloadLocales(require.context('../locale/', true, /([\w-]+)\/.*\.json$/))
    reloader.broadcast()
  })
}

class App extends React.Component {
  state: {
    language: string
  }

  constructor (props: {}) {
    super(props)
    this.state = {
      language: 'cs'
    }
  }

  componentDidMount () {
    reloader.subscribe(() => this.forceUpdate())
  }

  render () {
    const { language } = this.state

    return (
      <div>
        <ul>
          <li><a onClick={() => this.setState({language: 'en'})}>English</a></li>
          <li><a onClick={() => this.setState({language: 'fr'})}>French</a></li>
          <li><a onClick={() => this.setState({language: 'cs'})}>Czech</a></li>
        </ul>

        <I18nProvider language={language} messages={locales}>
          <h2><Trans>Translation of children</Trans></h2>
          <Children />

          <h2><Trans>Translation of element attributes</Trans></h2>
          <ElementAttributes />

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
