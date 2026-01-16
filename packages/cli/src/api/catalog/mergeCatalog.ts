import type { MergeOptions } from "../catalog"
import { CatalogType, ExtractedCatalogType } from "../types"

export function mergeCatalog(
  prevCatalog: CatalogType,
  nextCatalog: ExtractedCatalogType,
  forSourceLocale: boolean,
  options: MergeOptions
): CatalogType {
  const nextKeys = Object.keys(nextCatalog)
  const prevKeys = Object.keys(prevCatalog || {})

  const newKeys = nextKeys.filter((key) => !prevKeys.includes(key))
  const mergeKeys = nextKeys.filter((key) => prevKeys.includes(key))
  const obsoleteKeys = prevKeys.filter((key) => !nextKeys.includes(key))

  // Initialize new catalog with new keys
  const newMessages: CatalogType = Object.fromEntries(
    newKeys.map((key) => [
      key,
      {
        translation: forSourceLocale ? nextCatalog[key].message || key : "",
        ...nextCatalog[key],
      },
    ])
  )

  // Merge translations from previous catalog
  const mergedMessages = Object.fromEntries(
    mergeKeys.map((key) => {
      const updateFromDefaults =
        forSourceLocale &&
        (prevCatalog[key].translation === prevCatalog[key].message ||
          options.overwrite)

      const translation = updateFromDefaults
        ? nextCatalog[key].message || key
        : prevCatalog[key].translation

      const { obsolete, ...rest } = nextCatalog[key]
      const { extra } = prevCatalog[key]

      return [key, { ...extra, ...rest, translation }]
    })
  )

  // Mark all remaining translations as obsolete
  // Only if *options.files* is not provided
  const obsoleteMessages = Object.fromEntries(
    obsoleteKeys.map((key) => [
      key,
      {
        ...prevCatalog[key],
        ...(options.files ? {} : { obsolete: true }),
      },
    ])
  )

  return { ...newMessages, ...mergedMessages, ...obsoleteMessages }
}
