// @flow
import R from "ramda"

import type { LinguiConfig, CatalogFormat } from "./types"
import lingui from "./lingui"

function deserialize(catalog) {
  return R.map(
    translation => ({
      translation,
      defaults: "",
      origin: []
    }),
    catalog
  )
}

function serialize(catalog) {
  return R.map(message => message.translation || "", catalog)
}

export default (config: LinguiConfig): CatalogFormat => {
  const linguiFormat = lingui(config)

  return {
    ...linguiFormat,

    write(locale, messages) {
      return linguiFormat.write(locale, serialize(messages))
    },

    read(locale) {
      return deserialize(linguiFormat.read(locale))
    }
  }
}
