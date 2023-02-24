import { normalizeRelativePath, replacePlaceholders } from "./utils"
import mockFs from "mock-fs"

describe("replacePlaceholders", () => {
  it("should replace placeholders", () => {
    const actual = replacePlaceholders(
      "/foo/bar/{a}/{boo}/{a}/{place-holder}",
      {
        a: "a-value",
        boo: "b-value",
        ["place-holder"]: "place-holder-value",
      }
    )

    expect(actual).toBe("/foo/bar/a-value/b-value/a-value/place-holder-value")
  })

  it("should left unknown placeholders intact", () => {
    const actual = replacePlaceholders("/foo/bar/{a}/{boo}/{a}", {
      boo: "b-value",
    })

    expect(actual).toBe("/foo/bar/{a}/b-value/{a}")
  })
})

describe("normalizeRelativePath", () => {
  afterEach(() => {
    mockFs.restore()
  })

  it("should preserve absolute paths - posix", () => {
    const absolute = "/my/directory"
    expect(normalizeRelativePath(absolute)).toEqual(absolute)
  })

  it("should preserve absolute paths - win32", () => {
    const absolute = "C:\\my\\directory"
    // path remains the same, but separators are converted to posix
    expect(normalizeRelativePath(absolute)).toEqual(
      absolute.split("\\").join("/")
    )
  })

  it("directories without ending slash are correctly treated as dirs", () => {
    mockFs({
      componentA: {
        "index.js": mockFs.file(),
      },
      componentB: mockFs.file(),
    })
    // checked correctly that is a dir, cuz added that ending slash
    expect(normalizeRelativePath("./componentA")).toEqual("componentA/")
    // ComponentB is a file shouldn't add ending slash
    expect(normalizeRelativePath("./componentB")).toEqual("componentB")
  })
})
