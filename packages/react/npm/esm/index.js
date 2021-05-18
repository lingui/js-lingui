import {
  I18nProvider as devI18nProvider, Trans as devTrans, useLingui as devuseLingui, withI18n as devwithI18n
} from "./react.development.js"

import {
  I18nProvider, Trans, useLingui, withI18n
} from "./react.production.min.js"

export const I18nProvider = process.env.NODE_ENV === "production" ? I18nProvider : devI18nProvider;
export const Trans = process.env.NODE_ENV === "production" ? Trans : devTrans;
export const useLingui = process.env.NODE_ENV === "production" ? useLingui : devuseLingui;
export const withI18n = process.env.NODE_ENV === "production" ? withI18n : devwithI18n;