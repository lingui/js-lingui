import { interpolate } from "./context"
import { isString, isFunction, isEmpty } from "./essentials"
import { date, number } from "./formats"
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
  activate: (locale: string) => Promise<any>
  load: (locale: string, catalog: Catalog | null) => Promise<any>
  change: () => Promise<any>
}

export class I18n extends EventEmitter<Events> {
  _catalogs: Catalogs
  _locale: Locale
  _locales: Locales
  _missing: string | ((message, id) => string)

  constructor(params: setupI18nProps) {
    super()

    this._catalogs = {}
    if (params.catalogs != null) this._loadAll(params.catalogs)
    if (params.locale != null || params.locales != null) {
      this._activate(params.locale, params.locales)
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
    return this.catalog.localeData
  }

  private _loadAll(catalogs: Catalogs) {
    Object.keys(catalogs).map(locale => this._load(locale, catalogs[locale]))
  }

  loadAll(catalogs: Catalogs) {
    return Object.keys(catalogs).map(locale =>
      this.load(locale, catalogs[locale])
    )
  }

  private _load(locale: Locale, catalog: Catalog) {
    if (catalog == null) return

    if (this._catalogs[locale] == null) {
      this._catalogs[locale] = catalog
    } else {
      const prev = this._catalogs[locale]
      Object.assign(prev.messages, catalog.messages)
      Object.assign(prev.localeData, catalog.localeData)
    }
  }

  load(locale: Locale, catalog?: Catalog) {
    return this.emit("load", locale, catalog).then(() => {
      this._load(locale, catalog)
      return this.emit("change")
    })
  }

  private _activate(locale: Locale, locales?: Locales) {
    if (!this._catalogs[locale]) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Message catalog for locale "${locale}" not loaded.`)
      }
    }

    this._locale = locale
    this._locales = locales
  }

  activate(locale: Locale, locales?: Locales) {
    return this.emit("activate", locale).then(() => {
      this._activate(locale, locales)

      return this.emit("change")
    })
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
    let translation = this.messages[id]

    // replace missing messages with custom message for debugging
    const missing = this._missing
    if (missing && !this.messages[id]) {
      return isFunction(missing) ? missing(this.locale, id) : missing
    }

    if (!translation) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Message with id "${id}" not loaded.`)
      }

      return ""
    }

    if (isString(translation)) return translation

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
  const i18n = new I18n(params)

  if (params.missing) i18n._missing = params.missing

  return i18n
}

export { setupI18n }
