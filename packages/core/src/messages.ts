import { I18n } from "./i18n"

export interface MessageDescriptor {
  id?: string
  comment?: string
  message?: string
  values?: string
}

type LazyMessages<Definitions> = { [key in keyof Definitions]: Function }

export class Messages {
  private i18n: I18n

  static from<M extends { [key: string]: MessageDescriptor | string }>(messages: M) {
    return new Messages(messages) as Messages & LazyMessages<M>
  }

  private constructor(messages) {
    for (const [key, descriptor] of Object.entries(messages)) {
      if (key === "bind" || key === "i18n") {
        throw new Error("Don't use bind and i18n properties.")
      }

      Object.defineProperty(this, key, {
        get: () => values => this.i18n._(descriptor, values)
      })
    }
  }

  bind(i18n) {
    this.i18n = i18n
  }
}
