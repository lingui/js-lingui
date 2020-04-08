import { setupI18n } from "@lingui/core"
import { t, plural, defineMessage } from "@lingui/macro"

export const i18n = setupI18n()

const enCatalog = require("./locale/en/messages")
const csCatalog = require("./locale/cs/messages")

i18n.loadLocaleData({
  en: enCatalog.localeData,
  cs: csCatalog.localeData,
})
i18n.load({
  en: enCatalog.messages,
  cs: csCatalog.messages,
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
  i18n.activate("en")
  main()

  console.log()
  i18n.activate("cs")
  main()
}
