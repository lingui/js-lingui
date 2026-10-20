import { fromPath } from "../"

describe("fromPath detector", () => {
  it("should find a locale on the first index", () => {
    const mockedLocation: Partial<Location> = {
      pathname: "/fr/some/route",
    }

    expect(fromPath(0, mockedLocation)).toEqual("fr")
  })

  it("should find a locale on a deeper index", () => {
    expect(fromPath(1, { pathname: "/app/fr/some/route" })).toEqual("fr")
  })

  it("should return null when the path has no segment at the given index", () => {
    expect(fromPath(1, { pathname: "/" })).toBeNull()
  })
})
