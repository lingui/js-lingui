import { Trans } from 'lingui-react'

class App extends React.Component {
  render () {
    return (
      <div>
        <Trans>Label</Trans>
        <h1><Trans id="msg.heading">Application Example</Trans></h1>

        <p><Trans>Example of <a href="">react-trans</a> usage.</Trans></p>

        <Trans>Value of {value}</Trans>
      </div>
    )
  }
}
