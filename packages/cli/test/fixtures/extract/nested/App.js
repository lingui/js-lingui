import * as React from "react"
import { Trans } from "@lingui/react"

class App extends React.Component {
  render() {
    return (
      <div>
        <Trans>Label</Trans>
        <h1>
          <Trans>Nested Application Example</Trans>
        </h1>

        <p>
          <Trans>
            Demostrate that same file names does not overwrite each other
          </Trans>
        </p>
      </div>
    )
  }
}
