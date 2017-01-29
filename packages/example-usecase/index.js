import React from 'react'
import { Trans, I18nProvider } from 'react-trans'

// Not implemented yet
const Select = () => {}
const Plural = () => {}

const messages = {
  'msg.label': 'Label',
  'Hello World': 'Ahoj světe',
  'My name is {name}': 'Jmenuji se {name}',
}


class Usecase extends React.Component {
  render() {
    const {
      name = 'Mononoke',
      genderOfHost = 'female',
      numGuests = 1,
      host = 'Wilma',
      guest = 'Fred'
    } = this.props

    return (
      <I18nProvider messages={messages}>
        <Trans className="untranslated">This isn't translated</Trans>
        <Trans className="customId" id="msg.label" />
        <Trans className="translated">Hello World</Trans>
        <Trans className="variable">My name is {name}</Trans>

        <Trans className="components">
          Read <a href="/mononoke">more</a>.
        </Trans>
      </I18nProvider>
    )
  }
}

export default Usecase
