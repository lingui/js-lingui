import path from "path"
import { LinguiConfig } from "../types"
import { pathJoinPosix } from "../utils/pathJoinPosix"
import chalk from "chalk"

/**
 * Replace localeDir, srcPathDirs and srcPathIgnorePatterns with catalogs
 *
 * Released in @lingui/conf 3.0
 * Remove anytime after 4.x
 */
export type DeprecatedLocaleDir = {
  localeDir: string
  srcPathDirs: string[]
  srcPathIgnorePatterns: string[]
}

const buildMsg =
  (field: string) => (config: LinguiConfig & DeprecatedLocaleDir) =>
    ` Option ${chalk.bold(
      field
    )} is deprecated. Configure source paths using ${chalk.bold(
      "catalogs"
    )} instead.

    @lingui/cli now treats your current configuration as:

    {
      ${chalk.bold('"catalogs"')}: ${JSON.stringify(
      catalogMigration(config).catalogs,
      null,
      2
    )}
    }

    Please update your configuration.
    `

export const catalogMigrationDeprecations = {
  localeDir: buildMsg("localeDir"),
  srcPathDirs: buildMsg("srcPathDirs"),
  srcPathIgnorePatterns: buildMsg("srcPathIgnorePatterns"),
}

export function catalogMigration(
  config: Partial<LinguiConfig & DeprecatedLocaleDir>
): LinguiConfig {
  let { localeDir, srcPathDirs, srcPathIgnorePatterns, ...newConfig } = config

  if (localeDir || srcPathDirs || srcPathIgnorePatterns) {
    localeDir =
      localeDir ?? pathJoinPosix("<rootDir>", "locale", "{locale}", "messages")

    let newLocaleDir = localeDir.split(path.sep).join("/")
    if (newLocaleDir.slice(-1) !== path.sep) {
      newLocaleDir += "/"
    }

    newConfig.catalogs = [
      {
        path: pathJoinPosix(newLocaleDir, "{locale}", "messages"),
        include: srcPathDirs ?? ["<rootDir>"],
        exclude: srcPathIgnorePatterns ?? ["**/node_modules/**"],
      },
    ]
  }

  return newConfig as LinguiConfig
}
