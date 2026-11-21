import { t } from "@lingui/core/macro"
import { i18n } from "@lingui/core"
import { plain } from "./no-macro.js"

export async function load() {
  i18n.loadAndActivate({
    locale: "en",
    messages: {},
  })
  return { message: t`Ola`, plain }
}
