import { expect } from "tstyche"
import type { TransProps } from "../src"

type Values = NonNullable<TransProps["values"]>

expect({ name: "Tim" }).type.toBeAssignableTo<Values>()
expect({ count: 1 }).type.toBeAssignableTo<Values>()
expect({ active: false }).type.toBeAssignableTo<Values>()
expect({ deadline: new Date() }).type.toBeAssignableTo<Values>()
expect({ name: <strong>Tim</strong> }).type.toBeAssignableTo<Values>()
expect({
  name: ["Mr. ", <strong key="1">Tim</strong>],
}).type.toBeAssignableTo<Values>()

expect({
  payload: { nested: true },
}).type.not.toBeAssignableTo<Values>()
