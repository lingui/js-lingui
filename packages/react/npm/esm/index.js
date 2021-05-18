import {
  I18nProvider as devI18nProvider, Trans as devTrans, useLingui as devuseLingui, withI18n as devwithI18n
} from "./react.development.js"

import {
  I18nProvider as I18nProviderProd, Trans as TransProd, useLingui as useLinguiProd, withI18n as withI18nProd
} from "./react.production.min.js"

export const I18nProvider = process.env.NODE_ENV === "production" ? I18nProviderProd : devI18nProvider;
export const Trans = process.env.NODE_ENV === "production" ? TransProd : devTrans;
export const useLingui = process.env.NODE_ENV === "production" ? useLinguiProd : devuseLingui;
export const withI18n = process.env.NODE_ENV === "production" ? withI18nProd : devwithI18n;