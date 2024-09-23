import { expectType } from "tsd"
import type { MessageDescriptor, I18n } from "@lingui/core"

import {
  t,
  defineMessage,
  msg,
  plural,
  selectOrdinal,
  select,
} from "@lingui/core/macro"

const name = "Jack"
const i18n: I18n = null

// simple
expectType<string>(t`Hello world`)
expectType<string>(t`Hello ${name}`)

// with custom i18n
expectType<string>(t(i18n)`With custom i18n instance`)
expectType<string>(t(i18n)`With custom i18n instance ${name}`)

// with macro message descriptor
expectType<string>(
  t({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)

// only id
expectType<string>(t({ id: "custom.id" }))

// only message
expectType<string>(t({ message: "my message" }))

// @ts-expect-error no id or message
t({ comment: "", context: "" })

// @ts-expect-error id or message should be presented
t({})

// @ts-expect-error `values` is invalid field for macro message descriptor
t({
  id: "custom.id",
  comment: "Hello",
  context: "context",
  message: "Hello world",

  values: {},
})

// message descriptor + custom i18n
expectType<string>(
  t(i18n)({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)

expectType<MessageDescriptor>(
  defineMessage({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)
expectType<MessageDescriptor>(
  msg({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)
expectType<MessageDescriptor>(defineMessage`Message`)
expectType<MessageDescriptor>(msg`Message`)

// @ts-expect-error id or message should be presented
expectType<MessageDescriptor>(defineMessage({}))

///////////////////
//// Plural  //////
///////////////////

expectType<string>(
  plural("5", {
    // @ts-expect-error extra properties are not allowed
    incorrect: "",

    one: "...",
    other: "...",
    few: "...",
    many: "...",
    zero: "...",
  })
)

expectType<string>(
  plural(5, {
    one: "...",
    other: "...",
  })
)

// with offset
expectType<string>(
  plural(5, {
    one: "...",
    other: "...",
    offset: 5,
  })
)

// exact choices
expectType<string>(
  plural(5, {
    0: "...",
    1: "...",
    one: "...",
    other: "...",
  })
)

expectType<string>(
  plural(5, {
    // @ts-expect-error: should accept only strings
    one: 5,
    // @ts-expect-error: should accept only strings
    other: 5,
  })
)

// @ts-expect-error: other is required
expectType<string>(plural(5, { one: "test" }))

///////////////////
//// Select Ordinal
///////////////////

expectType<string>(
  selectOrdinal("5", {
    // @ts-expect-error extra properties are not allowed
    incorrect: "",

    one: "...",
    other: "...",
    few: "...",
    many: "...",
    zero: "...",
  })
)

expectType<string>(
  selectOrdinal(5, {
    one: "...",
    other: "...",
  })
)

// with offset
expectType<string>(
  selectOrdinal("5", {
    one: "...",
    other: "...",
    offset: 5,
  })
)

// exact choices
expectType<string>(
  selectOrdinal(5, {
    0: "...",
    1: "...",
    one: "...",
    other: "...",
  })
)

expectType<string>(
  selectOrdinal(5, {
    // @ts-expect-error: should accept only strings
    one: 5,
    // @ts-expect-error: should accept only strings
    other: 5,
  })
)

///////////////////
//// Select
///////////////////

const gender = "male"
expectType<string>(
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
)

expectType<string>(
  // @ts-expect-error value could be strings only
  select(5, {
    male: "he",
    female: "she",
    other: "they",
  })
)

expectType<string>(
  select("male", {
    // @ts-expect-error: should accept only strings
    male: 5,
    // @ts-expect-error: should accept only strings
    other: 5,
  })
)
