import "./utils/globalThis.polyfill.js"
import fromCookie from "./detectors/fromCookie"
import fromPath from "./detectors/fromPath"
import fromStorage from "./detectors/fromStorage"
import fromNavigator from "./detectors/fromNavigator"
import fromSubdomain from "./detectors/fromSubdomain"
import fromHtmlTag from "./detectors/fromHtmlTag"
import fromUrl from "./detectors/fromUrl"

export type LocaleString = string
export type DetectParamsFunctions = string

function detect(...args): LocaleString | null {
  for (let i = 0; i < args.length; i++) {
    const res: LocaleString = typeof args[i] === "function" ? args[i]() : args[i]
    if (res) return res
  }

  return null
}

function multipleDetect(...args): LocaleString[] {
  const locales = []
  for (let i = 0; i < args.length; i++) {
    const res: LocaleString = typeof args[i] === "function" ? args[i]() : args[i]
    if (res) locales.push(res)
  }

  return locales
}

export {
  detect,
  multipleDetect,
  fromCookie,
  fromHtmlTag,
  fromNavigator,
  fromPath,
  fromStorage,
  fromSubdomain,
  fromUrl,
}
