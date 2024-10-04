import { afterEach, describe, expect, it } from "vitest";
import {
  makePathRegexSafe,
  normalizeRelativePath,
  replacePlaceholders,
} from "./utils"
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

  it("should replace to empty string", () => {
    const actual = replacePlaceholders("/foo/bar/{a}.file", {
      a: "",
    })

    expect(actual).toBe("/foo/bar/.file")
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

describe("makePathRegexSafe", () => {
  it("should not modify paths without special characters", () => {
    const path = "src/components/test.tsx"
    expect(makePathRegexSafe(path)).toBe(path)
  })

  it("should escape parentheses", () => {
    const path = "src/(components)/test.tsx"
    expect(makePathRegexSafe(path)).toBe("src/\\(components\\)/test.tsx")
  })

  it("should escape square brackets", () => {
    const path = "src/[components]/test.tsx"
    expect(makePathRegexSafe(path)).toBe("src/\\[components\\]/test.tsx")
  })

  it("should escape curly braces", () => {
    const path = "src/{components}/test.tsx"
    expect(makePathRegexSafe(path)).toBe("src/\\{components\\}/test.tsx")
  })

  it("should escape caret symbol", () => {
    const path = "src/^components/test.tsx"
    expect(makePathRegexSafe(path)).toBe("src/\\^components/test.tsx")
  })

  it("should escape dollar sign", () => {
    const path = "src/$components/test.tsx"
    expect(makePathRegexSafe(path)).toBe("src/\\$components/test.tsx")
  })

  it("should escape plus sign", () => {
    const path = "src/+components/test.tsx"
    expect(makePathRegexSafe(path)).toBe("src/\\+components/test.tsx")
  })

  it("should handle multiple special characters", () => {
    const path = "src/components/test(1)[2]{3}^$+.tsx"
    expect(makePathRegexSafe(path)).toBe(
      "src/components/test\\(1\\)\\[2\\]\\{3\\}\\^\\$\\+.tsx"
    )
  })

  it("should handle paths with spaces", () => {
    const path = "src/components/test component.tsx"
    expect(makePathRegexSafe(path)).toBe("src/components/test component.tsx")
  })

  it("should handle empty string", () => {
    expect(makePathRegexSafe("")).toBe("")
  })

  it("should handle root-level path", () => {
    const path = "test.tsx"
    expect(makePathRegexSafe(path)).toBe("test.tsx")
  })

  it("should handle relative paths", () => {
    const path = "./src/components/test[1].tsx"
    expect(makePathRegexSafe(path)).toBe("./src/components/test\\[1\\].tsx")
  })

  it("should handle paths with consecutive special characters", () => {
    const path = "src/components/test[[]].tsx"
    expect(makePathRegexSafe(path)).toBe("src/components/test\\[\\[\\]\\].tsx")
  })
})
