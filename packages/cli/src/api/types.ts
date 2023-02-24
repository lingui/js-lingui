export type MessageOrigin = [filename: string, line?: number]
export type ExtractedMessageType = {
  message?: string
  origin?: MessageOrigin[]
  comments?: string[]
  extractedComments?: string[]
  obsolete?: boolean
  flags?: string[]
  context?: string
}
export type MessageType = ExtractedMessageType & {
  translation: string
}
export type ExtractedCatalogType = {
  [msgId: string]: ExtractedMessageType
}
export type CatalogType = {
  [msgId: string]: MessageType
}
export type AllCatalogsType = {
  [locale: string]: CatalogType
}
