import { list, number } from "./formats"

describe("@lingui/core/formats", () => {
  describe("number", () => {
    it("should pass format options", () => {
      expect(number(["en"], 1000, { style: "currency", currency: "EUR" })).toBe(
        "€1,000.00"
      )

      expect(number(["en"], 1000, { maximumSignificantDigits: 3 })).toBe(
        "1,000"
      )
    })

    it("should respect passed locale(s)", () => {
      expect(number(["pl"], 1000, { style: "currency", currency: "EUR" })).toBe(
        "1000,00 €"
      )

      expect(
        number(["pl", "en-US"], 1000, { style: "currency", currency: "EUR" })
      ).toBe("1000,00 €")
      expect(
        number(["en-US", "pl"], 1000, { style: "currency", currency: "EUR" })
      ).toBe("€1,000.00")
    })
  })

  describe("list", () => {
    it("should pass format options", () => {
      expect(list(["en"], ["a", "b", "c"], { type: "conjunction" })).toBe(
        "a, b, and c"
      )

      expect(list(["en"], ["a", "b", "c"], { type: "disjunction" })).toBe(
        "a, b, or c"
      )
    })

    it("should respect passed locale(s)", () => {
      expect(list(["pl"], ["a", "b", "c"], { type: "conjunction" })).toBe(
        "a, b i c"
      )

      expect(
        list(["pl", "en-US"], ["a", "b", "c"], { type: "conjunction" })
      ).toBe("a, b i c")
      expect(
        list(["en-US", "pl"], ["a", "b", "c"], { type: "conjunction" })
      ).toBe("a, b, and c")
    })
  })
})
