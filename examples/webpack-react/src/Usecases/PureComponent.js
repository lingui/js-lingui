// @flow
import * as React from 'react'
import { withI18n } from 'lingui-react'

type PureComponentTestProps = {
  children?: any,
  value: number
}

type PureComponentProps = {
  children?: any,
  i18n: Object,
  value: number
}

class PureComponentTest extends React.PureComponent<PureComponentTestProps> {
  props: PureComponentTestProps

  render () {
    const { value } = this.props

    return <div>
      <CorrectUpdate value={value} />
      <SkippedUpdate value={value} />
    </div>
  }
}

const CorrectUpdate = withI18n()(class extends React.PureComponent<PureComponentProps> {
  props: PureComponentProps

  render () {
    const { i18n, value } = this.props
    return <span className="valid">{i18n.t`The value is: ${value}`}</span>
  }
})

const SkippedUpdate = withI18n({ withHash: false })(class extends React.PureComponent<PureComponentProps> {
  props: PureComponentProps

  render () {
    const { i18n, value } = this.props
    return <span className="invalid">{i18n.t`The value is: ${value}`}</span>
  }
})

export default PureComponentTest
