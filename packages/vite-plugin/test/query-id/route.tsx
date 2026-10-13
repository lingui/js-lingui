import { t } from "@lingui/core/macro"
import { i18n } from "@lingui/core"

type Locale = "en"

export async function load(locale: Locale = "en"): Promise<string> {
  i18n.loadAndActivate({
    locale,
    messages: {},
  })
  return t`Ola`
}
