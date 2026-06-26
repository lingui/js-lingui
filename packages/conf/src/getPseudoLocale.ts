import type { LinguiConfig, PseudoLocaleOptions } from "./types"

/**
 * Extracts the pseudo-locale name from the `pseudoLocale` config, which can be
 * provided either as a plain string or as a {@link PseudoLocaleConfig} object.
 */
export const getPseudoLocale = (
  pseudoLocale: LinguiConfig["pseudoLocale"],
): string =>
  typeof pseudoLocale === "string" ? pseudoLocale : (pseudoLocale?.locale ?? "")

/**
 * Extracts the {@link PseudoLocaleOptions} from the `pseudoLocale` config.
 * Returns an empty object when the config is unset or provided as a plain string.
 */
export const getPseudoLocaleOptions = (
  pseudoLocale: LinguiConfig["pseudoLocale"],
): PseudoLocaleOptions => {
  if (!pseudoLocale || typeof pseudoLocale === "string") return {}
  const { locale, ...options } = pseudoLocale
  return options
}
