import { setupI18n } from "@lingui/core"
import { t, plural } from "@lingui/macro"

export const i18n = setupI18n()

i18n.load({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages")
})

/**
 * Example: Lazy messages - common phrases are only defined, but not translated.
 */
export const common = {
  yes: /*i18n: Agreement */ t`Yes`,
  no: /*i18n: Disagreement */ t`No`
}

/**
 * Example: Static messages - add comment beginning with `i18n:` to add description.
 */
export function getStatic() {
  return i18n._(/*i18n: Title of example*/ t`@lingui/core example`)
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
    t`There are ${plural({
      value,
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
