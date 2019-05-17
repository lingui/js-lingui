import * as React from "react"
import { Input, Row, Col } from "antd"

export function InputValue(props) {
  const [value, setValue] = React.useState("")
  const onChange = React.useCallback(e => setValue(e.target.value), [])

  return (
    <React.Fragment>
      <Row>
        <Col span={4}>
          <Input placeholder={props.label} value={value} onChange={onChange} />
        </Col>
        <Col span={4}>{props.children(value || props.defaultValue)}</Col>
      </Row>
    </React.Fragment>
  )
}
