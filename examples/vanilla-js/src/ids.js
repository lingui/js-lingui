import { setupI18n } from "@lingui/core"
import { t, plural } from "@lingui/macro"

export const i18n = setupI18n()

i18n.load({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages")
})

export function getStatic() {
  return i18n._(t("static")`@lingui/core example`)
}

export function getVariables(name) {
  return i18n._(t("variables")`Hello ${name}`)
}

export function getPlural(value) {
  return i18n._(
    t("plural")`There are ${plural({
      value,
      one: "# bottle",
      other: "# bottles"
    })} hanging on the wall`
  )
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
}

if (require.main === module) {
  main("en")

  console.log()
  main("cs")
}
