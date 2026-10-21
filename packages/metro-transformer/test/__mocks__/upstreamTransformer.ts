import type { BabelTransformer } from "../../src/types"

const upstreamTransformer: BabelTransformer = {
  transform: async () => ({ ast: null, metadata: null }),
  getCacheKey: () => "upstream-key",
}

export default upstreamTransformer
