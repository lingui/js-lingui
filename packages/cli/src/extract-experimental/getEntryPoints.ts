import { globSync } from "glob"

export function getEntryPoints(entries: string[]) {
  return globSync(entries, { mark: true })
}
