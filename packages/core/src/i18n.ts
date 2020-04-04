import { interpolate } from "./context"
import { isString, isFunction, isEmpty } from "./essentials"
import { date, number } from "./formats"
import * as icu from "./dev"
import { EventEmitter } from "./eventEmitter"

export type MessageOptions = {
  message?: string
  formats?: Object
}

export type Locale = string
export type Locales = Locale | Locale[]

export type LocaleData = {
  plurals?: Function
}

export type CompiledMessage =
  | string
  | Array<string | [string, string?, (string | Object)?]>

export type Messages = { [msgId: string]: CompiledMessage }

export interface MessageDescriptor {
  id?: string
  comment?: string
  message?: string
  values?: string
}

export type Catalog = {
  messages: Messages
  localeData?: LocaleData
}

export type Catalogs = { [locale: string]: Catalog }

type setupI18nProps = {
  locale?: Locale
  locales?: Locales
  catalogs?: Catalogs
  missing?: string | ((message, id) => string)
}

type Events = {
  change: () => void
}

export class I18n extends EventEmitter<Events> {
  _catalogs: Catalogs
  _locale: Locale
  _locales: Locales
  _missing: string | ((message, id) => string)

  constructor(params: setupI18nProps) {
    super()

    this._catalogs = {}
    if (params.catalogs != null) this.loadAll(params.catalogs)
    if (params.locale != null || params.locales != null) {
      this.activate(params.locale, params.locales)
    }
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
          messages: {},
        }
      }
      if (isEmpty(this.catalog.localeData)) {
        this.catalog.localeData = icu.loadLocaleData(this._locale)
      }
    }
    return this.catalog.localeData
  }

  loadAll(catalogs: Catalogs) {
    Object.keys(catalogs).map((locale) =>
      this.load(locale, catalogs[locale], true)
    )
    this.emit("change")
  }

  load(locale: Locale, catalog?: Catalog, bulk = false) {
    if (catalog == null) return

    if (this._catalogs[locale] == null) {
      this._catalogs[locale] = catalog
    } else {
      const prev = this._catalogs[locale]
      Object.assign(prev.messages, catalog.messages)
      Object.assign(prev.localeData, catalog.localeData)
    }

    if (!bulk) this.emit("change")
  }

  activate(locale: Locale, locales?: Locales) {
    if (!this._catalogs[locale]) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Message catalog for locale "${locale}" not loaded.`)
      }
    }

    this._locale = locale
    this._locales = locales
    this.emit("change")
  }

  // default translate method
  _(
    id: MessageDescriptor | string,
    values: Object | undefined = {},
    { message, formats }: MessageOptions | undefined = {}
  ) {
    if (!isString(id)) {
      values = id.values || values
      message = id.message
      id = id.id
    }
    let translation = this.messages[id] || message || id

    // replace missing messages with custom message for debugging
    const missing = this._missing
    if (missing && !this.messages[id]) {
      return isFunction(missing) ? missing(this.locale, id) : missing
    }

    if (process.env.NODE_ENV !== "production") {
      translation = isString(translation)
        ? icu.compile(translation)
        : translation
    }

    if (isString(translation)) return translation

    return interpolate(
      translation,
      this.locale,
      this.locales,
      this.localeData
    )(values, formats)
  }

  date(value: string | Date, format: Intl.DateTimeFormatOptions): string {
    return date(this.locales || this.locale, format)(value)
  }

  number(value: number, format: Intl.NumberFormatOptions): string {
    return number(this.locales || this.locale, format)(value)
  }
}

function setupI18n(params: setupI18nProps = {}): I18n {
  const i18n = new I18n(params)

  if (params.missing) i18n._missing = params.missing

  return i18n
}

export { setupI18n }
