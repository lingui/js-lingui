import { execSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"

// lerna's conventional-changelog output leaves extra blank lines between
// releases. Runs as part of the root `version` script, after lerna writes them.
const files = execSync("git ls-files CHANGELOG.md 'packages/*/CHANGELOG.md'", {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)

for (const file of files) {
  const content = readFileSync(file, "utf8")
  const tidy = content.replace(/\n{3,}/g, "\n\n")

  if (tidy !== content) {
    writeFileSync(file, tidy)
  }
}
