import gettextPlurals from "../../gettext-plurals.json"
import { ExportedGettextPluralDef, parseExamples } from "./parseExamples"
import {
  createPluralFunc,
  parsePluralFormsHeader,
} from "./parsePluralFormsHeader"

export type GettextPluralsInfo = {
  nplurals: number
  pluralsFunc: (n: number) => number | boolean
}

const typedGettextPlurals = gettextPlurals as unknown as Record<
  string,
  ExportedGettextPluralDef
>

/**
 * Will return a PLural Definitions for a language from CLDR.
 *
 * Accepts language with a region code and fallback to a generic one if requested not found
 * @param lang
 */
export function getLanguageDef(lang: string) {
  lang = lang.replace("-", "_")

  if (typedGettextPlurals[lang]) {
    return typedGettextPlurals[lang]
  }

  // If no direct match locale found, eq `pt_PT`, try to match `pt` only.
  const [correctLang] = lang.split(/[-_]/g)

  return typedGettextPlurals[correctLang!]
}

/**
 * Returns ICU case labels in the order that gettext lists localized messages, e.g. 0,1,2 => `["one", "two", "other"]`.
 *
 * Obtaining the ICU case labels for gettext-supported inputs (gettext doesn't support fractions, even though some
 * languages have a separate case for fractional numbers) works by applying the CLDR selector to the example values
 * from CLDR database.
 */
export const mapGettextPlurals2Icu = (
  langHeader: string,
  pluralFormsHeader: string | undefined,
): string[] | undefined => {
  const def = getLanguageDef(langHeader)

  if (!def) {
    console.warn(
      `No plural forms found in CLDR database for language "${langHeader}". Please check that you specified a correct language in Language header.`,
    )
    return undefined
  }

  let gettextPluralsInfo: GettextPluralsInfo | undefined

  if (pluralFormsHeader) {
    gettextPluralsInfo = parsePluralFormsHeader(pluralFormsHeader)
  } else {
    gettextPluralsInfo = {
      nplurals: def.plurals,
      pluralsFunc: createPluralFunc(def.formula),
    }
  }

  if (!gettextPluralsInfo) {
    return undefined
  }

  const cases: string[] = [...Array(def.cases.length)]

  for (const form of def.cases) {
    const samples = parseExamples(def.examples[form])
    // both need to cast to Number - funcs test with `===` and may return boolean
    const pluralForm = Number(
      gettextPluralsInfo.pluralsFunc(Number(samples[0])),
    )

    cases[pluralForm] = form
  }

  return cases
}
