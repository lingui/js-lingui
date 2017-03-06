import React from 'react'
import { Trans, NumberFormat, DateFormat } from 'lingui-react'

class Formats extends React.Component {
  render () {
    const answer = 0.42
    const now = new Date('4/5/2017')

    return (
      <div>
        <ul>
          <li>
            <Trans className="percent">
              The answer is <NumberFormat value={answer} format="percent" />
            </Trans>
          </li>

          <li>
            <Trans className="date">
              Today is <DateFormat value={now} />
            </Trans>
          </li>
        </ul>
      </div>
    )
  }
}

export default Formats
