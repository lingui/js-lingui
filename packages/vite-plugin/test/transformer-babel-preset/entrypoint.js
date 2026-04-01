import { i18n } from "@lingui/core"
import { t } from "@lingui/core/macro"

export async function load() {
  i18n.loadAndActivate({
    locale: "en",
    messages: {},
  })
  return t`Ola`
}
