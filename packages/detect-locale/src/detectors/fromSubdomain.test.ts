import { fromSubdomain } from "../"

describe("fromSubdomain detector", () => {
  it("should find a locale on the first index", () => {
    const mockedLocation: Partial<Location> = {
      href: "https://es.url.com/some_path",
    }

    expect(fromSubdomain(0, mockedLocation)).toEqual("es")
  })

  it("should find a locale on a deeper subdomain index", () => {
    const mockedLocation: Partial<Location> = {
      href: "https://www.es.example.co.uk/",
    }

    expect(fromSubdomain(1, mockedLocation)).toEqual("es")
  })

  it("should only look at the host, not at dots in the path or query", () => {
    expect(
      fromSubdomain(0, { href: "https://example.com/files/report.v2.pdf" }),
    ).toBeNull()
    expect(
      fromSubdomain(0, { href: "https://example.com/?version=1.22.333" }),
    ).toBeNull()
    expect(
      fromSubdomain(0, { href: "https://es.example.com/files/report.v2.pdf" }),
    ).toEqual("es")
  })

  it("should return null when there is no subdomain at the given index", () => {
    expect(fromSubdomain(1, { href: "https://es.url.com/" })).toBeNull()
  })
})
