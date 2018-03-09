/* @flow */
import { interpolate } from "./context"
import { isString, isFunction, isEmpty } from "./essentials"
import t from "./t"
import { select, plural, selectOrdinal } from "./select"
import * as dev from "./dev"

type MessageOptions = {|
  defaults?: string,
  formats?: Object
|}

type LanguageData = {
  plurals?: Function
}

type Messages = { [key: string]: string | Function }

type Catalog = {
  messages: Messages,
  languageData?: LanguageData
}

type Catalogs = { [key: string]: Catalog }

type setupI18nProps = {
  language?: string,
  locales?: ?string,
  catalogs?: Catalogs,
  development?: Object
}

function getLanguageData(catalog) {
  return (catalog || {}).languageData || {}
}

function getMessages(catalog) {
  return (catalog || {}).messages || {}
}

class I18n {
  _language: string
  _locales: ?string

  // Message catalogs
  _catalogs: Catalogs

  // Messages/langauge data in active language.
  // This is optimization, so we don't perform object lookup
  // _catalogs[language] for each translation.
  _activeMessages: Messages
  _activeLanguageData: LanguageData

  _dev: Object

  t: Function
  plural: Function
  select: Function
  selectOrdinal: Function

  constructor() {
    // Messages and languageData are merged on load,
    // so we must initialize it manually
    this._activeMessages = {}
    this._catalogs = {}

    if (process.env.NODE_ENV !== "production") {
      this.t = t
      this.select = select
      this.plural = plural(this)
      this.selectOrdinal = selectOrdinal(this)
    }
  }

  get availableLanguages(): Array<string> {
    return Object.keys(this._catalogs)
  }

  get language(): string {
    return this._language
  }

  get locales(): ?string {
    return this._locales
  }

  get messages(): Messages {
    return this._activeMessages
  }

  get languageData(): LanguageData {
    return this._activeLanguageData
  }

  _cacheActiveLanguage() {
    const activeCatalog = this._catalogs[this.language]

    let languageData = getLanguageData(activeCatalog)
    if (process.env.NODE_ENV !== "production") {
      // Allow overriding data in development, useful for testing
      if (
        isEmpty(languageData) &&
        this._dev &&
        isFunction(this._dev.loadLanguageData)
      ) {
        languageData = this._dev.loadLanguageData(this.language)
      }
    }

    this._activeMessages = getMessages(activeCatalog)
    this._activeLanguageData = languageData
  }

  load(catalogs: Catalogs) {
    if (typeof catalogs !== "object") return

    // deeply merge Catalogs
    Object.keys({ ...this._catalogs, ...catalogs }).forEach(language => {
      let compiledMessages = getMessages(catalogs[language])

      if (process.env.NODE_ENV !== "production") {
        if (this._dev && isFunction(this._dev.compile)) {
          compiledMessages = Object.keys(compiledMessages).reduce(
            (dict, id) => {
              const msg = compiledMessages[id]
              dict[id] = isString(msg) ? this._dev.compile(msg) : msg
              return dict
            },
            {}
          )
        }
      }

      this._catalogs[language] = {
        messages: {
          ...getMessages(this._catalogs[language]),
          ...compiledMessages
        },
        languageData: {
          ...getLanguageData(this._catalogs[language]),
          ...getLanguageData(catalogs[language])
        }
      }
    })

    this._cacheActiveLanguage()
  }

  activate(language: string, locales?: ?string) {
    if (!language) return

    if (process.env.NODE_ENV !== "production") {
      if (this.availableLanguages.indexOf(language) === -1) {
        console.warn(`Message catalog for locale "${language}" not loaded.`)
      }
    }

    this._language = language
    this._locales = locales
    this._cacheActiveLanguage()
  }

  use(language: string, locales: string) {
    return setupI18n({
      language,
      locales: locales,
      catalogs: this._catalogs,
      development: this._dev
    })
  }

  // default translate method
  _(
    id: string,
    values: Object = {},
    { defaults, formats = {} }: MessageOptions = {}
  ) {
    let translation = this.messages[id] || defaults || id

    if (process.env.NODE_ENV !== "production") {
      if (isString(translation) && this._dev && isFunction(this._dev.compile)) {
        translation = this._dev.compile(translation)
      }
    }

    if (typeof translation !== "function") return translation
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
}

function setupI18n(params?: setupI18nProps = {}): I18n {
  const i18n = new I18n()

  if (process.env.NODE_ENV !== "production") {
    i18n._dev = dev
  }

  if (params.catalogs) i18n.load(params.catalogs)
  if (params.language) i18n.activate(params.language, params.locales)

  return i18n
}

const i18n = setupI18n()

export { setupI18n, i18n }
export type { MessageOptions, Catalog, Catalogs, LanguageData, I18n }
