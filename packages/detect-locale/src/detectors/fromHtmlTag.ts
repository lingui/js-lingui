import { LocaleString } from ".."

export default function detectHtmlTag(
  htmlTagIdentifier: string,
  document: Document = globalThis.document
): LocaleString {
  if (htmlTagIdentifier) {
    return document.documentElement.getAttribute(htmlTagIdentifier)
  }
}