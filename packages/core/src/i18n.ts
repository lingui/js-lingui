import { interpolate } from "./context"
import { isString, isFunction } from "./essentials"
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

export type AllLocaleData = Record<Locale, LocaleData>

export type CompiledMessage =
  | string
  | Array<string | Array<string | (string | undefined) | Record<string, unknown>>>;

export type Messages = Record<string, CompiledMessage>

export type AllMessages = Record<Locale, Messages>

export type MessageDescriptor = {
  id?: string
  comment?: string
  message?: string
  values?: string
}

type setupI18nProps = {
  locale?: Locale
  locales?: Locales
  messages?: AllMessages
  localeData?: AllLocaleData
  missing?: string | ((message, id) => string)
}

type Events = {
  change: () => void
}

export class I18n extends EventEmitter<Events> {
  _locale: Locale
  _locales: Locales
  _localeData: AllLocaleData
  _messages: AllMessages
  _missing: string | ((message, id) => string)

  constructor(params: setupI18nProps) {
    super()

    this._messages = {}
    this._localeData = {}

    if (params.messages != null) this.load(params.messages)
    if (params.localeData != null) this.loadLocaleData(params.localeData)
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

  get messages(): Messages {
    return this._messages[this._locale] ?? {}
  }

  get localeData(): LocaleData {
    return this._localeData[this._locale] ?? {}
  }

  _loadLocaleData(locale: Locale, localeData: LocaleData) {
    if (this._localeData[locale] == null) {
      this._localeData[locale] = localeData
    } else {
      Object.assign(this._localeData[locale], localeData)
    }
  }

  public loadLocaleData(allLocaleData: AllLocaleData): void
  public loadLocaleData(locale: Locale, localeData: LocaleData): void

  loadLocaleData(localeOrAllData, localeData?) {
    if (localeData != null) {
      // loadLocaleData('en', enLocaleData)
      // Loading locale data for a single locale.
      this._loadLocaleData(localeOrAllData, localeData)
    } else {
      // loadLocaleData(allLocaleData)
      // Loading all locale data at once.
      Object.keys(localeOrAllData).forEach((locale) =>
        this._loadLocaleData(locale, localeOrAllData[locale])
      )
    }

    this.emit("change")
  }

  _load(locale: Locale, messages: Messages) {
    if (this._messages[locale] == null) {
      this._messages[locale] = messages
    } else {
      Object.assign(this._messages[locale], messages)
    }
  }

  public load(allMessages: AllMessages): void
  public load(locale: Locale, messages: Messages): void

  load(localeOrMessages, messages?) {
    if (messages != null) {
      // load('en', catalog)
      // Loading a catalog for a single locale.
      this._load(localeOrMessages, messages)
    } else {
      // load(catalogs)
      // Loading several locales at once.
      Object.keys(localeOrMessages).forEach((locale) =>
        this._load(locale, localeOrMessages[locale])
      )
    }

    this.emit("change")
  }

  activate(locale: Locale, locales?: Locales) {
    if (process.env.NODE_ENV !== "production") {
      if (!this._messages[locale]) {
        console.warn(`Messages for locale "${locale}" not loaded.`)
      }

      if (!this._localeData[locale]) {
        console.warn(
          `Locale data for locale "${locale}" not loaded. Plurals won't work correctly.`
        )
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

  date(value: string | Date, format?: Intl.DateTimeFormatOptions): string {
    return date(this.locales || this.locale, format)(value)
  }

  number(value: number, format?: Intl.NumberFormatOptions): string {
    return number(this.locales || this.locale, format)(value)
  }
}

function setupI18n(params: setupI18nProps = {}): I18n {
  const i18n = new I18n(params)

  if (params.missing) i18n._missing = params.missing

  return i18n
}

export { setupI18n }
