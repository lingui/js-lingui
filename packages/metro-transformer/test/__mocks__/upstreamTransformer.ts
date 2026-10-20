// Stands in for `@expo/metro-config/babel-transformer` and
// `@react-native/metro-babel-transformer`, which are optional peer
// dependencies and are not installed in this repo. Aliased in
// `vitest.config.ts` so the package entrypoints can be imported under test.
import type { BabelTransformer } from "../../src/types"

const upstreamTransformer: BabelTransformer = {
  transform: async () => ({ ast: null, metadata: null }),
  getCacheKey: () => "upstream-key",
}

export default upstreamTransformer
