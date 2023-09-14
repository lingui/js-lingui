import assert from "node:assert"

assert(await import("@lingui/cli/api"))

assert(await import("@lingui/cli/api/extractors/typescript"))
assert(await import("@lingui/cli/api/extractors/babel"))

assert(await import("@lingui/core"))
assert(await import("@lingui/react/server"))
