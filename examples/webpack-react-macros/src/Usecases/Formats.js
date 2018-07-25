import * as React from "react"
import { Trans, NumberFormat, DateFormat } from "@lingui/react.macro"

export default class Formats extends React.Component {
  render() {
    const answer = 0.42
    const now = new Date("2017-04-05T11:14:00.000Z")

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
