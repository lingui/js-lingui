import { i18n, setupI18n } from "@lingui/core"
import type {
  Formatter,
  FormatterContext,
  I18n,
  MessageId,
  VariableValue,
  Variables,
} from "@lingui/core"
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

expect<VariableValue>().type.toBe<string | number | Date>()
expect(i18n.variables).type.toBe<Variables>()
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

expect<Formatter>().type.toBe<
  (value: unknown, ctx: FormatterContext) => unknown
>()
expect(
  setupI18n({
    formatters: {
      upper: (value, { locale, locales, param }) => {
        expect(locale).type.toBe<string>()
        expect(locales).type.toBe<string | string[] | undefined>()
        expect(param).type.toBe<string | undefined>()
        return String(value).toLocaleUpperCase(locale)
      },
    },
  }),
).type.toBe<I18n>()
expect(setupI18n).type.not.toBeCallableWith({ formatters: { upper: "x" } })
