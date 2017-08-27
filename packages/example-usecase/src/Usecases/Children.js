// @flow
import React from 'react'
import { Trans, Select, Plural } from 'lingui-react'

type ChildrenPropTypes = {
    name?: string,
    genderOfHost?: 'male' | 'female',
    numGuests?: number,
    host?: string,
    guest?: string
  }

class Children extends React.Component<ChildrenPropTypes> {
  props: ChildrenPropTypes

  render () {
    const {
      name = 'Mononoke',
      genderOfHost = 'female',
      numGuests = 2,
      host = 'Wilma',
      guest = 'Fred'
    } = this.props

    return (
      <div>
        <ul>
          <li>
            <Trans className="untranslated">{"This isn't translated"}</Trans>
          </li>

          <li>
            <Trans className="customId" id="msg.label"/>
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
                    one={`${host} invites ${guest} and one other person to her party.`}
                    other={`${host} invites ${guest} and # other people to her party.`}
                  />
                }
                male={
                  <Plural
                    value={numGuests}
                    offset="1"
                    _0={`${host} does not give a party.`}
                    _1={`${host} invites ${guest} to his party.`}
                    one={`${host} invites ${guest} and one other person to her party.`}
                    other={`${host} invites ${guest} and # other people to her party.`}
                  />
                }
                other={
                  <Plural
                    value={numGuests}
                    offset="1"
                    _0={`${host} does not give a party.`}
                    _1={`${host} invites ${guest} to their party.`}
                    one={`${host} invites ${guest} and one other person to her party.`}
                    other={`${host} invites ${guest} and # other people to her party.`}
                  />
                }
              />
            </Trans>
          </li>

          <li>
            <Trans render={<p className="render-element" />}>My name is {name}</Trans>
            <Trans render={({ translation }) => <p className="render-component">{translation}</p>}>
              My name is {name}
            </Trans>
          </li>
        </ul>
      </div>
    )
  }
}

export default Children
