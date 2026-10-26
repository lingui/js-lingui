import { i18n } from "@lingui/core"
import { t, plural, defineMessage } from "@lingui/core/macro"
import { messages as enMessages } from "./locale/en/messages.mjs"
import { messages as csMessages } from "./locale/cs/messages.mjs"

i18n.load({
  en: enMessages,
  cs: csMessages,
})

/**
 * Example: Lazy messages - common phrases are only defined, but not translated.
 */
export const common = {
  yes: defineMessage({
    comment: "Agreement",
    message: "Yes",
  }),
  no: defineMessage({
    comment: "Disagreement",
    message: "No",
  }),
}

/**
 * Example: Static messages - add comment beginning with `i18n:` to add description.
 */
export function getStatic() {
  return i18n._(
    defineMessage({
      comment: "Title of example",
      message: "@lingui/core example",
    })
  )
}

/**
 * Example: Interpolation - variables are passed to messages using template literals
 */
export function getVariables(name) {
  return t`Hello ${name}`
}

/**
 * Example: Plurals - Template literals can contain formats, like `plural`
 */
export function getPlural(value) {
  return t`There are ${plural(value, {
    one: "# bottle",
    other: "# bottles",
  })} hanging on the wall`
}

/**
 * Example: Lazy translation - Message definitions are passed to `i18n._` to get
 * translation.
 */
export function getLazy() {
  const yes = i18n._(common.yes)
  const no = i18n._(common.no)
  return t`Do you want to proceed? ${yes}/${no}`
}
