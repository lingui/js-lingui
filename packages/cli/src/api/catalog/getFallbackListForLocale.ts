import { FallbackLocales } from "@lingui/conf"

export function getFallbackListForLocale(
  fallbackLocales: FallbackLocales,
  locale: string
): string[] {
  const fL: string[] = []

  if (fallbackLocales?.[locale]) {
    const mapping = fallbackLocales?.[locale]
    Array.isArray(mapping) ? fL.push(...mapping) : fL.push(mapping)
  }

  if (fallbackLocales?.default && locale !== fallbackLocales?.default) {
    fL.push(fallbackLocales?.default)
  }

  return fL
}
