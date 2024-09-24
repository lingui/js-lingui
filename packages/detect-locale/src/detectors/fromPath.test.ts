import { describe, expect, it } from "vitest";
import { fromPath } from "../"

describe("fromPath detector", () => {
  it("should find a locale on the first index", () => {
    const mockedLocation: Partial<Location> = {
      pathname: "/fr/some/route",
    }

    expect(fromPath(0, mockedLocation)).toEqual("fr")
  })
})
