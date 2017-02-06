import React from 'react'
import { Trans, I18nProvider } from 'lingui-react'

class NeverUpdate extends React.Component {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return <div>{this.props.children}</div>
  }
}


class Usecase extends React.Component {
  render() {
    const {
      language = '', messages = {},
      name = 'Mononoke',
      genderOfHost = 'female',
      numGuests = 4,
      host = 'Wilma',
      guest = 'Fred'
    } = this.props

    return (
      <I18nProvider language={language} messages={messages}>
        <NeverUpdate>
          <ul>
            <li>
              <Trans className="untranslated">{"This isn't translated"}</Trans>
            </li>

            <li>
              <Trans className="customId" id="msg.label" />
            </li>

            <li>
              <Trans className="translated">Hello World</Trans>
            </li>

            <li>
              <Trans className="variable">My name is {name}</Trans>
            </li>

            <li>
              <Trans className="components">
                Read <a href="/mononoke">more</a>.
              </Trans>
            </li>

            <li>
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
            </li>
          </ul>
        </NeverUpdate>
      </I18nProvider>
    )
  }
}

export default Usecase
