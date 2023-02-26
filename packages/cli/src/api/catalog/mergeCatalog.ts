import * as R from "ramda"
import type { MergeOptions } from "../catalog"
import { CatalogType, ExtractedCatalogType, MessageType } from "../types"

export function mergeCatalog(
  prevCatalog: CatalogType,
  nextCatalog: ExtractedCatalogType,
  forSourceLocale: boolean,
  options: MergeOptions
): CatalogType {
  const nextKeys = Object.keys(nextCatalog)

  const prevKeys = R.keys(prevCatalog).map(String)

  const newKeys = R.difference(nextKeys, prevKeys)
  const mergeKeys = R.intersection(nextKeys, prevKeys)
  const obsoleteKeys = R.difference(prevKeys, nextKeys)

  // Initialize new catalog with new keys
  const newMessages = R.mapObjIndexed(
    (message: MessageType, key) => ({
      translation: forSourceLocale ? message.message || key : "",
      ...message,
    }),
    R.pick(newKeys, nextCatalog)
  )

  // Merge translations from previous catalog
  const mergedMessages = mergeKeys.map((key) => {
    const updateFromDefaults =
      forSourceLocale &&
      (prevCatalog[key].translation === prevCatalog[key].message ||
        options.overwrite)

    const translation = updateFromDefaults
      ? nextCatalog[key].message || key
      : prevCatalog[key].translation

    return {
      [key]: {
        translation,
        ...R.omit(["obsolete, translation"], nextCatalog[key]),
      },
    }
  })

  // Mark all remaining translations as obsolete
  // Only if *options.files* is not provided
  const obsoleteMessages = obsoleteKeys.map((key) => ({
    [key]: {
      ...prevCatalog[key],
      obsolete: !options.files,
    },
  }))

  return R.mergeAll([newMessages, ...mergedMessages, ...obsoleteMessages])
}
