import type { MergeOptions } from "../catalog.js"
import { CatalogType, ExtractedCatalogType } from "../types.js"

export function mergeCatalog(
  prevCatalog: CatalogType | undefined,
  nextCatalog: ExtractedCatalogType,
  forSourceLocale: boolean,
  options: MergeOptions,
): CatalogType {
  prevCatalog = prevCatalog || {}
  const nextKeys = Object.keys(nextCatalog)
  const prevKeys = Object.keys(prevCatalog)

  const hasKeysInBothCatalogs = prevKeys.length > 0 && nextKeys.length > 0
  let newKeys: string[]
  let mergeKeys: string[]
  let obsoleteKeys: string[]

  if (hasKeysInBothCatalogs) {
    const prevKeySet = new Set(prevKeys)
    const nextKeySet = new Set(nextKeys)

    newKeys = nextKeys.filter((key) => !prevKeySet.has(key))
    mergeKeys = nextKeys.filter((key) => prevKeySet.has(key))
    obsoleteKeys = prevKeys.filter((key) => !nextKeySet.has(key))
  } else {
    newKeys = nextKeys
    mergeKeys = []
    obsoleteKeys = prevKeys
  }

  // Initialize new catalog with new keys
  const newMessages: CatalogType = Object.fromEntries(
    newKeys.map((key) => [
      key,
      {
        translation: forSourceLocale ? nextCatalog[key]!.message || key : "",
        ...nextCatalog[key],
      },
    ]),
  )

  // Merge translations from previous catalog
  const mergedMessages = Object.fromEntries(
    mergeKeys.map((key) => {
      const updateFromDefaults =
        forSourceLocale &&
        (prevCatalog[key]!.translation === prevCatalog[key]!.message ||
          options.overwrite)

      const translation = updateFromDefaults
        ? nextCatalog[key]!.message || key
        : prevCatalog[key]!.translation

      const { extra } = prevCatalog[key]!

      return [key, { ...nextCatalog[key], extra, translation }]
    }),
  )

  // Mark all remaining translations as obsolete
  // Only if *options.files* is not provided
  const obsoleteMessages = Object.fromEntries(
    obsoleteKeys.map((key) => [
      key,
      {
        ...prevCatalog![key],
        ...(options.files ? {} : { obsolete: true }),
      },
    ]),
  )

  return { ...newMessages, ...mergedMessages, ...obsoleteMessages }
}
