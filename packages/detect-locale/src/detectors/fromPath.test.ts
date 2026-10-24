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

  it("should keep locales with underscores or numeric regions intact", () => {
    expect(fromPath(0, { pathname: "/pt_BR/some/route" })).toEqual("pt_BR")
    expect(fromPath(0, { pathname: "/es-419/some/route" })).toEqual("es-419")
    expect(fromPath(1, { pathname: "/v2/en_US/some/route" })).toEqual("en_US")
  })

  it("should stop at a query string or hash when pathname carries one", () => {
    expect(fromPath(0, { pathname: "/fr?utm_source=x" })).toEqual("fr")
    expect(fromPath(0, { pathname: "/fr#section" })).toEqual("fr")
    expect(fromPath(1, { pathname: "/app/fr/route?a=b" })).toEqual("fr")
  })
})
