import { date, number, relative } from "./formats"

describe("@lingui/core/formats", () => {
  describe("date", () => {
    it("should support Date as input", () => {
      expect(date(["en"], new Date(2023, 2, 5))).toBe("3/5/2023")
    })
    it("should support iso string as input", () => {
      expect(date(["en"], new Date(2023, 2, 5).toISOString())).toBe("3/5/2023")
    })

    it("should pass format options", () => {
      expect(
        date(["en"], new Date(2023, 2, 5).toISOString(), { dateStyle: "full" })
      ).toBe("Sunday, March 5, 2023")

      expect(
        date(["en"], new Date(2023, 2, 5).toISOString(), {
          dateStyle: "medium",
        })
      ).toBe("Mar 5, 2023")
    })

    it("should respect passed locale", () => {
      expect(
        date(["pl"], new Date(2023, 2, 5).toISOString(), { dateStyle: "full" })
      ).toBe("niedziela, 5 marca 2023")
    })
  })

  describe("relative", () => {
    it("should support number as input", () => {
      expect(relative(["en"], 0, "day")).toBe("in 0 days");
      expect(relative(["en"], 1, "day")).toBe("in 1 day");
      expect(relative(["en"], -1, "day")).toBe("1 day ago");
    });
  
    it("should pass format options", () => {
      expect(
        relative(["en"], 0, "day", { numeric: "auto" })
      ).toBe("today");
      expect(
        relative(["en"], 1, "day", { numeric: "auto" })
      ).toBe("tomorrow");
      expect(
        relative(["en"], 1, "day", { numeric: "always" })
      ).toBe("in 1 day");
      expect(
        relative(["en"], -1, "day", { numeric: "always" })
      ).toBe("1 day ago");
    });
  
    it("should respect passed locale", () => {
      expect(
        relative(["pl"], 1, "day", { numeric: "always" })
      ).toBe("za 1 dzień");
    });
  });

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
})
