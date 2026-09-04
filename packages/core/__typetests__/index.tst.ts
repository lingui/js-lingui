import { i18n, setupI18n } from "@lingui/core"
import type { I18n, MessageId, Values } from "@lingui/core"
import { expect } from "tstyche"

// MessageId resolves to string when Register is not augmented
expect<MessageId>().type.toBe<string>()

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

expect(i18n.variables).type.toBe<Values>()
expect(setupI18n({ variables: { gender: "female" } })).type.toBe<I18n>()
expect(i18n.setVariable("gender", "male")).type.toBe<I18n>()
expect(i18n.setVariable("gender", () => "male")).type.toBe<I18n>()
expect(i18n.setVariables({ gender: "male" })).type.toBe<I18n>()
expect(
  i18n.setVariables((prev) => ({
    ...prev,
    gender: "female",
  })),
).type.toBe<I18n>()
