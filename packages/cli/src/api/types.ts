import type { CatalogType } from "@lingui/conf"
export type {
  MessageOrigin,
  ExtractedMessageType,
  MessageType,
  ExtractedCatalogType,
  CatalogType,
} from "@lingui/conf"

export type AllCatalogsType = {
  [locale: string]: CatalogType
}
