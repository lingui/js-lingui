// eslint-disable-next-line import/no-extraneous-dependencies
import { expectType } from "tsd"
import { i18n } from "@lingui/core"

expectType<string>(i18n._("message.id"))
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
