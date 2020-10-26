import { fromUrl } from ".."

describe("fromUrl", () => {
  it ("parses correctly the param after an &", () => {
    const mock: Partial<Location> = {
      search: "?some_param=value&lang=en"
    }
    const locale = fromUrl("lang", mock)
    expect(locale).toEqual("en")
  })

  it ("parses correctly the lang after an ?", () => {
    const mock: Partial<Location> = {
      search: "?lang=es"
    }
    const locale = fromUrl("lang", mock)
    expect(locale).toEqual("es")
  })

  it ("parses correctly the lang with multiple params", () => {
    const mock: Partial<Location> = {
      search: "?lang=cs&some_other=other&otheR_params=232"
    }
    const locale = fromUrl("lang", mock)
    expect(locale).toEqual("cs")
  })

  it ("throws an error if parameter is not passed", () => {
    const mock: Partial<Location> = {
      search: "?lang=cs&some_other=other&otheR_params=232"
    }
    expect(() => { fromUrl(undefined, mock) }).toThrowError()
    expect(() => { fromUrl(undefined, mock) }).toThrowErrorMatchingSnapshot()
  })
})