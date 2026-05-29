import { interpolate } from "./interpolate"
import { isString, isFunction } from "./essentials"
import {
  date,
  type DateTimeFormatValue,
  defaultLocale,
  number,
  type NumberFormatValue,
} from "./formats"
import { EventEmitter } from "./eventEmitter"
import { compileMessage } from "@lingui/message-utils/compileMessage"
import type { CompiledMessage } from "@lingui/message-utils/compileMessage"
import { decodeEscapeSequences, ESCAPE_SEQUENCE_REGEX } from "./escapeSequences"

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

export type UncompiledMessage = string
export type Messages = Record<string, UncompiledMessage | CompiledMessage>

export type AllMessages = Record<Locale, Messages>

/**
 * Register interface for module augmentation.
 * Users can augment this interface to narrow MessageId to a specific union type.
 *
 * @example
 * ```ts
 * // src/lingui.d.ts
 * import type enMessages from "./locales/en/messages.json";
 *
 * declare module "@lingui/core" {
 *   interface Register {
 *     messageIds: keyof typeof enMessages;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; users augment this via module augmentation
export interface Register {}

/**
 * Resolves to the registered message ID union, or falls back to `string`
 * when no augmentation exists.
 */
export type MessageId = Register extends {
  messageIds: infer TIds extends string
}
  ? TIds
  : string

export type MessageDescriptor = {
  id: MessageId
  comment?: string
  message?: string
  values?: Record<string, unknown>
}

export type MissingMessageEvent = {
  locale: Locale
  id: MessageId
}

type MissingHandler = string | ((locale: string, id: string) => string)

export type I18nProps = {
  locale?: Locale
  locales?: Locales
  messages?: AllMessages
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

export type MessageCompiler = (message: string) => CompiledMessage

export class I18n extends EventEmitter<Events> {
  private _locale: Locale = ""
  private _locales?: Locales
  private _messages: AllMessages = {}
  private _missing?: MissingHandler
  private _messageCompiler?: MessageCompiler

  constructor(params: I18nProps) {
    super()

    if (process.env.NODE_ENV !== "production") {
      this.setMessagesCompiler(compileMessage)
    }

    if (params.missing != null) this._missing = params.missing
    if (params.messages != null) this.load(params.messages)
    if (typeof params.locale === "string" || params.locales) {
      this.activate(params.locale ?? defaultLocale, params.locales)
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
   * Registers a `MessageCompiler` to enable the use of uncompiled catalogs at runtime.
   *
   * In production builds, the `MessageCompiler` is typically excluded to reduce bundle size.
   * By default, message catalogs should be precompiled during the build process. However,
   * if you need to compile catalogs at runtime, you can use this method to set a message compiler.
   *
   * Example usage:
   *
   * ```ts
   * import { compileMessage } from "@lingui/message-utils/compileMessage";
   *
   * i18n.setMessagesCompiler(compileMessage);
   * ```
   */
  setMessagesCompiler(compiler: MessageCompiler) {
    this._messageCompiler = compiler
    return this
  }
  private _load(locale: Locale, messages: Messages) {
    const maybeMessages = this._messages[locale]
    if (!maybeMessages) {
      this._messages[locale] = messages
    } else {
      Object.assign(maybeMessages, messages)
    }
  }

  load(allMessages: AllMessages): void
  load(locale: Locale, messages: Messages): void
  load(localeOrMessages: AllMessages | Locale, messages?: Messages): void {
    if (typeof localeOrMessages == "string" && typeof messages === "object") {
      // load('en', catalog)
      // Loading a catalog for a single locale.
      this._load(localeOrMessages, messages)
    } else {
      // load(catalogs)
      // Loading several locales at once.
      Object.entries(localeOrMessages).forEach(([locale, messages]) =>
        this._load(locale, messages),
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
  _(id: MessageId, values?: Values, options?: MessageOptions): string
  _(
    id: MessageDescriptor | MessageId,
    values?: Values,
    options?: MessageOptions,
  ): string {
    if (!this.locale) {
      throw new Error(
        "Lingui: Attempted to call a translation function without setting a locale.\n" +
          "Make sure to call `i18n.activate(locale)` before using Lingui functions.\n" +
          "This issue may also occur due to a race condition in your initialization logic.",
      )
    }

    let message = options?.message

    if (!id) {
      id = ""
    }

    if (!isString(id)) {
      values = id.values || values
      message = id.message
      id = id.id
    }

    const messageForId = this.messages[id]
    const messageMissing = messageForId === undefined

    // replace missing messages with custom message for debugging
    const missing = this._missing
    if (missing && messageMissing) {
      return isFunction(missing) ? missing(this._locale, id) : missing
    }

    if (messageMissing) {
      this.emit("missing", { id, locale: this._locale })
    }

    let translation = messageForId || message || id

    // Compiled message is always an array (`["Ola!"]`).
    // If a message comes as string - it's not compiled, and we need to compile it beforehand.
    if (isString(translation)) {
      if (this._messageCompiler) {
        translation = this._messageCompiler(translation)
      } else {
        console.warn(`Uncompiled message detected! Message:

> ${translation}

That means you use raw catalog or your catalog doesn't have a translation for the message and fallback was used.
ICU features such as interpolation and plurals will not work properly for that message.

Please compile your catalog first.
`)
      }
    }

    if (isString(translation) && ESCAPE_SEQUENCE_REGEX.test(translation))
      return decodeEscapeSequences(translation)
    if (isString(translation)) return translation

    return interpolate(
      translation,
      this._locale,
      this._locales,
    )(values, options?.formats)
  }

  /**
   * Alias for {@see I18n._}
   */
  t: I18n["_"] = this._.bind(this)

  /**
   * @deprecated Use `Intl.DateTimeFormat` directly. This helper will be removed.
   */
  date(
    value?: string | DateTimeFormatValue,
    format?: Intl.DateTimeFormatOptions,
  ): string {
    return date(this._locales || this._locale, value, format)
  }

  /**
   * @deprecated Use `Intl.NumberFormat` directly. This helper will be removed.
   */
  number(value: NumberFormatValue, format?: Intl.NumberFormatOptions): string {
    return number(this._locales || this._locale, value, format)
  }
}

function setupI18n(params: I18nProps = {}): I18n {
  return new I18n(params)
}

export { setupI18n }
