import { ESCAPE_SEQUENCE_REGEX, decodeEscapeSequences } from "./escapeSequences"

describe("escapeSequences", () => {
  describe("ESCAPE_SEQUENCE_REGEX", () => {
    it("should detect valid Unicode sequences", () => {
      expect(ESCAPE_SEQUENCE_REGEX.test("\\u0041")).toBe(true)
      expect(ESCAPE_SEQUENCE_REGEX.test("text\\u0041end")).toBe(true)
    })

    it("should detect valid hex sequences", () => {
      expect(ESCAPE_SEQUENCE_REGEX.test("\\x41")).toBe(true)
      expect(ESCAPE_SEQUENCE_REGEX.test("text\\x41end")).toBe(true)
    })

    it("should not detect invalid sequences", () => {
      expect(ESCAPE_SEQUENCE_REGEX.test("\\u")).toBe(false)
      expect(ESCAPE_SEQUENCE_REGEX.test("\\u123")).toBe(false)
      expect(ESCAPE_SEQUENCE_REGEX.test("\\x")).toBe(false)
      expect(ESCAPE_SEQUENCE_REGEX.test("\\x1")).toBe(false)
      expect(ESCAPE_SEQUENCE_REGEX.test("plain text")).toBe(false)
    })
  })

  describe("decodeEscapeSequences", () => {
    describe("valid sequences", () => {
      it("should convert basic Unicode sequences", () => {
        expect(decodeEscapeSequences("\\u0041")).toBe("A")
      })

      it("should convert basic hex sequences", () => {
        expect(decodeEscapeSequences("\\x41")).toBe("A")
      })

      it("should convert mixed sequences", () => {
        expect(decodeEscapeSequences("\\u0041\\x42")).toBe("AB")
      })

      it("should handle surrogate pairs", () => {
        // 😀 emoji (U+1F600) as surrogate pair
        expect(decodeEscapeSequences("\\uD83D\\uDE00")).toBe("😀")
      })

      it("should handle special Unicode characters", () => {
        expect(decodeEscapeSequences("\\u00A0")).toBe("\u00A0") // non-breaking space
        expect(decodeEscapeSequences("\\u00A9")).toBe("©") // copyright
        expect(decodeEscapeSequences("\\u20AC")).toBe("€") // euro
      })
    })

    describe("invalid sequences (should remain unchanged)", () => {
      it("should leave incomplete sequences as-is", () => {
        expect(decodeEscapeSequences("\\u")).toBe("\\u")
        expect(decodeEscapeSequences("\\u0")).toBe("\\u0")
        expect(decodeEscapeSequences("\\u00")).toBe("\\u00")
        expect(decodeEscapeSequences("\\u000")).toBe("\\u000")
        expect(decodeEscapeSequences("\\x")).toBe("\\x")
        expect(decodeEscapeSequences("\\x0")).toBe("\\x0")
      })

      it("should leave sequences with invalid characters as-is", () => {
        expect(decodeEscapeSequences("\\u$$$$")).toBe("\\u$$$$")
        expect(decodeEscapeSequences("\\x$$")).toBe("\\x$$")
        expect(decodeEscapeSequences("\\u-123")).toBe("\\u-123")
        expect(decodeEscapeSequences("\\x-1")).toBe("\\x-1")
      })
    })

    describe("mixed valid and invalid sequences", () => {
      it("should convert valid and leave invalid unchanged", () => {
        expect(decodeEscapeSequences("\\u0041\\u123\\x42")).toBe("A\\u123B")
        expect(decodeEscapeSequences("\\u0041\\x4\\u0042")).toBe("A\\x4B")
      })
    })

    describe("edge cases", () => {
      it("should handle empty string", () => {
        expect(decodeEscapeSequences("")).toBe("")
      })

      it("should handle strings without escape sequences", () => {
        expect(decodeEscapeSequences("Hello World")).toBe("Hello World")
      })

      it("should work with case variations", () => {
        expect(decodeEscapeSequences("\\u005a")).toBe("Z") // lowercase hex
        expect(decodeEscapeSequences("\\u005A")).toBe("Z") // uppercase hex
        expect(decodeEscapeSequences("\\x5a")).toBe("Z") // lowercase hex
        expect(decodeEscapeSequences("\\x5A")).toBe("Z") // uppercase hex
      })
    })
  })
})
