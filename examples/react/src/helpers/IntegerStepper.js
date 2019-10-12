import * as React from "react"
import { Slider, InputNumber, Row, Col } from "antd"

export function IntegerStepper(props) {
  const [value, setValue] = React.useState(1)

  const onChange = React.useCallback(value => setValue(value), [setValue])

  return (
    <React.Fragment>
      <Row>
        <Col span={4}>
          <Slider
            tipFormatter={null}
            min={0}
            max={20}
            onChange={onChange}
            value={typeof value === "number" ? value : 0}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={20}
            style={{ marginLeft: 16 }}
            value={value}
            onChange={onChange}
          />
        </Col>
      </Row>
      <Row>{props.children(value)}</Row>
    </React.Fragment>
  )
}
