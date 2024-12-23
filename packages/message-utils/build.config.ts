import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  // we want to inline @messageformat/date-skeleton package, because it's
  // esm only and will not work properly from ours cjs packages.
  // need to delete this as well as inlining after switching to the ESM
  failOnWarn: false,
})
