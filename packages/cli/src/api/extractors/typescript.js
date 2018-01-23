// @flow
import type { ExtractorType } from "./types"

const typescriptRe = /\.jsx?$/i

const extractor: ExtractorType = {
  match(filename) {
    return typescriptRe.test(filename)
  },

  extract(filename, targetDir) {}
}

export default extractor
