import { fromSubdomain } from "../"

describe("fromSubdomain detector", () => {
  it("should find a locale on the first index", () => {
    const mockedLocation: Partial<Location> = {
      href: "https://es.url.com/some_path",
    }

    expect(fromSubdomain(0, mockedLocation)).toEqual("es")
  })
})
