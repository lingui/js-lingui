import { mockConsole } from "@lingui/test-utils"
import { getLanguageDef, mapGettextPlurals2Icu } from "./mapGettextPlurals2Icu"

describe("mapGettextPlurals2Icu", () => {
  describe("basic language mappings", () => {
    it("should map English (simple 2-form)", () => {
      const result = mapGettextPlurals2Icu("en", undefined)
      expect(result).toEqual(["one", "other"])
    })

    it("should map Polish (3-form)", () => {
      const result = mapGettextPlurals2Icu("pl", undefined)
      expect(result).toEqual(["one", "few", "other"])
    })

    it("should map Russian (3-form)", () => {
      const result = mapGettextPlurals2Icu("ru", undefined)
      expect(result).toEqual(["one", "few", "other"])
    })
  })

  describe("language code variants", () => {
    it("should handle language codes with hyphen", () => {
      const result = getLanguageDef("en-US")
      expect(result!.name).toMatchInlineSnapshot(`"English"`)
    })

    it("should handle language codes with underscore", () => {
      const result = getLanguageDef("en_GB")
      expect(result!.name).toMatchInlineSnapshot(`"English"`)
    })

    it("should handle language codes without region", () => {
      const result = getLanguageDef("en")
      expect(result!.name).toMatchInlineSnapshot(`"English"`)
    })

    it("should handle pt-PT specifically", () => {
      expect(getLanguageDef("pt_PT")!.name).toMatchInlineSnapshot(
        `"European Portuguese"`,
      )
      expect(getLanguageDef("pt")!.name).toMatchInlineSnapshot(`"Portuguese"`)
    })

    it("should return undefined if for unknown language", () => {
      expect(getLanguageDef("xyz")).toBeUndefined()
    })
  })

  describe("unknown language handling", () => {
    it("should return undefined for unknown language", () => {
      mockConsole((console) => {
        const result = mapGettextPlurals2Icu("xyz", undefined)
        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            'No plural forms found in CLDR database for language "xyz"',
          ),
        )
      })
    })

    it("should return undefined for empty language", () => {
      mockConsole((console) => {
        const result = mapGettextPlurals2Icu("", undefined)
        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            'No plural forms found in CLDR database for language ""',
          ),
        )
      })
    })
  })

  describe("with pluralFormsHeader", () => {
    it("should use pluralFormsHeader when provided", () => {
      const result = mapGettextPlurals2Icu("en", "nplurals=2; plural=(n != 1)")
      expect(result).toEqual(["one", "other"])
    })

    it("should use custom header with language's CLDR cases structure", () => {
      // Polish has 3 forms in CLDR database, but custom header with nplurals=2
      // The result array length is based on CLDR cases, with custom formula applied
      const result = mapGettextPlurals2Icu("pl", "nplurals=2; plural=(n != 1)")
      // Polish CLDR has 3 cases: ["one", "few", "other"]
      // With custom formula (n != 1): n=1 maps to form 0 (one), other numbers map to form 1
      // Since both "few" and "other" examples map to form 1, the last one processed wins
      expect(result).toEqual(["one", "other", undefined])
    })

    it("should handle complex plural formula from header", () => {
      const result = mapGettextPlurals2Icu(
        "ru",
        "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)",
      )
      expect(result).toEqual(["one", "few", "other"])
    })

    it("should return undefined when pluralFormsHeader is invalid", () => {
      mockConsole((console) => {
        const result = mapGettextPlurals2Icu("en", "invalid header")
        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalled()
      })
    })

    it("should handle plural forms with boolean returns", () => {
      const result = mapGettextPlurals2Icu("en", "nplurals=2; plural=n != 1")
      expect(result).toEqual(["one", "other"])
    })

    it("should handle whitespace in pluralFormsHeader", () => {
      const result = mapGettextPlurals2Icu(
        "en",
        "  nplurals = 2 ;  plural = ( n != 1 )  ",
      )
      expect(result).toEqual(["one", "other"])
    })
  })

  describe("special test for European Portuguese", () => {
    it("should handle pt_PT as distinct from pt", () => {
      const ptResult = mapGettextPlurals2Icu("pt", undefined)
      const ptPTResult = mapGettextPlurals2Icu("pt_PT", undefined)

      // Both should return valid results
      expect(ptResult).toEqual(["one", "many", "other"])
      expect(ptPTResult).toEqual(["one", "many", "other"])
    })
  })
})
