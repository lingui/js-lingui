import {
  detectDev, fromCookieDev, fromHtmlTagDev, fromNavigatorDev, fromPathDev, fromStorageDev, fromSubdomainDev, fromUrlDev, multipleDetectDev
} from "./detect-locale.development.js"

import {
  detectProd, fromCookieProd, fromHtmlTagProd, fromNavigatorProd, fromPathProd, fromStorageProd, fromSubdomainProd, fromUrlProd, multipleDetectProd
} from "./detect-locale.production.min.js"

export const detect = process.env.NODE_ENV === "production" ? detectProd : detectDev;
export const fromCookie = process.env.NODE_ENV === "production" ? fromCookieProd : fromCookieDev;
export const fromHtmlTag = process.env.NODE_ENV === "production" ? fromHtmlTagProd : fromHtmlTagDev;
export const fromNavigator = process.env.NODE_ENV === "production" ? fromNavigatorProd : fromNavigatorDev;
export const fromPath = process.env.NODE_ENV === "production" ? fromPathProd : fromPathDev;
export const fromStorage = process.env.NODE_ENV === "production" ? fromStorageProd : fromStorageDev;
export const fromSubdomain = process.env.NODE_ENV === "production" ? fromSubdomainProd : fromSubdomainDev;
export const fromUrl = process.env.NODE_ENV === "production" ? fromUrlProd : fromUrlDev;
export const multipleDetect = process.env.NODE_ENV === "production" ? multipleDetectProd : multipleDetectDev;