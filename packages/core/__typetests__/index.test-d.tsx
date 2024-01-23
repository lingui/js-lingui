// eslint-disable-next-line import/no-extraneous-dependencies
import { expectType } from "tsd"
import { i18n } from "@lingui/core"

// @ts-expect-error at least one parameter should be presented
expectType<string>(i18n._())
expectType<string>(i18n._("message.id"))
expectType<string>(i18n._("Hello, '{name}'"))
expectType<string>(i18n._("Hello, '{name}'", {}))
expectType<string>(
  i18n._("Hello, {lastName} '{name}', you have {count} messages", {
    count: "1",
    lastName: "LastName",
  })
)
expectType<string>(i18n._("Hello, } { "))
expectType<string>(i18n._("Hello, {{{vvv} ", {}))
expectType<string>(i18n._("Hello, {}", { "": "Name" }))
expectType<string>(i18n._("Hello, {name}", { name: "Name" }))
// @ts-expect-error cannot call without a parameter object
expectType<string>(i18n._("Hello, {name}"))
i18n._("You have {n, number} unread messages", { n: 10 })
// @ts-expect-error n should be of type "number"
i18n._("You have {n, number} unread messages", { n: "hello" })
// @ts-expect-error cannot call with incorrect parameters object
expectType<string>(i18n._("Hello {name}", { username: "Name" }))
expectType<string>(
  // @ts-expect-error cannot call with incorrect parameters object
  i18n._("Hello {name}", { name: "Name", lastName: "Slivaev" })
)
expectType<string>(
  i18n._("Hello {name}, you have {count} messages", {
    name: "Dmitry",
    count: "5",
  })
)
expectType<string>(
  // @ts-expect-error cannot call with incorrect parameters object for formatter
  i18n._("{numBooks, plural, one {# book} other {# books}}", {})
)

expectType<string>(
  i18n._(
    `
{username} have {
  numBooks, plural, 
    one {
      {
        numArticles, plural, 
          one {
            1 book and 1 article
          } other {
            1 book and {numArticles, number} articles, good job, {name} !
          }
      }
    } other {
      {numArticles, plural, 
        one {
          {numBooks, number} books and 1 article
        } other {
          numBooks, number} books and {numArticles, number} articles
        }
      }
    }
}. Wish you a good {what}`,
    {
      numBooks: 1,
      numArticles: 1,
      username: "username",
      name: "name",
      what: "luck",
    }
  )
)
expectType<string>(
  i18n._({
    id: "message.id",
    message: "Message",
  })
)
expectType<string>(
  i18n._(
    "message.id",
    { name: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} }
  )
)

expectType<string>(
  // @ts-expect-error cannot call with incorrect parameters object
  i18n._(
    "message.id",
    { username: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} }
  )
)
expectType<string>(
  i18n._(
    // @ts-expect-error you could not use message descriptor together with rest of params
    {
      id: "message.id",
      message: "Message",
    },
    { name: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} }
  )
)

expectType<string>(i18n.t("message.id"))
expectType<string>(
  i18n.t({
    id: "message.id",
    message: "Message",
  })
)

// @ts-expect-error id or message should be presented
expectType<string>(i18n.t({}))
expectType<string>(i18n.t({ id: "Hello" }))
expectType<string>(i18n.t({ id: "Hello", message: "Hello" }))

expectType<string>(
  i18n.t({
    id: "Hello {name}",
    values: {
      name: "Name",
    },
  })
)

expectType<string>(
  i18n.t({
    id: "message.id",
    message: "Hello {name}",
    values: {
      name: "Name",
    },
  })
)

expectType<string>(
  // @ts-expect-error cannot call with incorrect parameters object
  i18n.t({
    id: "Hello {name}",
    values: {
      username: "Name",
    },
  })
)

expectType<string>(
  // @ts-expect-error cannot call with incorrect parameters object
  i18n.t({
    id: "message.id",
    message: "Hello {name}",
    values: {
      username: "Name",
    },
  })
)

expectType<string>(
  // @ts-expect-error if "message" is presented – values should be typed according to messages instead of id
  i18n.t({
    id: "Hello, {username}",
    message: "Hello {name}",
    values: {
      username: "Name",
    },
  })
)

expectType<string>(
  i18n.t(
    "message.id",
    { name: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} }
  )
)

expectType<string>(
  i18n.t(
    // @ts-expect-error you could not use message descriptor together with rest of params
    {
      id: "message.id",
      message: "Message",
    },
    { name: "Tim" },
    { message: "Hello {name}", comment: "", formats: {} }
  )
)

i18n.load("cs", {})
i18n.load({ cs: {} })
// @ts-expect-error this is an invalid call
i18n.load({ cs: {} }, {})
