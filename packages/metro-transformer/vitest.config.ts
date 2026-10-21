import path from "path"
import { defineProject } from "vitest/config"

// the upstream transformers are optional peer deps and aren't installed here
const upstreamTransformerStub = path.join(
  import.meta.dirname,
  "test",
  "__mocks__",
  "upstreamTransformer.ts",
)

export default defineProject({
  test: {
    globals: true,
    alias: {
      "@expo/metro-config/babel-transformer": upstreamTransformerStub,
      "@react-native/metro-babel-transformer": upstreamTransformerStub,
    },
  },
})
