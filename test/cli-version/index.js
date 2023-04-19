import { execa } from "execa"
import assert from "node:assert"

const { stdout } = await execa("lingui", ["--version"])
assert.match(stdout, /^\d\.\d\.\d/)
