import path from "path"
import { defineProject } from "vitest/config"

// `@expo/metro-config` and `@react-native/metro-babel-transformer` are
// optional peer dependencies that aren't installed here, so the package
// entrypoints can't be imported under test without standing them in.
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
