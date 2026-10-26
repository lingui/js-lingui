import { i18n } from "@lingui/core"
import { t, plural, defineMessage } from "@lingui/core/macro"
import { messages as enMessages } from "./locale/en/messages.mjs"
import { messages as csMessages } from "./locale/cs/messages.mjs"

i18n.load({
  en: enMessages,
  cs: csMessages,
})

export const common = {
  yes: defineMessage({
    id: "common.yes",
    comment: "Agreement",
    message: "Yes",
  }),
  no: defineMessage({
    id: "common.no",
    comment: "Disagreement",
    message: "No",
  }),
}

export function getStatic() {
  return i18n._(
    defineMessage({
      id: "static",
      comment: "Title of example",
      message: "@lingui/core example",
    })
  )
}

export function getVariables(name) {
  return i18n._(
    defineMessage({
      id: "variables",
      message: t`Hello ${name}`,
    })
  )
}

export function getPlural(value) {
  return i18n._(
    defineMessage({
      id: "plural",
      message: t`There are ${plural(value, {
        one: "# bottle",
        other: "# bottles",
      })} hanging on the wall`,
    })
  )
}

export function getLazy() {
  const yes = i18n._(common.yes)
  const no = i18n._(common.no)
  return i18n._(
    defineMessage({
      id: "lazy",
      message: t`Do you want to proceed? ${yes}/${no}`,
    })
  )
}
