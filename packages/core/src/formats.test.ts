import { number } from "./formats"

describe("@lingui/core/formats", () => {
  describe("number", () => {
    it("should pass format options", () => {
      expect(number(["en"], 1000, { style: "currency", currency: "EUR" })).toBe(
        "€1,000.00",
      )

      expect(number(["en"], 1000, { maximumSignificantDigits: 3 })).toBe(
        "1,000",
      )
    })

    it("should respect passed locale(s)", () => {
      expect(number(["pl"], 1000, { style: "currency", currency: "EUR" })).toBe(
        "1000,00 €",
      )

      expect(
        number(["pl", "en-US"], 1000, { style: "currency", currency: "EUR" }),
      ).toBe("1000,00 €")
      expect(
        number(["en-US", "pl"], 1000, { style: "currency", currency: "EUR" }),
      ).toBe("€1,000.00")
    })
  })
})
