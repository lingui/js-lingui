import { expect } from "tstyche"
import type { MessageDescriptor, I18n } from "@lingui/core"

import {
  t,
  defineMessage,
  msg,
  plural,
  selectOrdinal,
  select,
  ph,
} from "@lingui/core/macro"

const name = "Jack"
const user = { name: "Jack" }
const i18n: I18n = null
const numberValue = 2

// simple
expect(t`Hello world`).type.toBe<string>()
expect(t`Hello ${name}`).type.toBe<string>()

// with labeled expression
expect(t`Hello ${{ name: user.name }}`).type.toBe<string>()

// with ph labeled expression
expect(t`Hello ${ph({ name: user.name })}`).type.toBe<string>()

// allow numbers
expect(t`Hello ${numberValue}`).type.toBe<string>()

// with custom i18n
expect(t(i18n)`With custom i18n instance`).type.toBe<string>()
expect(t(i18n)`With custom i18n instance ${name}`).type.toBe<string>()

// with macro message descriptor
expect(
  t({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
).type.toBe<string>()

// only id
expect(t({ id: "custom.id" })).type.toBe<string>()

// only message
expect(t({ message: "my message" })).type.toBe<string>()

// id or message should be provided
expect(t).type.not.toBeCallableWith({ comment: "", context: "" })

// id or message should be provided
expect(t).type.not.toBeCallableWith({})

// `values` is invalid field for macro message descriptor
expect(t).type.not.toBeCallableWith({
  id: "custom.id",
  comment: "Hello",
  context: "context",
  message: "Hello world",

  values: {},
})

// message descriptor + custom i18n
expect(
  t(i18n)({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
).type.toBe<string>()

///
// defineMessage
///

// simple
expect(msg`Hello ${name}`).type.toBe<MessageDescriptor>()
expect(defineMessage`Hello ${name}`).type.toBe<MessageDescriptor>()

// with labeled expression
expect(msg`Hello ${{ name: user.name }}`).type.toBe<MessageDescriptor>()
expect(
  defineMessage`Hello ${{ name: user.name }}`
).type.toBe<MessageDescriptor>()

// with ph labeled expression
expect(msg`Hello ${ph({ name: user.name })}`).type.toBe<MessageDescriptor>()
expect(
  defineMessage`Hello ${ph({ name: user.name })}`
).type.toBe<MessageDescriptor>()

// allow numbers
expect(msg`Hello ${numberValue}`).type.toBe<MessageDescriptor>()
expect(defineMessage`Hello ${numberValue}`).type.toBe<MessageDescriptor>()

expect(
  defineMessage({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
).type.toBe<MessageDescriptor>()
expect(
  msg({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
).type.toBe<MessageDescriptor>()
expect(defineMessage`Message`).type.toBe<MessageDescriptor>()
expect(msg`Message`).type.toBe<MessageDescriptor>()

// id or message should be provided
expect(defineMessage).type.not.toBeCallableWith({})

///////////////////
//// Plural  //////
///////////////////

expect(plural).type.not.toBeCallableWith("5", {
  // extra properties are not allowed
  incorrect: "",

  one: "...",
  other: "...",
  few: "...",
  many: "...",
  zero: "...",
})

expect(
  plural(5, {
    one: "...",
    other: "...",
  })
).type.toBe<string>()

// with offset
expect(
  plural(5, {
    one: "...",
    other: "...",
    offset: 5,
  })
).type.toBe<string>()

// exact choices
expect(
  plural(5, {
    0: "...",
    1: "...",
    one: "...",
    other: "...",
  })
).type.toBe<string>()

// with labeled value
expect(
  plural(
    { count: 5 },
    {
      one: "...",
      other: "...",
    }
  )
).type.toBe<string>()

// with labeled value with ph helper
expect(
  plural(ph({ count: 5 }), {
    one: "...",
    other: "...",
  })
).type.toBe<string>()

// should accept only strings
expect(plural).type.not.toBeCallableWith(5, { one: 5, other: 5 })

// other is required
expect(plural).type.not.toBeCallableWith(5, { one: "test" })

///////////////////
//// Select Ordinal
///////////////////

expect(selectOrdinal).type.not.toBeCallableWith("5", {
  // extra properties are not allowed
  incorrect: "",

  one: "...",
  other: "...",
  few: "...",
  many: "...",
  zero: "...",
})

expect(
  selectOrdinal(5, {
    one: "...",
    other: "...",
  })
).type.toBe<string>()

// with offset
expect(
  selectOrdinal("5", {
    one: "...",
    other: "...",
    offset: 5,
  })
).type.toBe<string>()

// exact choices
expect(
  selectOrdinal(5, {
    0: "...",
    1: "...",
    one: "...",
    other: "...",
  })
).type.toBe<string>()

// should accept only strings
expect(selectOrdinal).type.not.toBeCallableWith(5, { one: 5, other: 5 })

// with labeled value
expect(
  selectOrdinal(
    { count: 5 },
    {
      one: "...",
      other: "...",
    }
  )
).type.toBe<string>()

// with labeled value with ph helper
expect(
  selectOrdinal(ph({ count: 5 }), {
    one: "...",
    other: "...",
  })
).type.toBe<string>()

///////////////////
//// Select
///////////////////

const gender = "male"
expect(
  select(gender, {
    // todo: here is inconsistency between jsx macro and js.
    //   in JSX macro you should prefix exact choices with "_"
    //   but here is not. And it's better to use it with underscore,
    //   because this could be statically checked by TS
    //   type UnderscoreValue = `_${string}`;
    male: "he",
    female: "she",
    other: "they",
  })
).type.toBe<string>()

// value could be strings only
expect(select).type.not.toBeCallableWith(5, {
  male: "he",
  female: "she",
  other: "they",
})

// with labeled value
expect(select).type.not.toBeCallableWith(
  // value could be strings only
  { count: 5 },
  {
    male: "...",
    other: "...",
  }
)

// with labeled value with ph helper
expect(
  select(ph({ value: "one" }), {
    male: "...",
    other: "...",
  })
).type.toBe<string>()

// should accept only strings
expect(select).type.not.toBeCallableWith("male", { male: 5, other: 5 })
