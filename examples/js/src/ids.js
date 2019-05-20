import { setupI18n } from "@lingui/core"
import { t, plural, defineMessages, defineMessage } from "@lingui/macro"

export const i18n = setupI18n()

i18n.loadAll({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages")
})

export const common = defineMessages({
  yes: {
    id: "common.yes",
    comment: "Agreement",
    message: "Yes"
  },
  no: {
    id: "common.no",
    comment: "Disagreement",
    message: "No"
  }
})

export function getStatic() {
  const message = defineMessage({
    id: "static",
    comment: "Title of example",
    message: "@lingui/core example"
  })
  return i18n._(message)
}

export function getVariables(name) {
  const message = defineMessage({
    id: "variables",
    message: t`Hello ${name}`
  })
  return i18n._(message)
}

export function getPlural(value) {
  const message = defineMessage({
    id: "plural",
    message: t`There are ${plural(value, {
      one: "# bottle",
      other: "# bottles"
    })} hanging on the wall`
  })
  return i18n._(message)
}

export function getLazy() {
  const yes = i18n._(common.yes)
  const no = i18n._(common.no)
  const message = defineMessage({
    id: "lazy",
    message: t`Do you want to proceed? ${yes}/${no}`
  })
  return i18n._(message)
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
