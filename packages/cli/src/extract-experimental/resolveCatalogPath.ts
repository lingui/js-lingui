import nodepath from "path"
import { replacePlaceholders } from "../api/utils"

export function resolveCatalogPath(
  configOutput: string,
  entryPath: string,
  rootDir: string,
  locale: string,
  extension: string
) {
  const entryName = getEntryName(entryPath)
  const entryDir = nodepath.relative(rootDir, nodepath.dirname(entryPath))

  return nodepath.normalize(
    replacePlaceholders(configOutput, {
      entryName,
      entryDir,
      locale,
    }) + extension
  )
}

export function getEntryName(entryPath: string) {
  const parsedPath = nodepath.parse(entryPath)
  return parsedPath.name.replace(parsedPath.ext, "")
}
