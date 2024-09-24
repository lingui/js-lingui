import { SnapshotSerializer } from "vitest"
import stripAnsi from "strip-ansi"

export default {
  serialize(val) {
    return stripAnsi(val)
  },
  test(val) {
    return typeof val === "string"
  },
} satisfies SnapshotSerializer
