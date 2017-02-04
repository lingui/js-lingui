import React from 'react'
import { Trans, I18nProvider } from 'react-trans'

const messages = {
  fr: {
    'msg.label': 'Label',
    'Hello World': 'Salut le monde!',
    'My name is {name}': "Je m'appelle {name}",
  },
  cs: {
    'msg.label': 'Nápis',
    'Hello World': 'Ahoj světe',
    'My name is {name}': 'Jmenuji se {name}',
  }
}

class NeverUpdate extends React.Component {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return <div>{this.props.children}</div>
  }
}


class Usecase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language: 'cs'
    }
  }

  render() {
    const {
      name = 'Mononoke',
      genderOfHost = 'female',
      numGuests = 4,
      host = 'Wilma',
      guest = 'Fred'
    } = this.props
    const { language } = this.state

    return (
      <I18nProvider language={language} messages={messages[language]}>
        <NeverUpdate>
          <Trans className="untranslated">{"This isn't translated"}</Trans>
          <Trans className="customId" id="msg.label" />
          <Trans className="translated">Hello World</Trans>
          <Trans className="variable">My name is {name}</Trans>

          <Trans className="components">
            Read <a href="/mononoke">more</a>.
          </Trans>
          <Trans className="plural">
            <Select
              value={genderOfHost}
              female={
                <Plural
                  value={numGuests}
                  offset="1"
                  _0={`${host} does not give a party.`}
                  _1={`${host} invites ${guest} to her party.`}
                  _2={`${host} invites ${guest} and one other person to her party.`}
                  other={`${host} invites ${guest} and # other people to her party.`}
                />
              }
              male={
                <Plural
                  value={numGuests}
                  offset="1"
                  _0={`${host} does not give a party.`}
                  _1={`${host} invites ${guest} to his party.`}
                  _2={`${host} invites ${guest} and one other person to her party.`}
                  other={`${host} invites ${guest} and # other people to her party.`}
                />
              }
              other={
                <Plural
                  value={numGuests}
                  offset="1"
                  _0={`${host} does not give a party.`}
                  _1={`${host} invites ${guest} to their party.`}
                  _2={`${host} invites ${guest} and one other person to her party.`}
                  other={`${host} invites ${guest} and # other people to her party.`}
                />
              }
            />
          </Trans>
        </NeverUpdate>
      </I18nProvider>
    )
  }
}

export default Usecase
