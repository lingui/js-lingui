import {
  detectDev, fromCookieDev, fromHtmlTagDev, fromNavigatorDev, fromPathDev, fromStorageDev, fromSubdomainDev, fromUrlDev, multipleDetectDev
} from "./detect-locale.development.js"

import {
  detect, fromCookie, fromHtmlTag, fromNavigator, fromPath, fromStorage, fromSubdomain, fromUrl, multipleDetect
} from "./detect-locale.production.min.js"

export const detect = process.env.NODE_ENV === "production" ? detect : detectDev;
export const fromCookie = process.env.NODE_ENV === "production" ? fromCookie : fromCookieDev;
export const fromHtmlTag = process.env.NODE_ENV === "production" ? fromHtmlTag : fromHtmlTagDev;
export const fromNavigator = process.env.NODE_ENV === "production" ? fromNavigator : fromNavigatorDev;
export const fromPath = process.env.NODE_ENV === "production" ? fromPath : fromPathDev;
export const fromStorage = process.env.NODE_ENV === "production" ? fromStorage : fromStorageDev;
export const fromSubdomain = process.env.NODE_ENV === "production" ? fromSubdomain : fromSubdomainDev;
export const fromUrl = process.env.NODE_ENV === "production" ? fromUrl : fromUrlDev;
export const multipleDetect = process.env.NODE_ENV === "production" ? multipleDetect : multipleDetectDev;