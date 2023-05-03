import { interpolate, UNICODE_REGEX } from "./interpolate"
import { isString, isFunction } from "./essentials"
import { date, number } from "./formats"
import { EventEmitter } from "./eventEmitter"
import { compileMessage } from "@lingui/message-utils/compileMessage"
import type { CompiledMessage } from "@lingui/message-utils/compileMessage"

export type MessageOptions = {
  message?: string
  formats?: Formats
  comment?: string
}

export type { CompiledMessage }
export type Locale = string
export type Locales = Locale | Locale[]
export type Formats = Record<
  string,
  Intl.DateTimeFormatOptions | Intl.NumberFormatOptions
>

export type Values = Record<string, unknown>

/**
 * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
 */
export type LocaleData = {
  plurals?: (
    n: number,
    ordinal?: boolean
  ) => ReturnType<Intl.PluralRules["select"]>
}

/**
 * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
 */
export type AllLocaleData = Record<Locale, LocaleData>

export type Messages = Record<string, CompiledMessage>

export type AllMessages = Record<Locale, Messages>

export type MessageDescriptor = {
  id: string
  comment?: string
  message?: string
  values?: Record<string, unknown>
}

export type MissingMessageEvent = {
  locale: Locale
  id: string
}

type MissingHandler = string | ((locale: string, id: string) => string)

type setupI18nProps = {
  locale?: Locale
  locales?: Locales
  messages?: AllMessages
  /**
   * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
   */
  localeData?: AllLocaleData
  missing?: MissingHandler
}

type Events = {
  change: () => void
  missing: (event: MissingMessageEvent) => void
}

type LoadAndActivateOptions = {
  /** initial active locale */
  locale: Locale
  /** list of alternative locales (BCP 47 language tags) which are used for number and date formatting */
  locales?: Locales
  /** compiled message catalog */
  messages: Messages
}

export class I18n extends EventEmitter<Events> {
  private _locale: Locale
  private _locales: Locales
  private _localeData: AllLocaleData
  private _messages: AllMessages
  private _missing: MissingHandler

  constructor(params: setupI18nProps) {
    super()

    this._messages = {}
    this._localeData = {}

    if (params.missing != null) this._missing = params.missing
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

  /**
   * @deprecated this has no effect. Please remove this from the code. Deprecated in v4
   */
  get localeData(): LocaleData {
    return this._localeData[this._locale] ?? {}
  }

  private _loadLocaleData(locale: Locale, localeData: LocaleData) {
    if (this._localeData[locale] == null) {
      this._localeData[locale] = localeData
    } else {
      Object.assign(this._localeData[locale], localeData)
    }
  }

  /**
   * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
   */
  public loadLocaleData(allLocaleData: AllLocaleData): void
  /**
   * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
   */
  public loadLocaleData(locale: Locale, localeData: LocaleData): void
  /**
   * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
   */
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

  private _load(locale: Locale, messages: Messages) {
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

  /**
   * @param options {@link LoadAndActivateOptions}
   */
  loadAndActivate({ locale, locales, messages }: LoadAndActivateOptions) {
    this._locale = locale
    this._locales = locales || undefined

    this._messages[this._locale] = messages

    this.emit("change")
  }

  activate(locale: Locale, locales?: Locales) {
    if (process.env.NODE_ENV !== "production") {
      if (!this._messages[locale]) {
        console.warn(`Messages for locale "${locale}" not loaded.`)
      }
    }

    this._locale = locale
    this._locales = locales
    this.emit("change")
  }

  // method for translation and formatting
  _(descriptor: MessageDescriptor): string
  _(id: string, values?: Values, options?: MessageOptions): string
  _(
    id: MessageDescriptor | string,
    values: Values | undefined = {},
    { message, formats }: MessageOptions | undefined = {}
  ) {
    if (!isString(id)) {
      values = id.values || values
      message = id.message
      id = id.id
    }

    const messageMissing = !this.messages[id]

    // replace missing messages with custom message for debugging
    const missing = this._missing
    if (missing && messageMissing) {
      return isFunction(missing) ? missing(this._locale, id) : missing
    }

    if (messageMissing) {
      this.emit("missing", { id, locale: this._locale })
    }

    let translation = this.messages[id] || message || id

    if (process.env.NODE_ENV !== "production") {
      translation = isString(translation)
        ? compileMessage(translation)
        : translation
    }

    // hack for parsing unicode values inside a string to get parsed in react native environments
    if (isString(translation) && UNICODE_REGEX.test(translation))
      return JSON.parse(`"${translation}"`) as string
    if (isString(translation)) return translation

    return interpolate(
      translation,
      this._locale,
      this._locales
    )(values, formats)
  }

  /**
   * Alias for {@see I18n._}
   */
  t: I18n["_"] = this._.bind(this)

  date(value: string | Date, format?: Intl.DateTimeFormatOptions): string {
    return date(this._locales || this._locale, value, format)
  }

  number(value: number, format?: Intl.NumberFormatOptions): string {
    return number(this._locales || this._locale, value, format)
  }
}

function setupI18n(params: setupI18nProps = {}): I18n {
  return new I18n(params)
}

export { setupI18n }
