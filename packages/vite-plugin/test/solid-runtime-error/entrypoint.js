import { t } from "@lingui/core/macro"
import { i18n } from "@lingui/core"

export async function load() {
  i18n.loadAndActivate({
    locale: "en",
    messages: {},
  })
  return t`Ola`
}
