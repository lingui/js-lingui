/* @flow */
import { interpolate } from "./context"
import { isString, isFunction } from "./essentials"
import { date, number } from "./formats"
import type { DateFormat, NumberFormat } from "./formats"

import * as dev from "./dev"

type MessageOptions = {|
  defaults?: string,
  formats?: Object
|}

type Locale = string
type Locales = Locale | Locale[]

type LocaleData = {
  plurals?: Function
}

type Messages = { [msgId: string]: string | Function }

type Catalog = {
  messages: Messages,
  languageData: LocaleData
}

type Catalogs = { [locale: string]: Catalog }

type setupI18nProps = {
  language?: string,
  locales?: Locales,
  catalogs?: Catalogs,
  missing?: string | Function
}

class I18n {
  _language: string
  _locales: ?Locales

  // Message catalogs
  _catalogs: Catalogs
  _onActivate: Array<Function>

  _missing: ?string | Function

  _dev: Object

  date: Function
  number: Function

  constructor() {
    // Messages and languageData are merged on load,
    // so we must initialize it manually
    this._catalogs = {}
    this._onActivate = []
  }

  get availableLanguages(): Array<string> {
    return Object.keys(this._catalogs)
  }

  get language(): string {
    return this._language
  }

  get locales(): ?Locales {
    return this._locales
  }

  get messages(): Messages {
    return (this._catalogs[this._language] || { messages: {} }).messages
  }

  get languageData(): LocaleData {
    if (process.env.NODE_ENV !== "production") {
      if (
        !this._catalogs[this._language] ||
        !this._catalogs[this._language].languageData
      ) {
        return this._dev.loadLanguageData(this._language)
      }
    }
    return (this._catalogs[this._language] || { languageData: {} }).languageData
  }

  loadAll(catalogs: Catalogs) {
    Object.keys(catalogs).forEach(locale => this.load(locale, catalogs[locale]))
  }

  load(locale: Locale, catalog: Catalog) {
    if (!this._catalogs[locale]) {
      this._catalogs[locale] = {
        messages: {},
        languageData: {}
      }
    }

    Object.assign(this._catalogs[locale].messages, catalog.messages)
    Object.assign(this._catalogs[locale].languageData, catalog.languageData)
  }

  activate(locale: Locale, locales?: Locales) {
    if (!locale) return

    if (process.env.NODE_ENV !== "production") {
      if (this.availableLanguages.indexOf(locale) === -1) {
        console.warn(`Message catalog for locale "${locale}" not loaded.`)
      }
    }

    this._language = locale
    this._locales = locales
    this._onActivate.forEach(s => s())
  }

  use(language: string, locales?: Locales) {
    const i18n = setupI18n({
      language,
      locales,
      development: this._dev
    })
    i18n._catalogs = this._catalogs
    return i18n
  }

  onActivate(callback: Function): Function {
    this._onActivate.push(callback)
    return () => this._onActivate.filter(cb => cb !== callback)
  }

  // default translate method
  _(
    id: string | Object,
    values: Object = {},
    { defaults, formats = {} }: MessageOptions = {}
  ) {
    // Expand message descriptor
    if (id && typeof id === "object") {
      values = id.values
      defaults = id.defaults
      formats = id.formats
      id = id.id
    }

    let translation = this.messages[id] || defaults || id

    // replace missing messages with custom message for debugging
    const missing = this._missing
    if (missing && !this.messages[id]) {
      return isFunction(missing) ? missing(this.language, id) : missing
    }

    if (process.env.NODE_ENV !== "production") {
      if (isString(translation) && this._dev && isFunction(this._dev.compile)) {
        translation = this._dev.compile(translation)
      }
    }

    if (!isFunction(translation)) return translation
    return interpolate(
      translation,
      this.language,
      this.locales,
      this.languageData
    )(values, formats)
  }

  pluralForm(
    n: number,
    pluralType?: "cardinal" | "ordinal" = "cardinal"
  ): string {
    if (!this.languageData.plurals) return "other"
    return this.languageData.plurals(n, pluralType === "ordinal")
  }

  date(value: string | Date, format: DateFormat): string {
    return date(this.locales || this.language, format)(value)
  }

  number(value: number, format: NumberFormat): string {
    return number(this.locales || this.language, format)(value)
  }
}

function setupI18n(params?: setupI18nProps = {}): I18n {
  const i18n = new I18n()

  if (process.env.NODE_ENV !== "production") {
    i18n._dev = dev
  }

  if (params.catalogs) i18n.loadAll(params.catalogs)
  if (params.language) i18n.activate(params.language, params.locales)
  if (params.missing) i18n._missing = params.missing

  return i18n
}

export { setupI18n }
export type { MessageOptions, Catalog, Catalogs, LocaleData, I18n, Locales }
