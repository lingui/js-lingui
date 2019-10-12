import { setupI18n } from "@lingui/core"
import { t, plural, defineMessage } from "@lingui/macro"

export const i18n = setupI18n()

i18n.loadAll({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages")
})

/**
 * Example: Lazy messages - common phrases are only defined, but not translated.
 */
export const common = {
  yes: () =>
    defineMessage({
      comment: "Agreement",
      message: "Yes"
    }),
  no: () =>
    defineMessage({
      comment: "Disagreement",
      message: "No"
    })
}

/**
 * Example: Static messages - add comment beginning with `i18n:` to add description.
 */
export function getStatic() {
  return defineMessage({
    comment: "Title of example",
    message: "@lingui/core example"
  })
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
    other: "# bottles"
  })} hanging on the wall`
}

/**
 * Example: Lazy translation - Message definitions are passed to `i18n._` to get
 * translation.
 */
export function getLazy() {
  const yes = common.yes()
  const no = common.no()
  return t`Do you want to proceed? ${yes}/${no}`
}

function main(locale) {
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
  i18n.activate("en")
  main()

  console.log()
  i18n.activate("cs")
  main()
}
