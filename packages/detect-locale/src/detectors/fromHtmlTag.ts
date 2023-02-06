import { LocaleString } from ".."

export default function detectHtmlTag(
  htmlTagIdentifier: string,
  document: Partial<Document> = globalThis.document
): LocaleString {
  if (htmlTagIdentifier) {
    return document.documentElement.getAttribute(htmlTagIdentifier)
  }

  return null
}
