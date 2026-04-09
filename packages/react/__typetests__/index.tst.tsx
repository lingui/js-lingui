import { expect } from "tstyche"
import type { TransProps } from "../src"

type Values = NonNullable<TransProps["values"]>

expect({
  name: "Tim",
  count: 1,
  total: BigInt(1),
  active: false,
  deadline: new Date(),
  optional: null,
  missing: undefined,
  richName: <strong>Tim</strong>,
  parts: ["Mr. ", <strong key="1">Tim</strong>],
}).type.toBeAssignableTo<Values>()

expect({
  payload: { nested: true },
}).type.not.toBeAssignableTo<Values>()
