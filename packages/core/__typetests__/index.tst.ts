import { i18n } from "../src"
import { expect } from "tstyche"

expect(i18n._("message.id")).type.toBe<string>()
expect(
  i18n._({
    id: "message.id",
    message: "Message",
  }),
).type.toBe<string>()
expect(
  i18n._(
    "message.id",
    { name: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} },
  ),
).type.toBe<string>()
expect(i18n._).type.toBeCallableWith("message.id", { deadline: new Date() })
expect(i18n._).type.not.toBeCallableWith("message.id", {
  payload: { nested: true },
})
expect(i18n._).type.toBeCallableWith({
  id: "message.id",
  values: { deadline: new Date() },
})
expect(i18n._).type.not.toBeCallableWith({
  id: "message.id",
  values: { payload: { nested: true } },
})
expect(i18n._).type.not.toBeCallableWith(
  // cannot use message descriptor together with rest of params
  {
    id: "message.id",
    message: "Message",
  },
  { name: "Tim" },
  { message: "Hello {name}", comment: "", formats: {} },
)

expect(i18n.t("message.id")).type.toBe<string>()
expect(
  i18n.t({
    id: "message.id",
    message: "Message",
  }),
).type.toBe<string>()

expect(
  i18n.t(
    "message.id",
    { name: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} },
  ),
).type.toBe<string>()

expect(i18n.t).type.not.toBeCallableWith(
  // cannot use message descriptor together with rest of params
  {
    id: "message.id",
    message: "Message",
  },
  { name: "Tim" },
  { message: "Hello {name}", comment: "", formats: {} },
)

expect(i18n.load).type.toBeCallableWith("cs", {})
expect(i18n.load).type.toBeCallableWith({ cs: {} })
expect(i18n.load).type.not.toBeCallableWith({ cs: {} }, {})
