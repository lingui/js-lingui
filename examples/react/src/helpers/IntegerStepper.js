import * as React from "react"
import { Slider, InputNumber, Row, Col } from "antd"

export default class IntegerStepper extends React.Component {
  state = {
    value: 1
  }

  onChange = value => this.setState({ value })

  render() {
    const { value } = this.state

    return (
      <React.Fragment>
        <Row>
          <Col span={4}>
            <Slider
              tipFormatter={null}
              min={0}
              max={20}
              onChange={this.onChange}
              value={typeof value === "number" ? value : 0}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={20}
              style={{ marginLeft: 16 }}
              value={value}
              onChange={this.onChange}
            />
          </Col>
        </Row>
        <Row>{this.props.children(value)}</Row>
      </React.Fragment>
    )
  }
}
