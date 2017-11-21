// @flow
import React from 'react'
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
      <ValidComponent value={value} />
      <InvalidComponent value={value} />
    </div>
  }
}

const ValidComponent = withI18n({ forPure: true })(class extends React.PureComponent<PureComponentProps> {
  props: PureComponentProps

  render () {
    const { i18n, value } = this.props
    return <span className="valid">{i18n.t`The value is: ${value}`}</span>
  }
})

const InvalidComponent = withI18n()(class extends React.PureComponent<PureComponentProps> {
  props: PureComponentProps

  render () {
    const { i18n, value } = this.props
    return <span className="invalid">{i18n.t`The value is: ${value}`}</span>
  }
})

export default PureComponentTest
