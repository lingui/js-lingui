import { resolveCatalogPath, getEntryName } from "./resolveCatalogPath.js"
import { DEFAULT_TEMPLATE_NAME, ENTRY_NAME_PH } from "./constants.js"

export function resolveTemplatePath(
  entryPoint: string,
  output: string,
  rootDir: string,
  catalogExtension: string
) {
  let templateName: string

  if (output.includes(ENTRY_NAME_PH)) {
    templateName = DEFAULT_TEMPLATE_NAME
  } else {
    templateName = getEntryName(entryPoint)
  }

  return resolveCatalogPath(
    output,
    entryPoint,
    rootDir,
    templateName,
    catalogExtension
  )
}
