import * as React from "react"
import { Trans, Plural } from "@lingui/react"

class App extends React.Component {
  render() {
    return (
      <div>
        <Trans>Label</Trans>
        <h1>
          <Trans id="msg.heading">Application Example</Trans>
        </h1>

        <p>
          <Trans>
            Example of <a href="">react-trans</a> usage.
          </Trans>
        </p>

        <Trans>Value of {value}</Trans>

        <p>
          <Plural
            value={messagesCount}
            zero="There're no messages"
            one="There's # message <span>in</span> your inbox"
            other="There're # messages in your inbox"
          />
        </p>
      </div>
    )
  }
}
