import { fromUrl, detect, fromNavigator, multipleDetect } from "./index"

describe("detect", () => {
  it("accepts fromUrl method", () => {
    const mock: Partial<Location> = {
      search: "?some_param=value&lang=en",
    }
    expect(detect(fromUrl("lang", mock))).toEqual("en")
  })

  it("accepts fromNavigator method", () => {
    const mock: Partial<Navigator> = {
      language: "en",
    }
    expect(detect(fromNavigator(mock))).toEqual("en")
  })

  it("accepts multiple methods", () => {
    const mock: Partial<Navigator> = {
      language: "en",
    }
    const locationMock: Partial<Location> = {
      search: "?some_param=value&lang=cz",
    }
    expect(detect(fromUrl("lang", locationMock), fromNavigator(mock))).toEqual(
      "cz",
    )
  })

  it("if not found any, returns the fallback", () => {
    const mock: Partial<Navigator> = {
      language: null,
    }
    const locationMock: Partial<Location> = {
      search: null,
    }
    const fallback = () => "it"
    expect(
      detect(fromUrl("lang", locationMock), fromNavigator(mock), fallback),
    ).toEqual("it")
  })
})

describe("multipleDetect", () => {
  it("returns multiple locales by order of occurrence", () => {
    const mock: Partial<Navigator> = {
      language: "en",
    }
    const locationMock: Partial<Location> = {
      search: "?some_param=value&lang=cz",
    }
    expect(
      multipleDetect(fromUrl("lang", locationMock), fromNavigator(mock)),
    ).toEqual(["cz", "en"])
  })
})
