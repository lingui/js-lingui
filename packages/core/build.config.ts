import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  externals: ["@lingui/core"],
  failOnWarn: false,
})
