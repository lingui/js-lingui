import { setupI18n } from "@lingui/core"
import { t, plural } from "@lingui/macro"

export const i18n = setupI18n()

i18n.load({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages")
})

export const common = {
  yes: /*i18n: Agreement */ t("common.yes")`Yes`,
  no: /*i18n: Disagreement */ t("common.no")`No`
}

export function getStatic() {
  return i18n._(/*i18n: Title of example*/ t("static")`@lingui/core example`)
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

export function getLazy() {
  const yes = i18n._(common.yes)
  const no = i18n._(common.no)
  return i18n._(t("lazy")`Do you want to proceed? ${yes}/${no}`)
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
