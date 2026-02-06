import { mockConsole } from "@lingui/test-utils"
import {
  parsePluralFormsHeader,
  createPluralFunc,
} from "./parsePluralFormsHeader"

describe("parsePluralFormsHeader", () => {
  describe("valid plural forms headers", () => {
    it("should parse English plural forms (nplurals=2)", () => {
      const result = parsePluralFormsHeader("nplurals=2; plural=(n != 1)")

      expect(result).toBeDefined()
      expect(result?.nplurals).toBe(2)

      expect(result?.pluralsFunc(1)).toBe(0) // one
      expect(result?.pluralsFunc(0)).toBe(1) // other
    })

    it("should handle whitespace in header", () => {
      const result = parsePluralFormsHeader(
        "  nplurals = 2 ;  plural = ( n != 1 )  ",
      )

      expect(result).toBeDefined()
      expect(result?.nplurals).toBe(2)
      expect(result?.pluralsFunc(1)).toBe(0)
      expect(result?.pluralsFunc(2)).toBe(1)
    })

    it("should parse boolean return values correctly", () => {
      // Some plural forms return boolean true/false instead of numbers
      const result = parsePluralFormsHeader("nplurals=2; plural=n != 1")

      expect(result).toBeDefined()
      expect(result?.nplurals).toBe(2)

      // Boolean true should be coerced to 1, false to 0
      expect(result?.pluralsFunc(1)).toBe(0)
      expect(result?.pluralsFunc(2)).toBe(1)
    })
  })

  describe("invalid plural forms headers", () => {
    it("should return undefined for empty string", () => {
      mockConsole((console) => {
        const result = parsePluralFormsHeader("")

        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Plural-Forms header has incorrect value"),
        )
      })
    })

    it("should return undefined for malformed nplurals", () => {
      mockConsole((console) => {
        const result = parsePluralFormsHeader("invalid; plural=(n != 1)")

        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Plural-Forms header has incorrect value"),
        )
      })
    })

    it("should return undefined for missing plural expression", () => {
      mockConsole((console) => {
        const result = parsePluralFormsHeader("nplurals=2")

        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Plural-Forms header has incorrect value"),
        )
      })
    })

    it("should return undefined for invalid plural expression", () => {
      mockConsole((console) => {
        const result = parsePluralFormsHeader(
          "nplurals=2; plural=(invalid syntax",
        )

        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Plural-Forms header has incorrect value"),
        )
      })
    })

    it("should return undefined for missing semicolon separator", () => {
      mockConsole((console) => {
        const result = parsePluralFormsHeader("nplurals=2 plural=(n != 1)")

        expect(result).toBeUndefined()
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Plural-Forms header has incorrect value"),
        )
      })
    })
  })

  describe("createPluralFunc", () => {
    it("should create a function that evaluates plural expression", () => {
      const func = createPluralFunc("(n != 1)")

      expect(func(1)).toBe(0)
      expect(func(2)).toBe(1)
    })
  })
})
