import React from 'react'
import Usecase from './Usecase'

const reloader = {
  subscribers: [],
  subscribe(cb) {
    this.subscribers.push(cb)
  },
  broadcast() {
    this.subscribers.forEach(f => f())
  }
}

const locales = {}

function reloadLocales(context) {
  context.keys().forEach((item) => {
    const parts = item.split('/')
    const locale = parts[parts.length - 2]
    locales[locale] = context(item)
  })
}

const context = require.context("../locale/", true, /([\w-]+)\/.*\.json$/)
reloadLocales(context)

if (module.hot) {
  module.hot.accept(context.id, function() {
    reloadLocales(require.context("../locale/", true, /([\w-]+)\/.*\.json$/))
    reloader.broadcast()
  })
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language: 'cs'
    }
  }

  componentDidMount() {
    reloader.subscribe(() => this.forceUpdate())
  }

  render() {
    const { language } = this.state

    const messages = language === 'en' ? {} : locales[language]

    return (
      <div>
        <ul>
          <li><a onClick={() => this.setState({language: 'en'})}>English</a></li>
          <li><a onClick={() => this.setState({language: 'fr'})}>French</a></li>
          <li><a onClick={() => this.setState({language: 'cs'})}>Czech</a></li>
        </ul>

        <Usecase messages={messages} language={language} />
      </div>
    )
  }
}

export default App
