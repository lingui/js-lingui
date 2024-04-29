import { type I18n } from "@lingui/core"
import { inject, type Plugin } from "vue"

//

type LinguiPluginOptions = {
  i18n: I18n
}

export const linguiPlugin: Plugin<LinguiPluginOptions> = {
  install(app, options) {
    app.provide("i18n", options.i18n)
    options.i18n.on("change", () => {
      // TODO: make components re-render
    })
  },
}

export function useI18n(): I18n {
  const innerI18n = inject<I18n>("i18n")
  if (!innerI18n) {
    throw new Error(
      "Should provider an i18n instance 1st; use the LinguiPlugin."
    )
  }
  return innerI18n
}
