import { interpolate } from "./context"
import { isString, isFunction, isEmpty } from "./essentials"
import { date, number } from "./formats"
import * as icu from "./dev"

type MessageOptions = {
  defaults?: string
  formats?: Object
}

export type Locale = string
export type Locales = Locale | Locale[]

type LocaleData = {
  plurals?: Function
}

type Messages = { [msgId: string]: string | Function }

type Catalog = {
  messages: Messages
  localeData?: LocaleData
}

type Catalogs = { [locale: string]: Catalog }

type setupI18nProps = {
  locale?: Locale
  locales?: Locales
  catalogs?: Catalogs
  missing?: string | ((message, id) => string)
}

class I18n {
  messageFormat: typeof icu
  _catalogs: Catalogs
  _didActivate: Array<Function>
  _willActivate: Array<Function>
  _locale: Locale
  _locales: Locales
  _missing: string | ((message, id) => string)

  constructor() {
    // Messages and localeData are merged on load,
    // so we must initialize it manually
    this._catalogs = {}
    this._didActivate = []
    this._willActivate = []
  }

  get locale() {
    return this._locale
  }

  get locales() {
    return this._locales
  }

  get catalog(): Catalog {
    return this._catalogs[this.locale]
  }

  get messages(): Messages {
    return this.catalog && this.catalog.messages ? this.catalog.messages : {}
  }

  get localeData(): LocaleData {
    if (process.env.NODE_ENV !== "production") {
      if (!this.catalog) {
        this._catalogs[this.locale] = {
          messages: {}
        }
      }
      if (isEmpty(this.catalog.localeData)) {
        this.catalog.localeData = this.messageFormat.loadLocaleData(
          this._locale
        )
      }
    }
    return this.catalog.localeData
  }

  loadAll(catalogs: Catalogs) {
    Object.keys(catalogs).forEach(locale => this.load(locale, catalogs[locale]))
  }

  load(locale: Locale, catalog?: Catalog): Promise<void> {
    if (catalog == null) {
      return Promise.all(
        this._willActivate.map(load =>
          load(locale).then(catalog => this.load(locale, catalog))
        )
      ).then(() => {})
    }

    if (this._catalogs[locale] == null) {
      this._catalogs[locale] = {
        messages: {},
        localeData: {}
      }
    }

    const prev = this._catalogs[locale]
    Object.assign(prev.messages, catalog.messages)
    Object.assign(prev.localeData, catalog.localeData)
    return Promise.resolve()
  }

  activate(locale: Locale, locales?: Locales) {
    if (!this._catalogs[locale]) {
      if (this._willActivate.length) {
        return this.load(locale).then(() => this.activate(locale, locales))
      }

      if (process.env.NODE_ENV !== "production") {
        console.warn(`Message catalog for locale "${locale}" not loaded.`)
      }
    }

    this._locale = locale
    this._locales = locales
    this._didActivate.forEach(s => s())
    return Promise.resolve()
  }

  use(locale: Locale, locales?: Locales) {
    const i18n = setupI18n()
    i18n._catalogs = this._catalogs
    i18n.activate(locale, locales)
    return i18n
  }

  willActivate(callback: (locale: Locale) => Promise<Catalog>): Function {
    this._willActivate.push(callback)
    return () => this._willActivate.filter(cb => cb !== callback)
  }

  didActivate(callback: () => void): Function {
    this._didActivate.push(callback)
    return () => this._didActivate.filter(cb => cb !== callback)
  }

  // default translate method
  _(
    id: string,
    values: Object | undefined = {},
    { defaults, formats }: MessageOptions | undefined = {}
  ) {
    let translation = this.messages[id] || defaults || id

    // replace missing messages with custom message for debugging
    const missing = this._missing
    if (missing && !this.messages[id]) {
      return isFunction(missing) ? missing(this.locale, id) : missing
    }

    if (process.env.NODE_ENV !== "production") {
      translation = isString(translation)
        ? this.messageFormat.compile(translation)
        : translation
    }

    if (!isFunction(translation)) return translation
    return interpolate(translation, this.locale, this.locales, this.localeData)(
      values,
      formats
    )
  }

  date(value: string | Date, format: Intl.DateTimeFormatOptions): string {
    return date(this.locales || this.locale, format)(value)
  }

  number(value: number, format: Intl.NumberFormatOptions): string {
    return number(this.locales || this.locale, format)(value)
  }
}

function setupI18n(params: setupI18nProps = {}): I18n {
  const i18n = new I18n()
  i18n.messageFormat = icu

  if (params.catalogs) i18n.loadAll(params.catalogs)
  if (params.locale) i18n.activate(params.locale, params.locales)
  if (params.missing) i18n._missing = params.missing

  return i18n
}

export { setupI18n }
