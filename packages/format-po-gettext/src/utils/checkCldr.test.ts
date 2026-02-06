import { createPluralFunc } from "./parsePluralFormsHeader"
import plurals from "../../gettext-plurals.json"
import { ExportedGettextPluralDef, parseExamples } from "./parseExamples"

const gettextplurals = plurals as unknown as Record<
  string,
  ExportedGettextPluralDef
>

describe("validate lingui utils against cldr database", () => {
  Object.keys(gettextplurals).forEach((lang) => {
    const def = gettextplurals[lang] as ExportedGettextPluralDef

    const pluralFn = createPluralFunc(def.formula)

    for (const [form, samples] of Object.entries(def.examples)) {
      it(`lang: ${lang} ${form}`, () => {
        for (const example of parseExamples(samples)) {
          expect(def.cases[pluralFn(example)]).toBe(form)
        }
      })
    }
  })
})
