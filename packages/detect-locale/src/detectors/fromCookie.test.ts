import { describe, expect, it } from "vitest";
import { fromCookie } from ".."

describe("fromCookie detector", () => {
  it("should return a correct value from the cookie stored", () => {
    Object.defineProperty(window.document, "cookie", {
      writable: true,
      value: "CONSENT=YES+ES.es+V11; SEARCH_SAMESITE=CgQI3JAB",
    })
    expect(fromCookie("CONSENT")).toEqual("YES+ES.es+V11")
    expect(fromCookie("SEARCH_SAMESITE")).toEqual("CgQI3JAB")
  })
})
