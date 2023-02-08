import { FallbackLocales, LinguiConfig, LinguiConfigNormalized } from "../types"
import chalk from "chalk"

export type DeprecatedFallbackLanguage = { fallbackLocale?: string }

/**
 * Replace fallbackLocale, by the new standard fallbackLocales
 * - https://github.com/lingui/js-lingui/issues/791
 * - Remove anytime after 4.x
 */
export function fallbackLanguageMigration(
  config: LinguiConfig & DeprecatedFallbackLanguage
): LinguiConfigNormalized {
  const { fallbackLocale, fallbackLocales } = config

  if (fallbackLocales === false) {
    return config as LinguiConfigNormalized
  }

  const DEFAULT_FALLBACK = fallbackLocales?.default || fallbackLocale

  if (DEFAULT_FALLBACK) {
    config.fallbackLocales = {
      default: DEFAULT_FALLBACK,
      ...(config.fallbackLocales || {}),
    } as FallbackLocales
  }

  return config as LinguiConfigNormalized
}

export const fallbackLanguageMigrationDeprecations = {
  fallbackLocale: (config: LinguiConfig & DeprecatedFallbackLanguage) =>
    ` Option ${chalk.bold("fallbackLocale")} was replaced by ${chalk.bold(
      "fallbackLocales"
    )}

    You can find more information here: https://github.com/lingui/js-lingui/issues/791

    @lingui/cli now treats your current configuration as:
    {
      ${chalk.bold('"fallbackLocales"')}: {
        default: ${chalk.bold(`"${config.fallbackLocale}"`)}
      }
    }

    Please update your configuration.
    `,
}
