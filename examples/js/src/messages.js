import { setupI18n } from "@lingui/core"
import { t, plural, defineMessage, defineMessages } from "@lingui/macro"

export const i18n = setupI18n()

i18n.loadAll({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages")
})

/**
 * Example: Lazy messages - common phrases are only defined, but not translated.
 */
export const common = defineMessages({
  yes: {
    comment: "Agreement",
    message: "Yes"
  },
  no: {
    comment: "Disagreement",
    message: "No"
  }
})

/**
 * Example: Static messages - add comment beginning with `i18n:` to add description.
 */
export function getStatic() {
  const msg = defineMessage({
    comment: "Title of example",
    message: "@lingui/core example"
  })
  return i18n._(msg)
}

/**
 * Example: Interpolation - variables are passed to messages using template literals
 */
export function getVariables(name) {
  return i18n._(t`Hello ${name}`)
}

/**
 * Example: Plurals - Template literals can contain formats, like `plural`
 */
export function getPlural(value) {
  return i18n._(
    t`There are ${plural(value, {
      one: "# bottle",
      other: "# bottles"
    })} hanging on the wall`
  )
}

/**
 * Example: Lazy translation - Message definitions are passed to `i18n._` to get
 * translation.
 */
export function getLazy() {
  const yes = i18n._(common.yes)
  const no = i18n._(common.no)
  return i18n._(t`Do you want to proceed? ${yes}/${no}`)
}

function main(locale) {
  i18n.activate(locale)
  const header = getStatic()

  console.log(header)
  console.log("*".repeat(header.length))
  console.log()

  console.log(getVariables("Joe"))
  console.log(getPlural(1))
  console.log(getPlural(100))
  console.log()

  console.log(getLazy())
  console.log()
}

if (require.main === module) {
  main("en")

  console.log()
  main("cs")
}
