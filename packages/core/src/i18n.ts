import { interpolate } from "./context"
import { isString, isFunction } from "./essentials"
import { date, number } from "./formats"
import * as icu from "./dev"

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
  locale: Locale
  messages: Messages
  localeData: LocaleData
  missing?: string | ((message, id) => string)
}

export class I18n {
  protected messageFormat: typeof icu
  protected locale: Locale
  protected messages: Messages
  protected localeData: LocaleData
  protected missing: string | ((message, id) => string)

  constructor(params?: setupI18nProps) {
    this.messageFormat = icu

    if (params != null) this.load(params)
  }

  load(params: setupI18nProps) {
    this.locale = params.locale
    this.messages = params.messages || {}
    this.localeData = params.localeData
    this.missing = params.missing
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
    const missing = this.missing
    if (missing && !this.messages[id]) {
      return isFunction(missing) ? missing(this.locale, id) : missing
    }

    if (process.env.NODE_ENV !== "production") {
      translation = isString(translation)
        ? this.messageFormat.compile(translation)
        : translation
    }

    if (isString(translation)) return translation

    return interpolate(translation, this.locale, this.localeData)(
      values,
      formats
    )
  }

  date(value: string | Date, format: Intl.DateTimeFormatOptions): string {
    return date(this.locale, format)(value)
  }

  number(value: number, format: Intl.NumberFormatOptions): string {
    return number(this.locale, format)(value)
  }
}
