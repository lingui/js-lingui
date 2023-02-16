import { ExtractorType } from "@lingui/conf"

const extractor: ExtractorType = {
  match(filename) {
    throw new Error(
      "Typescript extractor was removed. " +
        "Lingui CLI can parse typescript out of the box. " +
        "Please remove it from your lingui.config.js"
    )
  },

  extract(): Promise<void> | void {},
}

export default extractor
