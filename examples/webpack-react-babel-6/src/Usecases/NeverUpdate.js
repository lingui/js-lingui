// @flow
import * as React from "react"

type NeverUpdateProps = {
  children?: any
}

class NeverUpdate extends React.Component<NeverUpdateProps> {
  props: NeverUpdateProps

  shouldComponentUpdate() {
    return false
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

export default NeverUpdate
