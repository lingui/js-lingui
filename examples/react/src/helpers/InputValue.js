import * as React from "react"
import { Input, Row, Col } from "antd"

export default class InputValue extends React.Component {
  state = {
    value: ""
  }

  onChange = e => this.setState({ value: e.target.value })

  render() {
    const { value } = this.state

    return (
      <React.Fragment>
        <Row>
          <Col span={4}>
            <Input
              placeholder={this.props.label}
              value={value}
              onChange={this.onChange}
            />
          </Col>
          <Col span={4}>
            {this.props.children(value || this.props.defaultValue)}
          </Col>
        </Row>
      </React.Fragment>
    )
  }
}
