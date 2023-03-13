import { LinguiConfigNormalized } from "@lingui/conf"
import glob from "glob"
import path from "path"
import { Catalog } from "../catalog"
import { normalizeRelativePath, PATHSEP, replacePlaceholders } from "../utils"
import micromatch from "micromatch"
import { getFormat } from "../formats"
import { getExperimentalCatalogs } from "../../extract-experimental/getExperimentalCatalogs"

const NAME_PH = "{name}"
const LOCALE_PH = "{locale}"

/**
 * Parse `config.catalogs` and return a list of configured Catalog instances.
 */
export function getCatalogs(config: LinguiConfigNormalized): Catalog[] {
  const catalogsConfig = config.catalogs
  const catalogs: Catalog[] = []

  catalogsConfig.forEach((catalog) => {
    validateCatalogPath(catalog.path, config)

    const include = ensureArray(catalog.include).map(normalizeRelativePath)
    const exclude = ensureArray(catalog.exclude).map(normalizeRelativePath)

    // catalog.path without {name} pattern -> always refers to a single catalog
    if (!catalog.path.includes(NAME_PH)) {
      // Validate that sourcePaths doesn't use {name} pattern either
      const invalidSource = include.find((path) => path.includes(NAME_PH))
      if (invalidSource !== undefined) {
        throw new Error(
          `Catalog with path "${catalog.path}" doesn't have a {name} pattern` +
            ` in it, but one of source directories uses it: "${invalidSource}".` +
            ` Either add {name} pattern to "${catalog.path}" or remove it` +
            ` from all source directories.`
        )
      }

      catalogs.push(
        new Catalog(
          {
            name: getCatalogName(catalog.path),
            path: normalizeRelativePath(catalog.path),
            include,
            exclude,
          },
          config
        )
      )
      return
    }

    const patterns = include.map((path) =>
      replacePlaceholders(path, { name: "*" })
    )
    const candidates = glob.sync(
      patterns.length > 1 ? `{${patterns.join(",")}}` : patterns[0],
      {
        ignore: exclude,
        mark: true,
      }
    )

    candidates.forEach((catalogDir) => {
      const name = path.basename(catalogDir)
      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelativePath(
              replacePlaceholders(catalog.path, { name })
            ),
            include: include.map((path) => replacePlaceholders(path, { name })),
            exclude: exclude.map((path) => replacePlaceholders(path, { name })),
          },
          config
        )
      )
    })
  })

  if (config.experimental?.extractor?.entries.length) {
    catalogs.push(...getExperimentalCatalogs(config))
  }

  return catalogs
}

/**
 * Ensure that value is always array. If not, turn it into an array of one element.
 */
const ensureArray = <T>(value: Array<T> | T | null | undefined): Array<T> => {
  if (value == null) return []

  return Array.isArray(value) ? value : [value]
}

/**
 * Create catalog for merged messages.
 */
export function getCatalogForMerge(config: LinguiConfigNormalized) {
  validateCatalogPath(config.catalogsMergePath, config)

  return new Catalog(
    {
      name: getCatalogName(config.catalogsMergePath),
      path: normalizeRelativePath(config.catalogsMergePath),
      include: [],
      exclude: [],
    },
    config
  )
}

export function getCatalogForFile(file: string, catalogs: Catalog[]) {
  for (const catalog of catalogs) {
    const catalogFile = `${catalog.path}${catalog.format.catalogExtension}`
    const catalogGlob = replacePlaceholders(catalogFile, { locale: "*" })
    const match = micromatch.capture(
      normalizeRelativePath(path.relative(catalog.config.rootDir, catalogGlob)),
      normalizeRelativePath(file)
    )
    if (match) {
      return {
        locale: match[0],
        catalog,
      }
    }
  }

  return null
}

/**
 *  Validate that `catalogPath` doesn't end with trailing slash
 */
function validateCatalogPath(path: string, config: LinguiConfigNormalized) {
  if (!path.endsWith(PATHSEP)) {
    return
  }

  const extension = getFormat(
    config.format,
    config.formatOptions
  ).catalogExtension
  const correctPath = path.slice(0, -1)
  const examplePath =
    replacePlaceholders(correctPath, {
      locale: (config.locales || [])[0] || "en",
    }) + extension
  throw new Error(
    // prettier-ignore
    `Remove trailing slash from "${path}". Catalog path isn't a directory,` +
    ` but translation file without extension. For example, catalog path "${correctPath}"` +
    ` results in translation file "${examplePath}".`
  )
}

function getCatalogName(filePath: string) {
  // catalog name is the last directory of catalogPath.
  // If the last part is {locale}, then catalog doesn't have an explicit name
  const _name = path.basename(normalizeRelativePath(filePath))
  return _name !== LOCALE_PH ? _name : null
}
