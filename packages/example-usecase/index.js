import React from 'react'
import { Trans } from 'react-trans'

// Not implemented yet
const Select = () => {}
const Plural = () => {}


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
      <div>
        <Trans className="untranslated">Hello World</Trans>
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
      </div>
    )
  }
}

export default Usecase
