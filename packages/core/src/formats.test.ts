import { date, number } from "./formats"

describe("@lingui/core/formats", () => {
  describe("date", () => {
    it("should support Date as input", () => {
      expect(date(["en"], new Date(2023, 2, 5))).toMatchInlineSnapshot(
        `"3/5/2023"`
      )
    })
    it("should support iso string as input", () => {
      expect(
        date(["en"], new Date(2023, 2, 5).toISOString())
      ).toMatchInlineSnapshot(`"3/5/2023"`)
    })

    it("should pass format options", () => {
      expect(
        date(["en"], new Date(2023, 2, 5).toISOString(), { dateStyle: "full" })
      ).toMatchInlineSnapshot(`"Sunday, March 5, 2023"`)

      expect(
        date(["en"], new Date(2023, 2, 5).toISOString(), {
          dateStyle: "medium",
        })
      ).toMatchInlineSnapshot(`"Mar 5, 2023"`)
    })

    it("should respect passed locale", () => {
      expect(
        date(["pl"], new Date(2023, 2, 5).toISOString(), { dateStyle: "full" })
      ).toMatchInlineSnapshot(`"niedziela, 5 marca 2023"`)
    })
  })

  describe("number", () => {
    it("should pass format options", () => {
      expect(
        number(["en"], 1000, { style: "currency", currency: "EUR" })
      ).toMatchInlineSnapshot(`"€1,000.00"`)

      expect(
        number(["en"], 1000, { maximumSignificantDigits: 3 })
      ).toMatchInlineSnapshot(`"1,000"`)
    })

    it("should respect passed locale(s)", () => {
      expect(
        number(["pl"], 1000, { style: "currency", currency: "EUR" })
      ).toMatchInlineSnapshot(`"1000,00 €"`)

      expect(
        number(["pl", "en-US"], 1000, { style: "currency", currency: "EUR" })
      ).toMatchInlineSnapshot(`"1000,00 €"`)
      expect(
        number(["en-US", "pl"], 1000, { style: "currency", currency: "EUR" })
      ).toMatchInlineSnapshot(`"€1,000.00"`)
    })
  })
})
