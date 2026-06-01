import { i18n } from "@lingui/core"
import type { MessageId, MessageDescriptor } from "@lingui/core"
import { expect } from "tstyche"

// MessageId resolves to the registered union
expect<MessageId>().type.toBe<"welcome.title" | "welcome.body" | "greeting">()

// i18n._() accepts valid IDs
expect(i18n._("welcome.title")).type.toBe<string>()
expect(i18n._("greeting")).type.toBe<string>()

// i18n._() rejects invalid IDs
expect(i18n._).type.not.toBeCallableWith("invalid.id")

// i18n.t() accepts valid IDs
expect(i18n.t("welcome.body")).type.toBe<string>()

// i18n.t() rejects invalid IDs
expect(i18n.t).type.not.toBeCallableWith("invalid.id")

// MessageDescriptor requires a valid ID
expect<MessageDescriptor>().type.toBeAssignableWith({
  id: "welcome.title" as const,
  message: "Welcome!",
})

// MessageDescriptor rejects an invalid ID
expect<MessageDescriptor>().type.not.toBeAssignableWith({
  id: "invalid.id",
  message: "Nope",
})

// i18n._() accepts a MessageDescriptor with a valid ID
expect(
  i18n._({
    id: "greeting",
    message: "Hello!",
  }),
).type.toBe<string>()
