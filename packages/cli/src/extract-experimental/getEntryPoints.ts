import glob from "glob"

export function getEntryPoints(entries: string[]) {
  const patterns = entries.length > 1 ? `{${entries.join(",")}}` : entries[0]

  return glob.sync(patterns, { mark: true })
}
