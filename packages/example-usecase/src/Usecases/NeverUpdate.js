import React from 'react'

class NeverUpdate extends React.Component {
  props: {
    children?: any
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return <div>{this.props.children}</div>
  }
}

export default NeverUpdate
