import { t } from "@lingui/core/macro"
import { i18n } from "@lingui/core"

// The TypeScript annotation is the point: the native transform has to know the
// file is TSX from its name, and the name is what the query string hides.
export async function load(): Promise<string> {
  i18n.loadAndActivate({
    locale: "en",
    messages: {},
  })
  return t`Ola`
}
