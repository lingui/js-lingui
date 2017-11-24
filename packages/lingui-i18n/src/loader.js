// @flow
import type { Catalog } from "./i18n"

type CompiledCatalog = {
  // compiled messages
  m: { [key: string]: string | Function },

  // language data
  l: {
    // plurals
    p: Function
  }
}

export function unpackCatalog(compiled: CompiledCatalog): Catalog {
  return {
    messages: compiled.m,
    languageData: {
      plurals: compiled.l && compiled.l.p
    }
  }
}
