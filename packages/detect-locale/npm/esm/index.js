import {
  detect as detectDev,
  fromCookie as fromCookieDev,
  fromHtmlTag as fromHtmlTagDev,
  fromNavigator as fromNavigatorDev,
  fromPath as fromPathDev,
  fromStorage as fromStorageDev,
  fromSubdomain as fromSubdomainDev,
  fromUrl as fromUrlDev,
  multipleDetect as multipleDetectDev,
} from "./detect-locale.development.js"

import {
  detect as detectProd,
  fromCookie as fromCookieProd,
  fromHtmlTag as fromHtmlTagProd,
  fromNavigator as fromNavigatorProd,
  fromPath as fromPathProd,
  fromStorage as fromStorageProd,
  fromSubdomain as fromSubdomainProd,
  fromUrl as fromUrlProd,
  multipleDetect as multipleDetectProd,
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