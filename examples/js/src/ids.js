import { i18n } from "@lingui/core"
import { t, plural, defineMessage } from "@lingui/macro"

export function activate(locale) {
  const catalog = require(`./locale/${locale}/messages`)
  i18n.load({
    locale,
    messages: catalog.messages,
    localeData: catalog.localeData
  })
}

export const common = {
  yes: () =>
    defineMessage({
      id: "common.yes",
      comment: "Agreement",
      message: "Yes"
    }),
  no: () =>
    defineMessage({
      id: "common.no",
      comment: "Disagreement",
      message: "No"
    })
}

export function getStatic() {
  return defineMessage({
    id: "static",
    comment: "Title of example",
    message: "@lingui/core example"
  })
}

export function getVariables(name) {
  return defineMessage({
    id: "variables",
    message: t`Hello ${name}`
  })
}

export function getPlural(value) {
  return defineMessage({
    id: "plural",
    message: t`There are ${plural(value, {
      one: "# bottle",
      other: "# bottles"
    })} hanging on the wall`
  })
}

export function getLazy() {
  const yes = common.yes()
  const no = common.no()
  return defineMessage({
    id: "lazy",
    message: t`Do you want to proceed? ${yes}/${no}`
  })
}

function main() {
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
  activate("en")
  main()

  console.log()
  activate("cs")
  main()
}
